"use client";

import Link from "next/link";
import type { Professional } from "@/lib/data";
import { useQuote } from "./QuoteProvider";
import { Icon } from "./Icon";

type ProCardProps = {
  pro: Professional;
};

export function ProCard({ pro }: ProCardProps) {
  const { addItem } = useQuote();

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface-container-lowest transition-shadow duration-300 hover:shadow-lg">
      <div className="relative flex h-32 items-end justify-center bg-surface-container pb-4">
        <div
          className="absolute -bottom-12 h-24 w-24 rounded-full border-4 border-surface-container-lowest bg-cover bg-center"
          style={{ backgroundImage: `url('${pro.avatar}')` }}
          role="img"
          aria-label={pro.name}
        />
      </div>

      <div className="flex flex-1 flex-col p-3 pt-16">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold uppercase tracking-wide text-on-background">
              {pro.name}
            </h3>
            <div className="flex items-center gap-1 text-on-surface-variant">
              <Icon
                name="star"
                filled
                className="text-sm text-primary"
              />
              <span className="text-sm font-semibold">
                {pro.rating} ({pro.reviews} reviews)
              </span>
            </div>
          </div>
          {pro.verified ? (
            <span className="flex items-center gap-1 rounded bg-status-success px-2 py-1 text-xs font-medium text-on-primary">
              <Icon name="verified" className="text-sm" /> Lapace Verified
            </span>
          ) : null}
        </div>

        <p className="mt-2 line-clamp-2 flex-grow text-base text-secondary">
          {pro.about}
        </p>

        <div className="mb-6 mt-4 flex flex-wrap gap-2">
          {pro.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-surface-container-low px-2 py-1 text-xs font-medium text-primary"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex gap-2">
          <Link
            href={`/pros/${pro.id}`}
            className="flex-1 border border-primary py-2 text-center text-xs font-bold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary-fixed"
          >
            View Portfolio
          </Link>
          <button
            type="button"
            onClick={() =>
              addItem({ id: `pro:${pro.id}`, name: pro.name, kind: "pro" })
            }
            className="flex-1 bg-primary py-2 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-primary-container"
          >
            Request Quote
          </button>
        </div>
      </div>
    </article>
  );
}
