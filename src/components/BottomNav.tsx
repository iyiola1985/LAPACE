"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Icon } from "./Icon";
import { dashboardPathFor } from "@/lib/auth";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const dashboardHref = user ? dashboardPathFor(user) : "/account";
  const dashboardLabel =
    user?.role === "admin" ? "Admin" : user ? "Dashboard" : "Account";
  const dashboardIcon =
    user?.role === "admin" ? "admin_panel_settings" : user ? "dashboard" : "person";

  const items = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/pros", label: "Pros", icon: "engineering" },
    { href: "/jobs", label: "Jobs", icon: "work" },
    { href: "/quotes", label: "Quotes", icon: "request_quote" },
    { href: dashboardHref, label: dashboardLabel, icon: dashboardIcon },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-border-subtle bg-white px-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.06)] md:hidden">
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            className={
              active
                ? "my-1 flex flex-col items-center justify-center px-3 py-1 text-primary"
                : "my-1 flex flex-col items-center justify-center px-3 py-1 text-on-surface-variant hover:text-primary"
            }
          >
            <Icon name={item.icon} filled={active} className="text-[22px]" />
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
              {item.label}
            </span>
            {active ? (
              <span className="mt-1 h-0.5 w-6 rounded bg-primary" />
            ) : (
              <span className="mt-1 h-0.5 w-6" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
