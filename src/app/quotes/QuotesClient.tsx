"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icon";
import { useQuote } from "@/components/QuoteProvider";
import { useAuth } from "@/components/AuthProvider";
import { submitQuoteRequest } from "@/lib/admin";
import type { Professional } from "@/lib/data";
import { getMarketplacePro } from "@/lib/marketplace";

export default function QuotesClient() {
  const searchParams = useSearchParams();
  const proParam = searchParams.get("pro");
  const { user } = useAuth();
  const { items, removeItem, clear } = useQuote();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [linkedPro, setLinkedPro] = useState<Professional | null>(null);

  useEffect(() => {
    if (!proParam) {
      setLinkedPro(null);
      return;
    }
    let cancelled = false;
    void getMarketplacePro(proParam).then((pro) => {
      if (!cancelled) setLinkedPro(pro);
    });
    return () => {
      cancelled = true;
    };
  }, [proParam]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    const basket = [...items];
    if (linkedPro && !basket.some((item) => item.id === `pro:${linkedPro.id}`)) {
      basket.push({
        id: `pro:${linkedPro.id}`,
        name: linkedPro.name,
        kind: "pro",
      });
    }
    try {
      await submitQuoteRequest({
        fullName: name,
        email,
        phone,
        notes,
        items: basket,
        userId: user?.id ?? null,
      });
      setSubmitted(true);
      clear();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not send quote request.",
      );
    }
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center md:px-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-status-success/20 text-status-success">
          <Icon name="check_circle" filled className="text-4xl" />
        </div>
        <h1 className="mb-2 font-headline text-[28px] font-bold text-primary">
          Quote request sent
        </h1>
        <p className="mb-8 text-on-surface-variant">
          Thanks{name ? `, ${name}` : ""}. Your request was saved. A Lapace
          team member will follow up shortly.
        </p>
        <Link
          href="/"
          className="inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-on-primary"
        >
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="mb-2 font-headline text-[28px] font-bold text-primary md:text-[32px]">
        Request a Quote
      </h1>
      <p className="mb-8 text-on-surface-variant">
        Add materials or professionals, then submit your contact details.
      </p>

      {linkedPro ? (
        <div className="mb-6 rounded-xl border border-border-subtle bg-surface-container-lowest p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Requesting from
          </p>
          <p className="font-headline text-xl font-semibold text-on-surface">
            {linkedPro.name}
          </p>
        </div>
      ) : null}

      <section className="mb-8 rounded-xl border border-border-subtle bg-surface-container-lowest p-4">
        <h2 className="mb-3 text-sm font-semibold text-primary">Quote basket</h2>
        {items.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            No items yet.{" "}
            <Link href="/materials" className="text-primary underline">
              Browse materials
            </Link>{" "}
            or{" "}
            <Link href="/pros" className="text-primary underline">
              find a pro
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {item.name}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-on-surface-variant">
                    {item.kind}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container hover:text-primary"
                  aria-label={`Remove ${item.name}`}
                >
                  <Icon name="close" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-border-subtle bg-surface-container-lowest p-4 md:p-6"
      >
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Full name</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded border border-border-subtle bg-white px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Phone</span>
          <input
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded border border-border-subtle bg-white px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded border border-border-subtle bg-white px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Project notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            className="w-full rounded border border-border-subtle bg-white px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container"
            placeholder="Roof size, location, timeline..."
          />
        </label>
        {submitError ? (
          <p className="text-sm text-status-urgent">{submitError}</p>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container"
        >
          Submit Quote Request
        </button>
      </form>
    </main>
  );
}
