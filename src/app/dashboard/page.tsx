"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { PrimaryButton } from "@/components/AuthForm";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { useAuth } from "@/components/AuthProvider";

export default function ClientDashboardPage() {
  const router = useRouter();
  const { user, ready, logout, updateAvatar } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "pro") {
      router.replace("/pro/dashboard");
      return;
    }
    if (user.role === "admin") {
      router.replace("/admin");
    }
  }, [ready, user, router]);

  if (!ready || !user || user.role !== "client") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-on-surface-variant">
        Loading dashboard...
      </main>
    );
  }

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
              Client Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-bold text-on-background md:text-3xl">
              Welcome, {user.fullName}
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              {user.city} · {user.email}
            </p>
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

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/jobs/new"
          className="border border-border-subtle bg-white p-5 transition-shadow hover:shadow-md"
        >
          <Icon name="work" className="text-primary" />
          <h2 className="mt-3 font-bold uppercase tracking-wide">Post a Job</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Describe your project and let verified pros message you.
          </p>
        </Link>
        <Link
          href="/messages"
          className="border border-border-subtle bg-white p-5 transition-shadow hover:shadow-md"
        >
          <Icon name="chat" className="text-primary" />
          <h2 className="mt-3 font-bold uppercase tracking-wide">Messages</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Continue chats with pros about quotes and hire requests.
          </p>
        </Link>
        <Link
          href="/quotes"
          className="border border-border-subtle bg-white p-5 transition-shadow hover:shadow-md"
        >
          <Icon name="request_quote" className="text-primary" />
          <h2 className="mt-3 font-bold uppercase tracking-wide">
            Request a Quote
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Add materials or a pro, then submit your project details.
          </p>
        </Link>
        <Link
          href="/pros"
          className="border border-border-subtle bg-white p-5 transition-shadow hover:shadow-md"
        >
          <Icon name="engineering" className="text-primary" />
          <h2 className="mt-3 font-bold uppercase tracking-wide">
            Find a Roofing Pro
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Browse verified contractors ready for residential and commercial
            work.
          </p>
        </Link>
      </section>

      <div className="mt-8 border border-border-subtle bg-surface-container-low p-5">
        <h2 className="font-bold uppercase tracking-wide">Your profile</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <ProfileAvatar
            name={user.fullName}
            avatarUrl={user.avatarUrl}
            size="md"
            editable
            onChange={(avatarUrl) => {
              void updateAvatar(avatarUrl);
            }}
          />
          <ul className="space-y-1 text-sm text-on-surface-variant">
            <li>Phone: {user.phone}</li>
            <li>Email: {user.email}</li>
            <li>Location: {user.city}</li>
          </ul>
        </div>
        <PrimaryButton
          type="button"
          className="mt-4"
          onClick={() => router.push("/quotes")}
        >
          Start a Quote
        </PrimaryButton>
      </div>
    </main>
  );
}
