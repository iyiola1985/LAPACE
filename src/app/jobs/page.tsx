"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { PrimaryButton } from "@/components/AuthForm";
import { ensureDemoJobs, listJobs, type JobPost } from "@/lib/jobs";

export default function JobsPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [jobs, setJobs] = useState<JobPost[]>([]);
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
        ensureDemoJobs();
        const next = await listJobs();
        if (!cancelled) setJobs(next);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load jobs.");
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
    if (user.role === "client") {
      return jobs.filter((job) => job.clientId === user.id);
    }
    if (user.role === "pro") {
      return jobs.filter((job) => job.status === "open" || job.hiredProId === user.id);
    }
    return jobs;
  }, [jobs, user]);

  if (!ready || !user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-on-surface-variant">
        Loading jobs...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="accent-underline text-2xl font-bold uppercase tracking-wide md:text-3xl">
            Job Board
          </h1>
          <p className="mt-3 text-sm text-on-surface-variant">
            {user.role === "client"
              ? "Post roofing work and chat with interested pros."
              : "Browse open client jobs and start a conversation."}
          </p>
        </div>
        {user.role === "client" ? (
          <Link href="/jobs/new">
            <PrimaryButton type="button">Post a Job</PrimaryButton>
          </Link>
        ) : null}
      </div>

      {error ? <p className="mt-4 text-sm text-status-urgent">{error}</p> : null}
      {loading ? (
        <p className="mt-6 text-on-surface-variant">Loading...</p>
      ) : (
        <div className="mt-8 space-y-4">
          {visible.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              {user.role === "client"
                ? "You have not posted any jobs yet."
                : "No open jobs right now. Check back soon."}
            </p>
          ) : (
            visible.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block border border-border-subtle bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold uppercase tracking-wide">
                      {job.title}
                    </h2>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {job.city} · {job.service} · {job.budget || "Budget TBD"}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm">{job.description}</p>
                  </div>
                  <span className="bg-primary/15 px-2 py-1 text-xs font-bold uppercase text-primary">
                    {job.status}
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
