import Link from "next/link";
import type { Professional } from "@/lib/data";
import { Icon } from "./Icon";

type ProCardCompactProps = {
  pro: Professional;
};

export function ProCardCompact({ pro }: ProCardCompactProps) {
  return (
    <article className="min-w-[280px] snap-start rounded-xl border border-border-subtle bg-surface-container-lowest p-3 shadow-sm transition-shadow hover:shadow-md md:min-w-[320px]">
      <div className="mb-4 flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface-container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pro.avatar}
            alt={pro.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-on-background">{pro.name}</h3>
          <div className="mt-1 flex items-center gap-1">
            <Icon
              name="star"
              filled
              className="text-[16px] text-tertiary-container"
            />
            <span className="text-xs font-medium tracking-wide text-on-surface-variant">
              {pro.rating} ({pro.reviews} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {pro.verified ? (
          <span className="flex items-center gap-1 rounded border border-border-subtle bg-surface-container-low px-2 py-1 text-xs font-medium text-primary">
            <Icon name="verified" className="text-[14px]" /> Vetted
          </span>
        ) : null}
        {pro.certified ? (
          <span className="flex items-center gap-1 rounded border border-border-subtle bg-surface-container-low px-2 py-1 text-xs font-medium text-status-success">
            <Icon name="workspace_premium" className="text-[14px]" /> Lapace
            Certified
          </span>
        ) : null}
      </div>

      <Link
        href={`/quotes?pro=${pro.id}`}
        className="block w-full rounded-lg border border-primary py-2 text-center text-sm font-semibold text-primary transition-colors hover:bg-surface-container-low"
      >
        Request Quote
      </Link>
    </article>
  );
}
