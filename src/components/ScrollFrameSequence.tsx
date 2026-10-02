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

function frameSrc(index: number) {
  const n = String(index).padStart(FRAME_PAD, "0");
  return `/scroll-frames/frame_${n}.jpg`;
}

type ScrollFrameSequenceProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * Full-page scroll scrub: fixed canvas advances through JPG frames
 * based on overall document scroll progress (not just the hero).
 */
export function ScrollFrameSequence({
  children,
  className = "",
}: ScrollFrameSequenceProps) {
  const reduceMotion = useReducedMotion();
  const lenis = useLenis();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const frameRef = useRef(0);
  const rafDrawRef = useRef(0);
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
  }, []);

  const scheduleDraw = useCallback(
    (index: number) => {
      frameRef.current = index;
      cancelAnimationFrame(rafDrawRef.current);
      rafDrawRef.current = requestAnimationFrame(() => {
        drawFrame(frameRef.current);
      });
    },
    [drawFrame],
  );

  const pickLoadedFrame = useCallback((target: number) => {
    if (imagesRef.current[target]) return target;
    let best = target;
    let dist = Infinity;
    for (let i = 0; i < FRAME_COUNT; i++) {
      if (!imagesRef.current[i]) continue;
      const d = Math.abs(i - target);
      if (d < dist) {
        dist = d;
        best = i;
      }
    }
    return best;
  }, []);

  // Preload frames
  useEffect(() => {
    if (reduceMotion) {
      const img = new Image();
      img.src = urls[0];
      img.onload = () => {
        imagesRef.current[0] = img;
        setLoadedCount(1);
        setReady(true);
        scheduleDraw(0);
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
              scheduleDraw(0);
            }
          }
          resolve();
        };
        img.onerror = () => resolve();
      });
    }

    void (async () => {
      const sparse = Array.from(
        { length: Math.ceil(FRAME_COUNT / 6) },
        (_, k) => k * 6,
      ).filter((i) => i < FRAME_COUNT);
      await Promise.all(sparse.map(loadOne));
      if (cancelled) return;

      const rest = Array.from({ length: FRAME_COUNT }, (_, i) => i).filter(
        (i) => !sparse.includes(i),
      );
      const batch = 12;
      for (let i = 0; i < rest.length; i += batch) {
        if (cancelled) return;
        await Promise.all(rest.slice(i, i + batch).map(loadOne));
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafDrawRef.current);
    };
  }, [urls, reduceMotion, scheduleDraw]);

  // Full-page scroll → frame
  useEffect(() => {
    if (reduceMotion) return;

    function update() {
      let p = 0;
      if (lenis && lenis.limit > 0) {
        p = Math.min(1, Math.max(0, lenis.scroll / lenis.limit));
      } else {
        const doc = document.documentElement;
        const total = doc.scrollHeight - window.innerHeight;
        if (total > 0) {
          p = Math.min(1, Math.max(0, window.scrollY / total));
        }
      }

      setProgress(p);
      const target = Math.round(p * (FRAME_COUNT - 1));
      scheduleDraw(pickLoadedFrame(target));
    }

    update();

    if (lenis) {
      const unsub = lenis.on("scroll", update);
      window.addEventListener("resize", update);
      return () => {
        unsub();
        window.removeEventListener("resize", update);
      };
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [lenis, reduceMotion, scheduleDraw, pickLoadedFrame]);

  useEffect(() => {
    function onResize() {
      scheduleDraw(frameRef.current);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [scheduleDraw]);

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
              className="h-full rounded-full bg-primary transition-[width] duration-75"
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
