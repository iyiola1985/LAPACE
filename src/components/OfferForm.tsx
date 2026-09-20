"use client";

import { useState, type FormEvent } from "react";
import { PrimaryButton, FormField, TextInput, TextArea } from "@/components/AuthForm";
import type { UserProfile } from "@/lib/auth";
import { createOffer, type MarketplaceOffer } from "@/lib/offers";

type OfferFormProps = {
  user: UserProfile;
  jobId?: string;
  workPostId?: string;
  onCreated: (offer: MarketplaceOffer) => void;
};

export function OfferForm({
  user,
  jobId,
  workPostId,
  onCreated,
}: OfferFormProps) {
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [timeline, setTimeline] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const offer = await createOffer({
        fromUser: user,
        jobId,
        workPostId,
        amountMin: amountMin ? Number(amountMin) : undefined,
        amountMax: amountMax ? Number(amountMax) : undefined,
        timeline,
        notes,
      });
      onCreated(offer);
      setAmountMin("");
      setAmountMax("");
      setTimeline("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit offer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-4 border border-border-subtle bg-surface-container-low p-4"
    >
      <h3 className="font-bold uppercase tracking-wide">Submit offer</h3>
      <p className="text-xs text-on-surface-variant">
        Keep amounts, timelines, and scope on Lapace. Do not share phone or email.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Amount min (NGN)">
          <TextInput
            type="number"
            min={0}
            value={amountMin}
            onChange={(event) => setAmountMin(event.target.value)}
            placeholder="Optional"
          />
        </FormField>
        <FormField label="Amount max (NGN)">
          <TextInput
            type="number"
            min={0}
            value={amountMax}
            onChange={(event) => setAmountMax(event.target.value)}
            placeholder="Optional"
          />
        </FormField>
      </div>
      <FormField label="Timeline">
        <TextInput
          value={timeline}
          onChange={(event) => setTimeline(event.target.value)}
          placeholder="e.g. 2–3 weeks"
          required
        />
      </FormField>
      <FormField label="Scope / notes">
        <TextArea
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="What is included in this offer?"
          required
        />
      </FormField>
      {error ? <p className="text-sm text-status-urgent">{error}</p> : null}
      <PrimaryButton type="submit" disabled={busy}>
        {busy ? "Sending..." : "Send offer"}
      </PrimaryButton>
    </form>
  );
}
