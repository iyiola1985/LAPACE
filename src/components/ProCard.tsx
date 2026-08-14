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
            <h3 className="font-headline text-2xl font-semibold text-primary">
              {pro.name}
            </h3>
            <div className="flex items-center gap-1 text-on-surface-variant">
              <Icon
                name="star"
                filled
                className="text-sm text-tertiary-container"
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
            className="flex-1 rounded border border-primary py-2 text-center text-sm font-semibold text-primary transition-colors hover:bg-surface-container-low"
          >
            View Portfolio
          </Link>
          <button
            type="button"
            onClick={() =>
              addItem({ id: `pro:${pro.id}`, name: pro.name, kind: "pro" })
            }
            className="flex-1 rounded bg-tertiary-container py-2 text-sm font-semibold text-on-tertiary-container transition-colors hover:bg-tertiary hover:text-on-primary"
          >
            Request Quote
          </button>
        </div>
      </div>
    </article>
  );
}
