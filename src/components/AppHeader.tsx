"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Icon } from "./Icon";

type AppHeaderProps = {
  showDesktopNav?: boolean;
};

export function AppHeader({ showDesktopNav = true }: AppHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const desktopLinks = [
    { href: "/", label: "Home" },
    { href: "/materials", label: "Materials" },
    { href: "/pros", label: "Marketplace" },
    { href: "/quotes", label: "Quotes" },
    user ? { href: "/account", label: "Account" } : { href: "/register", label: "Join" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-2 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Menu"
            className="rounded p-2 text-on-background transition-colors hover:bg-surface-container-low md:hidden"
          >
            <Icon name="menu" />
          </button>
          <Link href="/" className="flex items-center" aria-label="Lapace home">
            <Image
              src="/images/lapace-logo.png"
              alt="Lapace Integrated Services and Investment Ltd"
              width={220}
              height={64}
              priority
              className="h-10 w-auto object-contain sm:h-12"
            />
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
                      ? "border-b-2 border-primary pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-on-background"
                      : "border-b-2 border-transparent pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant transition-colors hover:text-on-background"
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
          className="rounded p-2 text-on-background transition-colors hover:bg-surface-container-low"
        >
          <Icon name="account_circle" />
        </Link>
      </div>
    </header>
  );
}
