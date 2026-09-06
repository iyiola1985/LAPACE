"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { PrimaryButton } from "@/components/AuthForm";
import { getJob, updateJobStatus, type JobPost } from "@/lib/jobs";
import { openConversation } from "@/lib/messages";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, ready } = useAuth();
  const [job, setJob] = useState<JobPost | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const next = await getJob(params.id);
        if (!cancelled) {
          setJob(next);
          if (!next) setError("Job not found.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load job.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, user, router, params.id]);

  async function handleMessageClient() {
    if (!user || !job || user.role !== "pro") return;
    setBusy(true);
    setError("");
    try {
      const conversation = await openConversation({
        clientId: job.clientId,
        clientName: job.clientName,
        proId: user.id,
        proName: user.companyName || user.fullName,
        jobId: job.id,
        senderId: user.id,
        initialMessage: `Hi ${job.clientName}, I'm interested in your job: ${job.title}`,
      });
      router.push(`/messages/${conversation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start chat.");
    } finally {
      setBusy(false);
    }
  }

  async function closeJob() {
    if (!job) return;
    setBusy(true);
    try {
      const updated = await updateJobStatus(job.id, "closed");
      setJob(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not close job.");
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

  if (!job) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-status-urgent">{error || "Job not found"}</p>
        <Link href="/jobs" className="mt-4 inline-block text-primary underline">
          Back to jobs
        </Link>
      </main>
    );
  }

  const isOwner = user.role === "client" && user.id === job.clientId;
  const isPro = user.role === "pro";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10">
      <Link href="/jobs" className="text-sm font-semibold text-primary underline">
        Back to job board
      </Link>

      <article className="mt-6 border border-border-subtle bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide">
              {job.title}
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              Posted by {job.clientName} · {job.city}
            </p>
          </div>
          <span className="bg-primary/15 px-2 py-1 text-xs font-bold uppercase text-primary">
            {job.status}
          </span>
        </div>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold uppercase tracking-wide text-on-surface-variant">
              Service
            </dt>
            <dd>{job.service}</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wide text-on-surface-variant">
              Budget
            </dt>
            <dd>{job.budget || "Not specified"}</dd>
          </div>
        </dl>

        <p className="mt-6 text-sm leading-relaxed text-on-surface-variant">
          {job.description}
        </p>

        {error ? <p className="mt-4 text-sm text-status-urgent">{error}</p> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {isPro && job.status === "open" ? (
            <PrimaryButton
              type="button"
              disabled={busy}
              onClick={() => void handleMessageClient()}
            >
              {busy ? "Opening..." : "Message Client"}
            </PrimaryButton>
          ) : null}
          {isOwner ? (
            <>
              <Link href="/messages">
                <PrimaryButton type="button">Open Messages</PrimaryButton>
              </Link>
              {job.status !== "closed" ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void closeJob()}
                  className="border border-border-subtle px-6 py-3 text-xs font-bold uppercase tracking-[0.12em]"
                >
                  Close Job
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      </article>
    </main>
  );
}
