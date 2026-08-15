"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

const desktopLinks = [
  { href: "/", label: "Home" },
  { href: "/materials", label: "Materials" },
  { href: "/pros", label: "Marketplace" },
  { href: "/quotes", label: "Quotes" },
] as const;

type AppHeaderProps = {
  showDesktopNav?: boolean;
};

export function AppHeader({ showDesktopNav = true }: AppHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-dark/95 text-white backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Menu"
            className="rounded p-2 text-white transition-colors hover:bg-white/10 md:hidden"
          >
            <Icon name="menu" />
          </button>
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded bg-brand text-sm font-bold text-white">
              LA
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-bold tracking-wide text-white">
                LAPACE
              </span>
              <span className="block max-w-[220px] text-[10px] font-medium uppercase tracking-wider text-white/70">
                Integrated Services & Investment Limited
              </span>
            </span>
          </Link>
        </div>

        {showDesktopNav ? (
          <nav className="hidden items-center gap-7 md:flex">
            {desktopLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "border-b-2 border-primary pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                      : "border-b-2 border-transparent pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/85 transition-colors hover:text-white"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        ) : null}

        <Link
          href="/account"
          aria-label="Account"
          className="rounded p-2 text-white transition-colors hover:bg-white/10"
        >
          <Icon name="account_circle" />
        </Link>
      </div>
    </header>
  );
}
