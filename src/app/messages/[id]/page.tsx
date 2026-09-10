"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { PrimaryButton } from "@/components/AuthForm";
import { redactContactDetails } from "@/lib/contactGuard";
import { updateJobStatus } from "@/lib/jobs";
import {
  getConversation,
  listMessages,
  sendMessage,
  type ChatMessage,
  type Conversation,
} from "@/lib/messages";

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, ready } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  async function refresh() {
    const nextConversation = await getConversation(params.id);
    if (!nextConversation) {
      setError("Conversation not found.");
      setConversation(null);
      return;
    }
    setConversation(nextConversation);
    const nextMessages = await listMessages(params.id);
    setMessages(nextMessages);
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
        await refresh();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load conversation.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user, router, params.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !body.trim()) return;
    setBusy(true);
    setError("");
    try {
      await sendMessage({
        conversationId: params.id,
        senderId: user.id,
        body,
      });
      setBody("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message.");
    } finally {
      setBusy(false);
    }
  }

  async function hirePro() {
    if (!user || !conversation || user.role !== "client") return;
    if (!conversation.jobId) {
      setError("This chat is not linked to a job post.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await updateJobStatus(conversation.jobId, "hired", conversation.proId);
      await sendMessage({
        conversationId: conversation.id,
        senderId: user.id,
        body: `I've hired ${conversation.proName} for this job.`,
      });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not hire pro.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready || !user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-on-surface-variant">
        Loading chat...
      </main>
    );
  }

  if (!conversation) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-status-urgent">{error || "Conversation not found"}</p>
        <Link
          href="/messages"
          className="mt-4 inline-block text-primary underline"
        >
          Back to inbox
        </Link>
      </main>
    );
  }

  const otherName =
    user.id === conversation.clientId
      ? conversation.proName
      : conversation.clientName;

  const canHire =
    user.role === "client" &&
    user.id === conversation.clientId &&
    Boolean(conversation.jobId);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div>
          <Link
            href="/messages"
            className="text-sm font-semibold text-primary underline"
          >
            Inbox
          </Link>
          <h1 className="mt-2 text-xl font-bold uppercase tracking-wide">
            {otherName}
          </h1>
          {conversation.jobId ? (
            <Link
              href={`/jobs/${conversation.jobId}`}
              className="text-xs text-on-surface-variant underline"
            >
              View linked job
            </Link>
          ) : null}
        </div>
        {canHire ? (
          <PrimaryButton
            type="button"
            disabled={busy}
            onClick={() => void hirePro()}
          >
            Hire this Pro
          </PrimaryButton>
        ) : null}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {messages.map((message) => {
          const mine = message.senderId === user.id;
          return (
            <div
              key={message.id}
              className={mine ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  mine
                    ? "max-w-[80%] bg-primary px-3 py-2 text-sm text-white"
                    : "max-w-[80%] border border-border-subtle bg-white px-3 py-2 text-sm"
                }
              >
                <p>{redactContactDetails(message.body)}</p>
                <p
                  className={
                    mine
                      ? "mt-1 text-[10px] text-white/80"
                      : "mt-1 text-[10px] text-on-surface-variant"
                  }
                >
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error ? <p className="mb-2 text-sm text-status-urgent">{error}</p> : null}

      <form onSubmit={handleSend} className="flex gap-2 border-t border-border-subtle pt-4">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-border-subtle px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <PrimaryButton type="submit" disabled={busy || !body.trim()}>
          Send
        </PrimaryButton>
      </form>
    </main>
  );
}
