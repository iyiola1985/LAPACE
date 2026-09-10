"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { redactContactDetails } from "@/lib/contactGuard";
import {
  listConversationsForUser,
  type Conversation,
} from "@/lib/messages";

export default function MessagesInboxPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [items, setItems] = useState<Conversation[]>([]);
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
        const next = await listConversationsForUser(user.id);
        if (!cancelled) setItems(next);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load messages.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-on-surface-variant">
        Loading messages...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10">
      <h1 className="accent-underline text-2xl font-bold uppercase tracking-wide md:text-3xl">
        Messages
      </h1>
      <p className="mt-3 text-sm text-on-surface-variant">
        Chat with clients and pros about jobs and hire requests.
      </p>

      {error ? <p className="mt-4 text-sm text-status-urgent">{error}</p> : null}
      {loading ? (
        <p className="mt-6 text-on-surface-variant">Loading...</p>
      ) : (
        <div className="mt-8 space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No conversations yet. Message a pro from the marketplace or reply
              to a job.
            </p>
          ) : (
            items.map((item) => {
              const other =
                user.id === item.clientId ? item.proName : item.clientName;
              return (
                <Link
                  key={item.id}
                  href={`/messages/${item.id}`}
                  className="block border border-border-subtle bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold uppercase tracking-wide">
                        {other}
                      </h2>
                      <p className="mt-1 line-clamp-1 text-sm text-on-surface-variant">
                        {item.lastMessage
                          ? redactContactDetails(item.lastMessage)
                          : "No messages yet"}
                      </p>
                    </div>
                    <span className="text-xs text-on-surface-variant">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </main>
  );
}
