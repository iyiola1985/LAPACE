"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PrimaryButton } from "@/components/AuthForm";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { useAuth } from "@/components/AuthProvider";

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
  const { user, ready, logout, dashboardPath, updateAvatar } = useAuth();

  if (!ready) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 text-on-surface-variant">
        Loading account...
      </main>
    );
  }

  if (user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
        <section className="mb-8 border border-border-subtle bg-white p-6">
          <div className="flex flex-wrap items-center gap-4">
            <ProfileAvatar
              name={user.fullName}
              avatarUrl={user.avatarUrl}
              editable
              onChange={(avatarUrl) => updateAvatar(avatarUrl)}
            />
            <div>
              <h1 className="text-2xl font-bold text-on-background">
                {user.fullName}
              </h1>
              <p className="mt-1 text-sm text-on-surface-variant">
                Signed in as{" "}
                <span className="font-semibold uppercase text-primary">
                  {user.role}
                </span>{" "}
                · {user.email}
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={dashboardPath ?? "/"}>
              <PrimaryButton type="button">Go to Dashboard</PrimaryButton>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="border border-border-subtle px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant hover:border-primary hover:text-primary"
            >
              Log out
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <section className="mb-8 border border-border-subtle bg-white p-6">
        <Image
          src="/images/lapace-logo.png"
          alt="Lapace logo"
          width={160}
          height={48}
          className="h-12 w-auto object-contain"
        />
        <h1 className="mt-4 text-2xl font-bold text-on-background">
          Your Account
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Register as a client to hire pros, or as a contractor to get jobs.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/register">
            <PrimaryButton type="button">Create Account</PrimaryButton>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center border border-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-primary"
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
            className="flex items-center gap-3 border border-border-subtle bg-white px-4 py-4"
          >
            <div className="flex h-10 w-10 items-center justify-center bg-surface-container text-primary">
              <Icon name={link.icon} />
            </div>
            <div>
              <p className="text-sm font-semibold">{link.title}</p>
              <p className="text-xs text-on-surface-variant">{link.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
