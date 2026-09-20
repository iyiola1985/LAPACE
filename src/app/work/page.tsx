"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { BackToDashboard } from "@/components/BackToDashboard";
import { PrimaryButton } from "@/components/AuthForm";
import { isVerifiedPro, marketplaceLockMessage } from "@/lib/access";
import {
  ensureDemoWorkPosts,
  listWorkPosts,
  type WorkPost,
} from "@/lib/workPosts";

export default function WorkBoardPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [posts, setPosts] = useState<WorkPost[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        ensureDemoWorkPosts();
        const next = await listWorkPosts();
        if (!cancelled) setPosts(next);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load posts.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, user, router]);

  const visible = useMemo(() => {
    if (!user) return [];
    return posts.filter((post) => {
      if (post.proId === user.id) return true;
      if (post.status !== "open") {
        return post.hiredPartyId === user.id;
      }
      if (user.role === "client") {
        return post.audience === "clients" || post.audience === "both";
      }
      if (user.role === "pro") {
        if (user.status !== "verified") return false;
        return post.audience === "pros" || post.audience === "both";
      }
      return true;
    });
  }, [posts, user]);

  const lockMessage = marketplaceLockMessage(user);

  if (!ready || !user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-on-surface-variant">
        Loading work board...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10">
      <BackToDashboard />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="accent-underline text-2xl font-bold uppercase tracking-wide md:text-3xl">
            Work available
          </h1>
          <p className="mt-3 text-sm text-on-surface-variant">
            Verified companies post capacity and collaboration opportunities.
            Clients and pros can respond with on-site offers.
          </p>
        </div>
        {isVerifiedPro(user) ? (
          <Link href="/work/new">
            <PrimaryButton type="button">Post work available</PrimaryButton>
          </Link>
        ) : null}
      </div>

      {lockMessage && user.role === "pro" ? (
        <p className="mt-4 border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
          {lockMessage}
        </p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-status-urgent">{error}</p> : null}
      {loading ? (
        <p className="mt-6 text-on-surface-variant">Loading...</p>
      ) : (
        <div className="mt-8 space-y-4">
          {visible.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No work posts yet.
              {isVerifiedPro(user)
                ? " Post capacity so clients and partner companies can respond."
                : ""}
            </p>
          ) : (
            visible.map((post) => (
              <Link
                key={post.id}
                href={`/work/${post.id}`}
                className="block border border-border-subtle bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">
                      {post.postType === "pro_to_pro"
                        ? "Pro to pro"
                        : "Work available"}
                    </p>
                    <h2 className="mt-1 font-bold uppercase tracking-wide">
                      {post.title}
                    </h2>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {post.proName} · {post.city} · {post.service} ·{" "}
                      {post.budget || "Budget TBD"}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm">{post.description}</p>
                  </div>
                  <span className="bg-primary/15 px-2 py-1 text-xs font-bold uppercase text-primary">
                    {post.status}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </main>
  );
}
