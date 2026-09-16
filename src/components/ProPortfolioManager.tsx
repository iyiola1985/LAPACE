"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  deletePortfolioItem,
  listPortfolio,
  uploadPortfolioImages,
  type PortfolioItem,
} from "@/lib/portfolio";

type ProPortfolioManagerProps = {
  proId: string;
};

export function ProPortfolioManager({ proId }: ProPortfolioManagerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadLabel, setUploadLabel] = useState("");

  useEffect(() => {
    let cancelled = false;

    void listPortfolio(proId)
      .then((portfolio) => {
        if (!cancelled) setItems(portfolio);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load portfolio.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [proId]);

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setError("");
    setUploading(true);
    setUploadLabel(
      files.length === 1 ? "Uploading 1 picture..." : `Uploading ${files.length} pictures...`,
    );

    try {
      const uploaded = await uploadPortfolioImages(proId, files);
      setItems((current) => [...current, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      setUploadLabel("");
    }
  }

  async function handleDelete(item: PortfolioItem) {
    if (!window.confirm("Remove this picture from your portfolio?")) return;

    setError("");
    try {
      await deletePortfolioItem(item);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove picture.");
    }
  }

  return (
    <section className="mt-8 border border-border-subtle bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-bold uppercase tracking-wide">Project Portfolio</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Add as many completed-project pictures as you need. Each image can
            be up to 10 MB.
          </p>
        </div>
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="bg-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Add Pictures"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(event) => void handleFiles(event)}
          className="sr-only"
        />
      </div>

      {uploadLabel ? (
        <p className="mt-4 text-sm font-semibold text-primary">{uploadLabel}</p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-status-urgent">{error}</p>
      ) : null}

      {loading ? (
        <p className="mt-6 text-sm text-on-surface-variant">
          Loading portfolio...
        </p>
      ) : items.length === 0 ? (
        <div className="mt-6 border border-dashed border-border-subtle bg-surface-container-low p-8 text-center">
          <p className="text-sm font-semibold">No project pictures yet</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Upload completed roofing work to help clients choose you.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden border border-border-subtle bg-surface-container-lowest"
            >
              <div className="aspect-[4/3] overflow-hidden bg-surface-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.title || "Roofing project"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <p className="min-w-0 truncate text-xs font-semibold">
                  {item.title || "Roofing project"}
                </p>
                <button
                  type="button"
                  onClick={() => void handleDelete(item)}
                  className="shrink-0 text-xs font-bold uppercase text-status-urgent hover:underline"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
