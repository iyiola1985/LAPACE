"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProCardCompact } from "@/components/ProCardCompact";
import type { Professional } from "@/lib/data";
import { countVerifiedPros, listMarketplacePros } from "@/lib/marketplace";

export function FeaturedPros() {
  const [pros, setPros] = useState<Professional[]>([]);
  const [liveCount, setLiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [next, verified] = await Promise.all([
          listMarketplacePros(),
          countVerifiedPros(),
        ]);
        if (!cancelled) {
          setPros(next.slice(0, 3));
          setLiveCount(verified);
        }
      } catch {
        if (!cancelled) setPros([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-white px-4 py-14 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="accent-underline text-2xl font-bold uppercase tracking-wide text-on-background md:text-3xl">
              Verified Professionals
            </h2>
            <p className="mt-4 text-base text-on-surface-variant">
              {liveCount > 0
                ? "Lapace-verified contractors ready for your project."
                : "Sample listings shown until Lapace verifies live contractors."}
            </p>
          </div>
          <Link
            href="/pros"
            className="hidden text-xs font-bold uppercase tracking-[0.12em] text-primary hover:underline md:inline-flex"
          >
            View Directory →
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading professionals...</p>
        ) : pros.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            No professionals yet.{" "}
            <Link href="/register/pro" className="text-primary underline">
              Register as a pro
            </Link>{" "}
            or browse the directory after Admin verification.
          </p>
        ) : (
          <div className="scrollbar-hide flex snap-x gap-4 overflow-x-auto pb-4">
            {pros.map((pro) => (
              <ProCardCompact key={pro.id} pro={pro} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
