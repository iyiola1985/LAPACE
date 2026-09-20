"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { BackToDashboard } from "@/components/BackToDashboard";
import { OfferForm } from "@/components/OfferForm";
import { OfferList } from "@/components/OfferList";
import { isVerifiedPro, marketplaceLockMessage } from "@/lib/access";
import {
  listOffersForListing,
  type MarketplaceOffer,
} from "@/lib/offers";
import {
  canRespondToWorkPost,
  getWorkPost,
  updateWorkPostStatus,
  type WorkPost,
} from "@/lib/workPosts";

export default function WorkDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, ready } = useAuth();
  const [post, setPost] = useState<WorkPost | null>(null);
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh(id: string) {
    const next = await getWorkPost(id);
    setPost(next);
    if (!next) {
      setError("Work post not found.");
      return;
    }
    const nextOffers = await listOffersForListing({ workPostId: next.id });
    setOffers(nextOffers);
  }

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        await refresh(params.id);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load post.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, user, router, params.id]);

  async function closePost() {
    if (!post) return;
    setBusy(true);
    try {
      const updated = await updateWorkPostStatus(post.id, "closed");
      setPost(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not close post.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready || !user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-on-surface-variant">
        Loading...
      </main>
    );
  }

  if (!post) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-status-urgent">{error || "Work post not found"}</p>
        <Link href="/work" className="mt-4 inline-block text-primary underline">
          Back to work board
        </Link>
      </main>
    );
  }

  const isOwner = user.role === "pro" && user.id === post.proId;
  const canOffer = canRespondToWorkPost(post, user);
  const lockMessage = marketplaceLockMessage(user);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10">
      <BackToDashboard secondaryHref="/work" secondaryLabel="Back to work board" />

      <article className="mt-2 border border-border-subtle bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              {post.postType === "pro_to_pro" ? "Pro to pro" : "Work available"}
            </p>
            <h1 className="mt-1 text-2xl font-bold uppercase tracking-wide">
              {post.title}
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              {post.proName} · {post.city}
            </p>
          </div>
          <span className="bg-primary/15 px-2 py-1 text-xs font-bold uppercase text-primary">
            {post.status}
          </span>
        </div>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold uppercase tracking-wide text-on-surface-variant">
              Service
            </dt>
            <dd>{post.service}</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wide text-on-surface-variant">
              Budget
            </dt>
            <dd>{post.budget || "Not specified"}</dd>
          </div>
        </dl>

        <p className="mt-6 text-sm leading-relaxed text-on-surface-variant">
          {post.description}
        </p>

        {error ? <p className="mt-4 text-sm text-status-urgent">{error}</p> : null}

        {isOwner && post.status !== "closed" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void closePost()}
            className="mt-6 border border-border-subtle px-6 py-3 text-xs font-bold uppercase tracking-[0.12em]"
          >
            Close post
          </button>
        ) : null}
      </article>

      <section className="mt-8">
        <h2 className="font-bold uppercase tracking-wide">Offers</h2>
        <div className="mt-4">
          <OfferList
            offers={offers}
            user={user}
            onChange={setOffers}
          />
        </div>
      </section>

      {canOffer ? (
        <section className="mt-8">
          {user.role === "pro" && !isVerifiedPro(user) ? (
            <p className="border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
              {lockMessage}
            </p>
          ) : (
            <OfferForm
              user={user}
              workPostId={post.id}
              onCreated={(offer) => setOffers((current) => [offer, ...current])}
            />
          )}
        </section>
      ) : null}
    </main>
  );
}
