"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ProPortfolioManager } from "@/components/ProPortfolioManager";
import { ProStatusNotice } from "@/components/ProStatusNotice";
import { useAuth } from "@/components/AuthProvider";
import {
  isVerifiedPro,
  marketplaceLockMessage,
} from "@/lib/access";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ProDashboardPage() {
  const router = useRouter();
  const { user, ready, logout, updateAvatar, refreshProfile } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "client") {
      router.replace("/dashboard");
      return;
    }
    if (user.role === "admin") {
      router.replace("/admin");
    }
  }, [ready, user, router]);

  // Keep status fresh so admin approval shows without re-login.
  useEffect(() => {
    if (!ready || !user || user.role !== "pro") return;

    void refreshProfile();

    const onFocus = () => {
      void refreshProfile();
    };
    window.addEventListener("focus", onFocus);

    const interval = window.setInterval(() => {
      void refreshProfile();
    }, 12_000);

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      ?.channel(`pro-status-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        () => {
          void refreshProfile();
        },
      )
      .subscribe();

    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(interval);
      if (channel && supabase) {
        void supabase.removeChannel(channel);
      }
    };
  }, [ready, user?.id, user?.role, refreshProfile]);

  if (!ready || !user || user.role !== "pro") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-on-surface-variant">
        Loading dashboard...
      </main>
    );
  }

  const verified = isVerifiedPro(user);
  const lockMessage = marketplaceLockMessage(user);

  const statusLabel =
    user.status === "verified"
      ? "Lapace Verified"
      : user.status === "rejected"
        ? "Rejected"
        : "Pending verification";

  const statusClass =
    user.status === "verified"
      ? "bg-status-success text-white"
      : user.status === "rejected"
        ? "bg-status-urgent text-white"
        : "bg-primary/15 text-primary";

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          <ProfileAvatar
            name={user.fullName}
            avatarUrl={user.avatarUrl}
            editable
            onChange={(avatarUrl) => {
              void updateAvatar(avatarUrl);
            }}
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Pro Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-bold text-on-background md:text-3xl">
              {user.companyName}
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              {user.fullName} · {user.city}
            </p>
            <span
              className={`mt-3 inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusClass}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            void logout().then(() => router.push("/"));
          }}
          className="border border-border-subtle px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant hover:border-primary hover:text-primary"
        >
          Log out
        </button>
      </div>

      <ProStatusNotice pro={user} />

      {lockMessage ? (
        <section className="mt-6 border border-primary/30 bg-primary/10 p-5">
          <h2 className="font-bold uppercase tracking-wide text-primary">
            Marketplace access locked
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">{lockMessage}</p>
          {user.status === "rejected" && user.rejectionReason ? (
            <p className="mt-2 text-sm text-status-urgent">
              Reason: {user.rejectionReason}
            </p>
          ) : null}
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-on-surface-variant">
            <li>You can edit your profile photo and portfolio while waiting.</li>
            <li>
              Messaging, job offers, work posts, and pro-to-pro deals unlock after
              admin approval.
            </li>
          </ul>
        </section>
      ) : null}

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {verified ? (
          <>
            <Link
              href="/jobs"
              className="border border-border-subtle bg-white p-5 transition-shadow hover:shadow-md"
            >
              <Icon name="work" className="text-primary" />
              <h2 className="mt-3 font-bold uppercase tracking-wide">
                Client job board
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Browse open client jobs and submit on-site offers.
              </p>
            </Link>
            <Link
              href="/work"
              className="border border-border-subtle bg-white p-5 transition-shadow hover:shadow-md"
            >
              <Icon name="architecture" className="text-primary" />
              <h2 className="mt-3 font-bold uppercase tracking-wide">
                Work available
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Post capacity or find pro-to-pro collaboration.
              </p>
            </Link>
            <Link
              href="/deals"
              className="border border-border-subtle bg-white p-5 transition-shadow hover:shadow-md"
            >
              <Icon name="request_quote" className="text-primary" />
              <h2 className="mt-3 font-bold uppercase tracking-wide">
                Offers & deals
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Track offers you sent or received and active deals.
              </p>
            </Link>
            <Link
              href="/messages"
              className="border border-border-subtle bg-white p-5 transition-shadow hover:shadow-md"
            >
              <Icon name="chat" className="text-primary" />
              <h2 className="mt-3 font-bold uppercase tracking-wide">Messages</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Continue deal chats with clients and partner companies.
              </p>
            </Link>
          </>
        ) : (
          <>
            <div className="border border-border-subtle bg-white/70 p-5 opacity-70">
              <Icon name="work" className="text-on-surface-variant" />
              <h2 className="mt-3 font-bold uppercase tracking-wide">
                Client job board
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Locked until Lapace verifies your company.
              </p>
            </div>
            <div className="border border-border-subtle bg-white/70 p-5 opacity-70">
              <Icon name="chat" className="text-on-surface-variant" />
              <h2 className="mt-3 font-bold uppercase tracking-wide">
                Messages & deals
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Locked until Lapace verifies your company.
              </p>
            </div>
          </>
        )}
        <Link
          href="/materials"
          className="border border-border-subtle bg-white p-5 transition-shadow hover:shadow-md md:col-span-2"
        >
          <Icon name="architecture" className="text-primary" />
          <h2 className="mt-3 font-bold uppercase tracking-wide">
            Material catalog
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Browse Lapace products for your installs.
          </p>
        </Link>
      </section>

      <section className="mt-8 border border-border-subtle bg-surface-container-low p-5">
        <h2 className="font-bold uppercase tracking-wide">About</h2>
        <div className="mt-4 flex flex-wrap items-start gap-4">
          <ProfileAvatar
            name={user.fullName}
            avatarUrl={user.avatarUrl}
            size="md"
            editable
            onChange={(avatarUrl) => {
              void updateAvatar(avatarUrl);
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-on-surface-variant">{user.about}</p>
            <ul className="mt-4 space-y-1 text-sm text-on-surface-variant">
              <li>Email: {user.email}</li>
              <li>Phone: {user.phone}</li>
              <li>Services: {user.services.join(", ")}</li>
            </ul>
          </div>
        </div>
      </section>

      <ProPortfolioManager proId={user.id} />
    </main>
  );
}
