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
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-surface">
      <div className="flex w-full items-center justify-between px-4 py-2 md:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Menu"
            className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low md:hidden"
          >
            <Icon name="menu" />
          </button>
          <Link
            href="/"
            className="font-headline text-2xl font-bold text-primary"
          >
            LAPACE Roofing
          </Link>
        </div>

        {showDesktopNav ? (
          <nav className="hidden items-center gap-6 md:flex">
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
                      ? "text-sm font-semibold text-primary"
                      : "text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
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
          className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low"
        >
          <Icon name="account_circle" />
        </Link>
      </div>
    </header>
  );
}
