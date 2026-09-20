"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { BackToDashboard } from "@/components/BackToDashboard";
import {
  formatDealAmount,
  formatOfferAmount,
  listDealsForUser,
  listOffersForUser,
  updateDealStatus,
  type MarketplaceDeal,
  type MarketplaceOffer,
} from "@/lib/offers";

export default function DealsPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [deals, setDeals] = useState<MarketplaceDeal[]>([]);
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
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
        const [nextDeals, nextOffers] = await Promise.all([
          listDealsForUser(user.id, user.role === "admin"),
          listOffersForUser(user.id, user.role === "admin"),
        ]);
        if (!cancelled) {
          setDeals(nextDeals);
          setOffers(nextOffers);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load deals.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, user, router]);

  async function handleDealStatus(
    dealId: string,
    status: MarketplaceDeal["status"],
  ) {
    if (!user) return;
    setBusyId(dealId);
    setError("");
    try {
      const updated = await updateDealStatus(dealId, status, user);
      setDeals((current) =>
        current.map((deal) => (deal.id === updated.id ? updated : deal)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update deal.");
    } finally {
      setBusyId(null);
    }
  }

  if (!ready || !user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-on-surface-variant">
        Loading deals...
      </main>
    );
  }

  const incoming = offers.filter(
    (offer) => offer.toUserId === user.id && offer.status === "pending",
  );
  const outgoing = offers.filter(
    (offer) => offer.fromUserId === user.id && offer.status === "pending",
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10">
      <BackToDashboard />
      <h1 className="accent-underline text-2xl font-bold uppercase tracking-wide md:text-3xl">
        Offers & deals
      </h1>
      <p className="mt-3 text-sm text-on-surface-variant">
        All marketplace transactions stay on Lapace. Accept offers here, then
        continue in chat — never move payment talks or contact details off-site.
      </p>

      {error ? <p className="mt-4 text-sm text-status-urgent">{error}</p> : null}
      {loading ? (
        <p className="mt-6 text-on-surface-variant">Loading...</p>
      ) : (
        <>
          <section className="mt-8">
            <h2 className="font-bold uppercase tracking-wide">
              Pending offers received ({incoming.length})
            </h2>
            <div className="mt-4 space-y-3">
              {incoming.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  No pending offers waiting for you.
                </p>
              ) : (
                incoming.map((offer) => (
                  <Link
                    key={offer.id}
                    href={
                      offer.jobId
                        ? `/jobs/${offer.jobId}`
                        : `/work/${offer.workPostId}`
                    }
                    className="block border border-border-subtle bg-white p-4 hover:shadow-md"
                  >
                    <p className="font-bold">{offer.fromName}</p>
                    <p className="text-sm text-on-surface-variant">
                      {formatOfferAmount(offer)} · {offer.timeline}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-bold uppercase tracking-wide">
              Pending offers sent ({outgoing.length})
            </h2>
            <div className="mt-4 space-y-3">
              {outgoing.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  You have no pending outgoing offers.
                </p>
              ) : (
                outgoing.map((offer) => (
                  <Link
                    key={offer.id}
                    href={
                      offer.jobId
                        ? `/jobs/${offer.jobId}`
                        : `/work/${offer.workPostId}`
                    }
                    className="block border border-border-subtle bg-white p-4 hover:shadow-md"
                  >
                    <p className="font-bold">To {offer.toName}</p>
                    <p className="text-sm text-on-surface-variant">
                      {formatOfferAmount(offer)} · {offer.timeline}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-bold uppercase tracking-wide">
              Active deals ({deals.length})
            </h2>
            <div className="mt-4 space-y-3">
              {deals.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  No deals yet. Accept an offer on a job or work post to create
                  one.
                </p>
              ) : (
                deals.map((deal) => (
                  <article
                    key={deal.id}
                    className="border border-border-subtle bg-white p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">
                          {deal.partyAName} ↔ {deal.partyBName}
                        </p>
                        <p className="mt-1 text-sm text-on-surface-variant">
                          {formatDealAmount(deal)} · {deal.timeline || "TBD"}
                        </p>
                        <p className="mt-2 text-sm">{deal.notes}</p>
                        <p className="mt-2 text-xs uppercase text-on-surface-variant">
                          {deal.status} ·{" "}
                          {new Date(deal.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {deal.conversationId ? (
                          <Link
                            href={`/messages/${deal.conversationId}`}
                            className="bg-primary px-3 py-2 text-xs font-bold uppercase text-white"
                          >
                            Open chat
                          </Link>
                        ) : null}
                        {deal.status === "active" ? (
                          <>
                            <button
                              type="button"
                              disabled={busyId === deal.id}
                              onClick={() =>
                                void handleDealStatus(deal.id, "completed")
                              }
                              className="bg-status-success px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-60"
                            >
                              Complete
                            </button>
                            <button
                              type="button"
                              disabled={busyId === deal.id}
                              onClick={() =>
                                void handleDealStatus(deal.id, "cancelled")
                              }
                              className="border border-border-subtle px-3 py-2 text-xs font-bold uppercase disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
