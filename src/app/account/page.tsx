"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { BackToDashboard } from "@/components/BackToDashboard";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import {
  ProfileCheckBadge,
  ProfilePillButton,
} from "@/components/ProfileMediaCard";
import { useAuth } from "@/components/AuthProvider";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80";

const guestLinks = [
  {
    href: "/materials",
    title: "Material Catalog",
    subtitle: "Browse aluminum, stone coated tiles, and accessories",
    icon: "architecture",
  },
  {
    href: "/pros",
    title: "Marketplace",
    subtitle: "Find Lapace verified roofing professionals",
    icon: "storefront",
  },
  {
    href: "/quotes",
    title: "Quote Requests",
    subtitle: "Review and submit your project quote basket",
    icon: "request_quote",
  },
] as const;

export default function AccountPage() {
  const { user, ready, logout, dashboardPath, updateAvatar, isAdmin } =
    useAuth();

  if (!ready) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 text-white/80">
        Loading account...
      </main>
    );
  }

  if (user) {
    const displayName =
      user.role === "pro" && user.companyName
        ? user.companyName
        : user.fullName;
    const subtitle =
      user.role === "pro"
        ? user.about || `${user.city} · Pro contractor`
        : `${user.city} · Client looking for roofing pros`;
    const certified = user.role === "pro" && user.status === "verified";
    const verified =
      user.role === "pro" &&
      (user.status === "verified" || user.status === "pending");
    const cover = user.avatarUrl || DEFAULT_COVER;

    return (
      <main className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
        <BackToDashboard />

        <section className="relative mb-8 overflow-hidden rounded-[1.75rem] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
          <div className="relative min-h-[360px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt={displayName}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/25" />

            <div className="relative z-10 flex min-h-[360px] flex-col justify-between p-5 md:p-7">
              <div className="flex justify-end">
                <div className="rounded-full border border-white/25 bg-black/35 p-2 backdrop-blur-sm">
                  <ProfileAvatar
                    name={user.fullName}
                    avatarUrl={user.avatarUrl}
                    size="md"
                    editable
                    onChange={(avatarUrl) => {
                      void updateAvatar(avatarUrl);
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight text-white">
                    {displayName}
                  </h1>
                  <ProfileCheckBadge certified={certified} verified={verified} />
                </div>
                <p className="mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                  {user.role}
                </p>
                <p className="mb-4 max-w-md text-sm leading-6 text-white/80">
                  {subtitle}
                </p>
                <p className="mb-5 text-xs text-white/65">{user.email}</p>

                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex items-center gap-4 text-sm font-medium text-white/85">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="location_on" className="text-[18px] text-white/70" />
                      {user.city || "—"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon name="mail" className="text-[18px] text-white/70" />
                      Account
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ProfilePillButton
                      onClick={() => {
                        void logout();
                      }}
                      variant="ghost"
                    >
                      Log out
                    </ProfilePillButton>
                    <ProfilePillButton
                      href={dashboardPath ?? "/"}
                      variant="solid"
                    >
                      {isAdmin ? "Open Admin +" : "Dashboard +"}
                    </ProfilePillButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <section className="mb-8 overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/92 p-6 text-[#2c2c2c] shadow-lg backdrop-blur-sm">
        <Image
          src="/images/lapace-logo.png"
          alt="Lapace logo"
          width={160}
          height={48}
          className="h-12 w-auto object-contain"
        />
        <h1 className="mt-4 text-2xl font-bold text-[#2c2c2c]">Your Account</h1>
        <p className="mt-2 text-sm text-[#555555]">
          Register as a client to hire pros, or as a contractor to get jobs.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-container"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
          >
            Log In
          </Link>
        </div>
      </section>

      <div className="space-y-3">
        {guestLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 overflow-hidden rounded-2xl border border-white/15 bg-white/92 px-4 py-4 text-[#2c2c2c] shadow-md backdrop-blur-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <Icon name={link.icon} />
            </div>
            <div>
              <p className="text-sm font-semibold">{link.title}</p>
              <p className="text-xs text-[#555555]">{link.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
