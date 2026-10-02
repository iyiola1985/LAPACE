import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

export function ProfileCheckBadge({
  certified,
  verified,
}: {
  certified?: boolean;
  verified?: boolean;
}) {
  if (!certified && !verified) return null;

  return (
    <span
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm"
      title={certified ? "Lapace Certified" : "Vetted"}
      aria-label={certified ? "Lapace Certified" : "Vetted"}
    >
      <Icon name="check" filled className="text-[14px]" />
    </span>
  );
}

export function formatCompactCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}k`;
  }
  return String(value);
}

type ProfileMediaCardProps = {
  image: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  certified?: boolean;
  verified?: boolean;
  stats?: Array<{ icon: string; label: string; value: string | number }>;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  href?: string;
  className?: string;
  aspectClassName?: string;
  children?: ReactNode;
};

/**
 * Reference profile card (Option B): full-bleed photo, bottom gradient overlay,
 * name + orange check, bio, icon stats, pill CTA.
 */
export function ProfileMediaCard({
  image,
  imageAlt,
  title,
  subtitle,
  certified,
  verified,
  stats = [],
  primaryAction,
  secondaryAction,
  className = "",
  aspectClassName = "aspect-[3/4]",
  children,
}: ProfileMediaCardProps) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[1.75rem] bg-black shadow-[0_18px_40px_rgba(0,0,0,0.28)] ${aspectClassName} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-transparent to-transparent" />

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-5 md:p-6">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-xl font-bold tracking-tight text-white md:text-2xl">
            {title}
          </h3>
          <ProfileCheckBadge certified={certified} verified={verified} />
        </div>

        {subtitle ? (
          <p className="line-clamp-2 text-sm leading-5 text-white/80">
            {subtitle}
          </p>
        ) : null}

        {children}

        <div className="mt-1 flex items-end justify-between gap-3">
          {stats.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3 text-white/85">
              {stats.map((stat) => (
                <span
                  key={`${stat.icon}-${stat.label}`}
                  className="inline-flex items-center gap-1 text-sm font-medium"
                  title={stat.label}
                >
                  <Icon name={stat.icon} className="text-[18px] text-white/70" />
                  {typeof stat.value === "number"
                    ? formatCompactCount(stat.value)
                    : stat.value}
                </span>
              ))}
            </div>
          ) : (
            <span />
          )}

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {secondaryAction}
            {primaryAction}
          </div>
        </div>
      </div>
    </article>
  );
}

type ProfilePillButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "solid" | "ghost" | "brand";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
};

export function ProfilePillButton({
  children,
  onClick,
  href,
  variant = "solid",
  type = "button",
  disabled,
  className = "",
}: ProfilePillButtonProps) {
  let styles: string;
  switch (variant) {
    case "solid":
      styles = "bg-white text-[#1a1a1a] hover:bg-white/90";
      break;
    case "brand":
      styles = "bg-primary text-white hover:bg-primary-container";
      break;
    case "ghost":
      styles =
        "border border-white/55 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20";
      break;
    default: {
      const _exhaustive: never = variant;
      throw new Error(`Unhandled pill variant: ${String(_exhaustive)}`);
    }
  }

  const classes = `inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${styles} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  );
}
