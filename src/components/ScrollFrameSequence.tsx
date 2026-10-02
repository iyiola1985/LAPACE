"use client";

import { useLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const FRAME_COUNT = 180;
const FRAME_PAD = 4;
/** Bump when replacing frame assets so browsers skip stale cached JPGs. */
const FRAME_CACHE_VERSION = "hq-30fps-v2";
/** How quickly the canvas catches scroll target (lower = smoother, esp. reversing from 100%). */
const FRAME_LERP = 0.14;
const FRAME_SNAP_EPSILON = 0.08;

function frameSrc(index: number) {
  const n = String(index).padStart(FRAME_PAD, "0");
  return `/scroll-frames/frame_${n}.jpg?v=${FRAME_CACHE_VERSION}`;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

type ScrollFrameSequenceProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * Full-page scroll scrub: fixed canvas advances through JPG frames
 * based on overall document scroll progress (not just the hero).
 * Displayed frame is lerped so reversing from 100% stays smooth.
 */
export function ScrollFrameSequence({
  children,
  className = "",
}: ScrollFrameSequenceProps) {
  const reduceMotion = useReducedMotion();
  const lenis = useLenis();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const targetFrameRef = useRef(0);
  const displayFrameRef = useRef(0);
  const drawnFrameRef = useRef(-1);
  const rafLoopRef = useRef(0);
  const progressUiRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [progress, setProgress] = useState(0);

  const urls = useMemo(
    () => Array.from({ length: FRAME_COUNT }, (_, i) => frameSrc(i + 1)),
    [],
  );

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { clientWidth: w, clientHeight: h } = canvas;
    if (w === 0 || h === 0) return;

    if (
      canvas.width !== Math.round(w * dpr) ||
      canvas.height !== Math.round(h * dpr)
    ) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
    drawnFrameRef.current = index;
  }, []);

  const pickLoadedFrame = useCallback((target: number) => {
    const rounded = Math.round(target);
    if (imagesRef.current[rounded]) return rounded;

    // Prefer the nearest loaded frame in the travel direction when reversing.
    const from = Math.round(displayFrameRef.current);
    const dir = rounded >= from ? 1 : -1;
    for (let step = 0; step < FRAME_COUNT; step++) {
      const a = rounded + step * dir;
      const b = rounded - step * dir;
      if (a >= 0 && a < FRAME_COUNT && imagesRef.current[a]) return a;
      if (b >= 0 && b < FRAME_COUNT && imagesRef.current[b]) return b;
    }
    return from;
  }, []);

  const readScrollProgress = useCallback(() => {
    if (lenis && lenis.limit > 0) {
      return clamp01(lenis.scroll / lenis.limit);
    }
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    if (total <= 0) return 0;
    return clamp01(window.scrollY / total);
  }, [lenis]);

  // Preload frames
  useEffect(() => {
    if (reduceMotion) {
      const img = new Image();
      img.src = urls[0];
      img.onload = () => {
        imagesRef.current[0] = img;
        setLoadedCount(1);
        setReady(true);
        drawFrame(0);
      };
      return;
    }

    let cancelled = false;
    imagesRef.current = Array.from({ length: FRAME_COUNT }, () => null);
    let done = 0;

    function loadOne(i: number): Promise<void> {
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.src = urls[i];
        img.onload = () => {
          if (!cancelled) {
            imagesRef.current[i] = img;
            done += 1;
            setLoadedCount(done);
            if (i === 0) {
              setReady(true);
              drawFrame(0);
            }
          }
          resolve();
        };
        img.onerror = () => resolve();
      });
    }

    void (async () => {
      // Prioritize start + end so reversing from 100% has frames ready.
      const priority = Array.from(
        new Set([
          ...Array.from({ length: Math.ceil(FRAME_COUNT / 6) }, (_, k) => k * 6),
          FRAME_COUNT - 1,
          FRAME_COUNT - 2,
          FRAME_COUNT - 3,
          FRAME_COUNT - 6,
          FRAME_COUNT - 12,
          0,
          1,
          2,
        ]),
      ).filter((i) => i >= 0 && i < FRAME_COUNT);

      await Promise.all(priority.map(loadOne));
      if (cancelled) return;

      const rest = Array.from({ length: FRAME_COUNT }, (_, i) => i).filter(
        (i) => !priority.includes(i),
      );
      const batch = 12;
      for (let i = 0; i < rest.length; i += batch) {
        if (cancelled) return;
        await Promise.all(rest.slice(i, i + batch).map(loadOne));
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafLoopRef.current);
    };
  }, [urls, reduceMotion, drawFrame]);

  // Continuous lerp loop: keeps reverse from 100% buttery instead of frame-snapping.
  useEffect(() => {
    if (reduceMotion) return;

    let running = true;

    function tick() {
      if (!running) return;

      const p = readScrollProgress();
      targetFrameRef.current = p * (FRAME_COUNT - 1);

      const target = targetFrameRef.current;
      const current = displayFrameRef.current;
      const delta = target - current;

      if (Math.abs(delta) < FRAME_SNAP_EPSILON) {
        displayFrameRef.current = target;
      } else {
        displayFrameRef.current = current + delta * FRAME_LERP;
      }

      const nextIndex = pickLoadedFrame(displayFrameRef.current);
      if (nextIndex !== drawnFrameRef.current) {
        drawFrame(nextIndex);
      }

      // Throttle React progress UI so reverse scroll isn't hitchy from re-renders.
      if (Math.abs(p - progressUiRef.current) >= 0.005 || p === 0 || p === 1) {
        progressUiRef.current = p;
        setProgress(p);
      }

      rafLoopRef.current = requestAnimationFrame(tick);
    }

    rafLoopRef.current = requestAnimationFrame(tick);

    function syncTarget() {
      const p = readScrollProgress();
      targetFrameRef.current = p * (FRAME_COUNT - 1);
    }

    if (lenis) {
      const unsub = lenis.on("scroll", syncTarget);
      window.addEventListener("resize", syncTarget);
      return () => {
        running = false;
        cancelAnimationFrame(rafLoopRef.current);
        unsub();
        window.removeEventListener("resize", syncTarget);
      };
    }

    window.addEventListener("scroll", syncTarget, { passive: true });
    window.addEventListener("resize", syncTarget);
    return () => {
      running = false;
      cancelAnimationFrame(rafLoopRef.current);
      window.removeEventListener("scroll", syncTarget);
      window.removeEventListener("resize", syncTarget);
    };
  }, [lenis, reduceMotion, readScrollProgress, pickLoadedFrame, drawFrame]);

  useEffect(() => {
    function onResize() {
      drawnFrameRef.current = -1;
      drawFrame(pickLoadedFrame(displayFrameRef.current));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [drawFrame, pickLoadedFrame]);

  const loadPct = Math.round((loadedCount / FRAME_COUNT) * 100);

  return (
    <div className={`relative ${className}`}>
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-surface-dark"
        aria-hidden
      >
        <canvas ref={canvasRef} className="h-full w-full" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {!ready ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dark">
          <p className="text-sm font-medium tracking-wide text-white/70">
            Loading sequence… {loadPct}%
          </p>
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-full flex-1 flex-col">
        {children}
      </div>

      {!reduceMotion ? (
        <div className="pointer-events-none fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2 md:bottom-8">
          <div className="h-1 w-32 overflow-hidden rounded-full bg-white/25 shadow-sm">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-100 ease-out"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm">
            Scroll · {Math.round(progress * 100)}%
          </span>
        </div>
      ) : null}
    </div>
  );
}
