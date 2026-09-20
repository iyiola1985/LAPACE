"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Material } from "@/lib/data";
import { useQuote } from "./QuoteProvider";
import { Icon } from "./Icon";

type MaterialCardProps = {
  material: Material;
};

export function MaterialCard({ material }: MaterialCardProps) {
  const router = useRouter();
  const { addItem } = useQuote();
  const [showSpecs, setShowSpecs] = useState(false);

  function addToQuote() {
    addItem({
      id: `material:${material.id}`,
      name: material.name,
      kind: "material",
    });
    router.push(`/quotes?material=${encodeURIComponent(material.id)}`);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface-container-lowest transition-all duration-300 hover:shadow-[0px_4px_12px_rgba(46,49,146,0.08)]">
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-surface-container-low">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={material.image}
          alt={material.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {material.badge ? (
          <div
            className={
              material.badge === "Best Seller"
                ? "absolute left-4 top-4 rounded-full bg-tertiary-container px-3 py-1 text-xs font-medium text-on-tertiary-container shadow-sm"
                : "absolute left-4 top-4 rounded-full bg-status-success px-3 py-1 text-xs font-medium text-on-primary shadow-sm"
            }
          >
            {material.badge}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">
            {material.label}
          </p>
          <h3 className="font-headline text-xl font-bold uppercase tracking-wide text-on-surface">
            {material.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-base text-on-surface-variant">
            {material.description}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <button
            type="button"
            aria-expanded={showSpecs}
            aria-controls={`specs-${material.id}`}
            onClick={() => setShowSpecs((current) => !current)}
            className="flex w-full items-center justify-center gap-2 border border-primary py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary-fixed"
          >
            <Icon name="description" />
            {showSpecs ? "Hide Technical Specs" : "Technical Specs"}
          </button>
          {showSpecs ? (
            <div
              id={`specs-${material.id}`}
              className="border border-border-subtle bg-surface-container-low p-3"
            >
              <dl className="space-y-2">
                {material.specifications.map((specification) => (
                  <div
                    key={specification.label}
                    className="flex items-start justify-between gap-4 text-xs"
                  >
                    <dt className="font-bold uppercase tracking-wide text-on-surface-variant">
                      {specification.label}
                    </dt>
                    <dd className="text-right text-on-surface">
                      {specification.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 border-t border-border-subtle pt-2 text-[11px] text-on-surface-variant">
                Exact dimensions and availability are confirmed by Lapace
                during quotation.
              </p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={addToQuote}
            className="w-full bg-primary py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-on-primary shadow-sm transition-colors hover:bg-primary-container"
          >
            Add to Quote & Continue
          </button>
        </div>
      </div>
    </article>
  );
}
