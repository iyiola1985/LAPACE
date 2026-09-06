"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuote } from "@/components/QuoteProvider";
import { useAuth } from "@/components/AuthProvider";
import { openConversation } from "@/lib/messages";

type HireActionsProps = {
  proId: string;
  proName: string;
};

export function HireActions({ proId, proName }: HireActionsProps) {
  const router = useRouter();
  const { addItem } = useQuote();
  const { user, ready } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleMessage() {
    setError("");
    if (!ready) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "client") {
      setError("Only clients can message pros from the marketplace.");
      return;
    }
    if (user.id === proId) return;

    setBusy(true);
    try {
      const conversation = await openConversation({
        clientId: user.id,
        clientName: user.fullName,
        proId,
        proName,
        senderId: user.id,
        initialMessage: `Hi ${proName}, I'm interested in hiring you for a roofing project.`,
      });
      router.push(`/messages/${conversation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start chat.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-20 left-0 z-40 flex w-full items-center justify-end gap-4 border-t border-border-subtle bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:bottom-0">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-end gap-2 px-4 md:px-8">
        {error ? <p className="text-sm text-status-urgent">{error}</p> : null}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleMessage()}
            className="border border-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary-fixed disabled:opacity-60"
          >
            {busy ? "Opening..." : "Message Pro"}
          </button>
          <button
            type="button"
            onClick={() =>
              addItem({ id: `pro:${proId}`, name: proName, kind: "pro" })
            }
            className="bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white shadow-sm transition-colors hover:bg-primary-container"
          >
            Hire for Project
          </button>
        </div>
      </div>
    </div>
  );
}
