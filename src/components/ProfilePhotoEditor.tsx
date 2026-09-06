"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Icon } from "./Icon";

const OUTPUT_SIZE = 400;

type ProfilePhotoEditorProps = {
  open: boolean;
  imageSrc: string | null;
  onCancel: () => void;
  onSave: (croppedDataUrl: string) => void;
};

export function ProfilePhotoEditor({
  open,
  imageSrc,
  onCancel,
  onSave,
}: ProfilePhotoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [viewport, setViewport] = useState(280);

  useEffect(() => {
    if (!open) return;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [open, imageSrc]);

  useEffect(() => {
    if (!open) return;
    const node = containerRef.current;
    if (!node) return;

    const update = () => {
      const size = Math.min(320, node.clientWidth);
      setViewport(size);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [open]);

  const clampOffset = useCallback(
    (nextZoom: number, nextOffset: { x: number; y: number }) => {
      if (!natural.w || !natural.h) return nextOffset;
      const scaledW = natural.w * nextZoom;
      const scaledH = natural.h * nextZoom;
      const maxX = Math.max(0, (scaledW - viewport) / 2);
      const maxY = Math.max(0, (scaledH - viewport) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, nextOffset.x)),
        y: Math.min(maxY, Math.max(-maxY, nextOffset.y)),
      };
    },
    [natural.h, natural.w, viewport],
  );

  function handleImageLoad() {
    const img = imageRef.current;
    if (!img) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    setNatural({ w, h });
    const fit = Math.max(viewport / w, viewport / h);
    setMinZoom(fit);
    setZoom(fit);
    setOffset({ x: 0, y: 0 });
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      ox: offset.x,
      oy: offset.y,
    };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    setOffset(
      clampOffset(zoom, {
        x: dragStart.current.ox + dx,
        y: dragStart.current.oy + dy,
      }),
    );
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  }

  function handleZoomChange(value: number) {
    const nextZoom = Math.max(minZoom, value);
    setZoom(nextZoom);
    setOffset((prev) => clampOffset(nextZoom, prev));
  }

  function handleSave() {
    if (!imageSrc || !natural.w) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      const scaledW = natural.w * zoom;
      const scaledH = natural.h * zoom;
      const drawX = (viewport - scaledW) / 2 + offset.x;
      const drawY = (viewport - scaledH) / 2 + offset.y;
      const scale = OUTPUT_SIZE / viewport;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      ctx.beginPath();
      ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(
        img,
        drawX * scale,
        drawY * scale,
        scaledW * scale,
        scaledH * scale,
      );

      onSave(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.src = imageSrc;
  }

  if (!open || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md border border-border-subtle bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Adjust profile photo
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-on-surface-variant hover:text-on-background"
            aria-label="Close"
          >
            <Icon name="close" />
          </button>
        </div>

        <p className="mb-3 text-xs text-on-surface-variant">
          Drag to reposition and use zoom so your face fills the circle.
        </p>

        <div
          ref={containerRef}
          className="relative mx-auto overflow-hidden rounded-full bg-surface-container touch-none"
          style={{ width: viewport, height: viewport }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Crop preview"
            draggable={false}
            onLoad={handleImageLoad}
            className="absolute left-1/2 top-1/2 max-w-none select-none"
            style={{
              width: natural.w ? natural.w * zoom : "auto",
              height: natural.h ? natural.h * zoom : "auto",
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              cursor: dragging ? "grabbing" : "grab",
            }}
          />
          <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-primary/80" />
        </div>

        <label className="mt-5 block">
          <span className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            <span>Zoom</span>
            <span>{Math.round((zoom / minZoom) * 100)}%</span>
          </span>
          <input
            type="range"
            min={minZoom}
            max={minZoom * 3}
            step={0.01}
            value={zoom}
            onChange={(event) => handleZoomChange(Number(event.target.value))}
            className="w-full accent-[var(--color-primary,#e85d2c)]"
          />
        </label>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-border-subtle px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-on-background"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 bg-primary px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-primary-container"
          >
            Save photo
          </button>
        </div>
      </div>
    </div>
  );
}
