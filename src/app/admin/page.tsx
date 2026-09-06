"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  listProProfiles,
  listQuoteRequests,
  setProStatus,
  updateQuoteStatus,
  type QuoteRequest,
} from "@/lib/admin";
import type { ProProfile, ProStatus } from "@/lib/auth";

export default function AdminPage() {
  const router = useRouter();
  const { user, ready, isAdmin, logout, usingSupabase } = useAuth();
  const [pros, setPros] = useState<ProProfile[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setError("");
    try {
      const [nextPros, nextQuotes] = await Promise.all([
        listProProfiles(),
        listQuoteRequests(),
      ]);
      setPros(nextPros);
      setQuotes(nextQuotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data.");
    }
  }

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      router.replace("/account");
      return;
    }
    void refresh();
  }, [ready, user, isAdmin, router]);

  if (!ready || !user || !isAdmin) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-on-surface-variant">
        Loading admin...
      </main>
    );
  }

  async function handleProStatus(id: string, status: ProStatus) {
    setBusy(true);
    try {
      await setProStatus(id, status);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update pro.");
    } finally {
      setBusy(false);
    }
  }

  async function handleQuoteStatus(id: string, status: QuoteRequest["status"]) {
    setBusy(true);
    try {
      const next = await updateQuoteStatus(id, status);
      setQuotes(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update quote.");
    } finally {
      setBusy(false);
    }
  }

  const pending = pros.filter((pro) => pro.status === "pending");
  const verified = pros.filter((pro) => pro.status === "verified");
  const rejected = pros.filter((pro) => pro.status === "rejected");
  const newQuotes = quotes.filter((quote) => quote.status === "new");

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Lapace Admin
          </p>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">
            Operations Dashboard
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Verify pros and manage incoming quote requests
            {usingSupabase ? " (Supabase)." : " (local demo)."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void logout().then(() => router.push("/"));
          }}
          className="border border-border-subtle px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant"
        >
          Log out
        </button>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-status-urgent">{error}</p>
      ) : null}

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="border border-border-subtle bg-white p-4">
          <p className="text-xs uppercase text-on-surface-variant">Pending pros</p>
          <p className="mt-1 text-3xl font-bold text-primary">{pending.length}</p>
        </div>
        <div className="border border-border-subtle bg-white p-4">
          <p className="text-xs uppercase text-on-surface-variant">Verified pros</p>
          <p className="mt-1 text-3xl font-bold">{verified.length}</p>
        </div>
        <div className="border border-border-subtle bg-white p-4">
          <p className="text-xs uppercase text-on-surface-variant">New quotes</p>
          <p className="mt-1 text-3xl font-bold">{newQuotes.length}</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="accent-underline text-xl font-bold uppercase tracking-wide">
          Pro verification
        </h2>
        <div className="mt-6 space-y-4">
          {pros.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No pro applications yet. When contractors register at{" "}
              <Link href="/register/pro" className="text-primary underline">
                /register/pro
              </Link>
              , they appear here.
            </p>
          ) : (
            pros.map((pro) => (
              <article
                key={pro.id}
                className="border border-border-subtle bg-white p-4 md:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold uppercase">{pro.companyName}</h3>
                    <p className="text-sm text-on-surface-variant">
                      {pro.fullName} · {pro.city} · {pro.email} · {pro.phone}
                    </p>
                    <p className="mt-2 text-sm">{pro.about}</p>
                    <p className="mt-1 text-xs uppercase text-on-surface-variant">
                      Services: {pro.services.join(", ")}
                    </p>
                    <span
                      className={
                        pro.status === "verified"
                          ? "mt-2 inline-block bg-status-success px-2 py-1 text-xs font-bold uppercase text-white"
                          : pro.status === "rejected"
                            ? "mt-2 inline-block bg-status-urgent px-2 py-1 text-xs font-bold uppercase text-white"
                            : "mt-2 inline-block bg-primary/15 px-2 py-1 text-xs font-bold uppercase text-primary"
                      }
                    >
                      {pro.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleProStatus(pro.id, "verified")}
                      className="bg-status-success px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleProStatus(pro.id, "pending")}
                      className="border border-border-subtle px-3 py-2 text-xs font-bold uppercase disabled:opacity-60"
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleProStatus(pro.id, "rejected")}
                      className="bg-status-urgent px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
        {rejected.length > 0 ? (
          <p className="mt-3 text-xs text-on-surface-variant">
            Rejected applications stay listed so you can reverse a decision.
          </p>
        ) : null}
      </section>

      <section className="mt-12">
        <h2 className="accent-underline text-xl font-bold uppercase tracking-wide">
          Quote inbox
        </h2>
        <div className="mt-6 space-y-4">
          {quotes.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No quote requests yet. Submissions from{" "}
              <Link href="/quotes" className="text-primary underline">
                /quotes
              </Link>{" "}
              show up here.
            </p>
          ) : (
            quotes.map((quote) => (
              <article
                key={quote.id}
                className="border border-border-subtle bg-white p-4 md:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{quote.fullName}</h3>
                    <p className="text-sm text-on-surface-variant">
                      {quote.email} · {quote.phone}
                    </p>
                    <p className="mt-2 text-sm">{quote.notes || "No notes"}</p>
                    <ul className="mt-2 text-xs text-on-surface-variant">
                      {quote.items.map((item) => (
                        <li key={item.id}>
                          • {item.kind}: {item.name}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-on-surface-variant">
                      {new Date(quote.createdAt).toLocaleString()} · {quote.status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleQuoteStatus(quote.id, "contacted")}
                      className="bg-primary px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-60"
                    >
                      Mark contacted
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleQuoteStatus(quote.id, "closed")}
                      className="border border-border-subtle px-3 py-2 text-xs font-bold uppercase disabled:opacity-60"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleQuoteStatus(quote.id, "new")}
                      className="border border-border-subtle px-3 py-2 text-xs font-bold uppercase disabled:opacity-60"
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
