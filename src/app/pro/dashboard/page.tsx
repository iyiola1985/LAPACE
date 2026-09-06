"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { useAuth } from "@/components/AuthProvider";

export default function ProDashboardPage() {
  const router = useRouter();
  const { user, ready, logout, updateAvatar } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "client") {
      router.replace("/dashboard");
    }
  }, [ready, user, router]);

  if (!ready || !user || user.role !== "pro") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-on-surface-variant">
        Loading dashboard...
      </main>
    );
  }

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
            onChange={(avatarUrl) => updateAvatar(avatarUrl)}
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
            logout();
            router.push("/");
          }}
          className="border border-border-subtle px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant hover:border-primary hover:text-primary"
        >
          Log out
        </button>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="border border-border-subtle bg-white p-5">
          <Icon name="work" className="text-primary" />
          <h2 className="mt-3 font-bold uppercase tracking-wide">Job board</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Incoming client jobs will appear here after verification.
          </p>
        </div>
        <Link
          href="/materials"
          className="border border-border-subtle bg-white p-5 transition-shadow hover:shadow-md"
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
            onChange={(avatarUrl) => updateAvatar(avatarUrl)}
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
    </main>
  );
}
