"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Icon } from "@/components/Icon";
import { dashboardPathFor } from "@/lib/auth";

type BackToDashboardProps = {
  className?: string;
  /** Optional secondary link shown after the dashboard link */
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function BackToDashboard({
  className = "",
  secondaryHref,
  secondaryLabel,
}: BackToDashboardProps) {
  const { user, ready, dashboardPath, isAdmin } = useAuth();

  if (!ready || !user) return null;

  const href = dashboardPath ?? dashboardPathFor(user);
  const label = isAdmin ? "Back to admin" : "Back to dashboard";

  return (
    <div
      className={`mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm ${className}`}
    >
      <Link
        href={href}
        className="inline-flex items-center gap-1 font-semibold text-primary underline"
      >
        <Icon name="arrow_back" className="text-sm" />
        {label}
      </Link>
      {secondaryHref && secondaryLabel ? (
        <Link
          href={secondaryHref}
          className="font-semibold text-on-surface-variant underline"
        >
          {secondaryLabel}
        </Link>
      ) : null}
    </div>
  );
}
