"use client";

import type { Professional } from "@/lib/data";
import { Icon } from "./Icon";

type ProTrustBadgesProps = {
  pro: Pick<Professional, "verified" | "certified">;
  size?: "sm" | "md";
  /** glass = over video/transparent sections; solid = marketplace cards */
  variant?: "solid" | "glass";
};

/**
 * Pending → Vetted only.
 * Approved (Lapace Certified) → Vetted + Lapace Certified.
 */
export function ProTrustBadges({
  pro,
  size = "sm",
  variant = "solid",
}: ProTrustBadgesProps) {
  const text = size === "md" ? "text-sm" : "text-xs";
  const icon = size === "md" ? "text-base" : "text-[14px]";
  const glass = variant === "glass";

  if (!pro.verified && !pro.certified) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {pro.verified || pro.certified ? (
        <span
          className={`flex items-center gap-1 rounded px-2 py-1 font-medium ${text} ${
            glass
              ? "border border-white/30 bg-white/20 text-white backdrop-blur-sm"
              : "border border-border-subtle bg-surface-container-low text-primary"
          }`}
        >
          <Icon name="verified" className={icon} /> Vetted
        </span>
      ) : null}
      {pro.certified ? (
        <span
          className={`flex items-center gap-1 rounded bg-status-success px-2 py-1 font-medium text-white ${text}`}
        >
          <Icon name="workspace_premium" className={icon} /> Lapace Certified
        </span>
      ) : null}
    </div>
  );
}
