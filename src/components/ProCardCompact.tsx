import Link from "next/link";
import type { Professional } from "@/lib/data";
import { Icon } from "./Icon";
import { ProTrustBadges } from "./ProTrustBadges";

type ProCardCompactProps = {
  pro: Professional;
};

export function ProCardCompact({ pro }: ProCardCompactProps) {
  return (
    <article className="font-helvetica min-w-[280px] snap-start rounded-xl border border-white/25 bg-white/15 p-3 shadow-lg backdrop-blur-sm transition-shadow hover:bg-white/25 hover:shadow-xl md:min-w-[320px]">
      <div className="mb-4 flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-white/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pro.avatar}
            alt={pro.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{pro.name}</h3>
          <div className="mt-1 flex items-center gap-1">
            <Icon
              name="star"
              filled
              className="text-[16px] text-primary"
            />
            <span className="text-xs font-medium tracking-wide text-white">
              {pro.rating} ({pro.reviews} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <ProTrustBadges pro={pro} variant="glass" />
      </div>

      <Link
        href={`/quotes?pro=${pro.id}`}
        className="block w-full border border-white/70 py-2 text-center text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-white hover:text-surface-dark"
      >
        Request Quote
      </Link>
    </article>
  );
}
