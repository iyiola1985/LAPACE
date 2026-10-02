"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  ProfileMediaCard,
  ProfilePillButton,
} from "@/components/ProfileMediaCard";
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
    <section className="mt-8 rounded-[1.5rem] border border-white/15 bg-white/92 p-5 text-[#2c2c2c] shadow-lg backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Project Portfolio</h2>
          <p className="mt-1 text-sm text-[#555555]">
            Add as many completed-project pictures as you need. Each image can
            be up to 10 MB.
          </p>
        </div>
        <ProfilePillButton
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          variant="brand"
        >
          {uploading ? "Uploading..." : "Add Pictures +"}
        </ProfilePillButton>
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
        <p className="mt-6 text-sm text-[#555555]">Loading portfolio...</p>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-black/15 bg-black/[0.03] p-8 text-center">
          <p className="text-sm font-semibold">No project pictures yet</p>
          <p className="mt-1 text-xs text-[#555555]">
            Upload completed roofing work to help clients choose you.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item) => (
            <ProfileMediaCard
              key={item.id}
              image={item.imageUrl}
              imageAlt={item.title || "Roofing project"}
              title={item.title || "Roofing project"}
              subtitle="Portfolio project"
              aspectClassName="aspect-[4/5] min-h-[240px]"
              primaryAction={
                <ProfilePillButton
                  onClick={() => void handleDelete(item)}
                  variant="ghost"
                >
                  Remove
                </ProfilePillButton>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
