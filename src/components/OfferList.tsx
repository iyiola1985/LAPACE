"use client";

import Link from "next/link";
import { useState } from "react";
import type { UserProfile } from "@/lib/auth";
import {
  formatOfferAmount,
  respondToOffer,
  type MarketplaceOffer,
} from "@/lib/offers";

type OfferListProps = {
  offers: MarketplaceOffer[];
  user: UserProfile;
  onChange: (offers: MarketplaceOffer[]) => void;
};

export function OfferList({ offers, user, onChange }: OfferListProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [acceptedConversationId, setAcceptedConversationId] = useState<
    string | null
  >(null);

  async function handleAction(
    offerId: string,
    action: "accept" | "decline" | "withdraw",
  ) {
    setBusyId(offerId);
    setError("");
    try {
      const result = await respondToOffer({
        offerId,
        actor: user,
        action,
      });
      onChange(
        offers.map((offer) =>
          offer.id === result.offer.id
            ? result.offer
            : action === "accept" && offer.status === "pending"
              ? { ...offer, status: "declined" as const }
              : offer,
        ),
      );
      if (result.deal?.conversationId) {
        setAcceptedConversationId(result.deal.conversationId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update offer.");
    } finally {
      setBusyId(null);
    }
  }

  if (offers.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant">No offers yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-status-urgent">{error}</p> : null}
      {acceptedConversationId ? (
        <p className="text-sm text-status-success">
          Offer accepted.{" "}
          <Link
            href={`/messages/${acceptedConversationId}`}
            className="font-semibold underline"
          >
            Open deal chat
          </Link>
        </p>
      ) : null}
      {offers.map((offer) => {
        const isRecipient = offer.toUserId === user.id;
        const isSender = offer.fromUserId === user.id;
        return (
          <article
            key={offer.id}
            className="border border-border-subtle bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">
                  {offer.fromName} → {offer.toName}
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {formatOfferAmount(offer)} · {offer.timeline || "Timeline TBD"}
                </p>
                <p className="mt-2 text-sm">{offer.notes}</p>
                <p className="mt-2 text-xs uppercase text-on-surface-variant">
                  {offer.status} · {new Date(offer.createdAt).toLocaleString()}
                </p>
              </div>
              {offer.status === "pending" ? (
                <div className="flex flex-wrap gap-2">
                  {isRecipient ? (
                    <>
                      <button
                        type="button"
                        disabled={busyId === offer.id}
                        onClick={() => void handleAction(offer.id, "accept")}
                        className="bg-status-success px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={busyId === offer.id}
                        onClick={() => void handleAction(offer.id, "decline")}
                        className="bg-status-urgent px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-60"
                      >
                        Decline
                      </button>
                    </>
                  ) : null}
                  {isSender ? (
                    <button
                      type="button"
                      disabled={busyId === offer.id}
                      onClick={() => void handleAction(offer.id, "withdraw")}
                      className="border border-border-subtle px-3 py-2 text-xs font-bold uppercase disabled:opacity-60"
                    >
                      Withdraw
                    </button>
                  ) : null}
                </div>
              ) : null}
              {offer.status === "accepted" && offer.conversationId ? (
                <Link
                  href={`/messages/${offer.conversationId}`}
                  className="text-xs font-bold uppercase text-primary underline"
                >
                  Open chat
                </Link>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
