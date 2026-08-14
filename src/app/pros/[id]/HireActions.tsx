"use client";

import { useQuote } from "@/components/QuoteProvider";

type HireActionsProps = {
  proId: string;
  proName: string;
};

export function HireActions({ proId, proName }: HireActionsProps) {
  const { addItem } = useQuote();

  return (
    <div className="fixed bottom-20 left-0 z-40 flex w-full items-center justify-end gap-4 border-t border-border-subtle bg-surface-container-lowest p-4 shadow-[0_-4px_12px_rgba(46,49,146,0.08)] md:bottom-0">
      <div className="mx-auto flex w-full max-w-7xl justify-end gap-4 px-4 md:px-8">
        <button
          type="button"
          className="rounded-lg border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-container/10"
        >
          Message Pro
        </button>
        <button
          type="button"
          onClick={() =>
            addItem({ id: `pro:${proId}`, name: proName, kind: "pro" })
          }
          className="rounded-lg bg-tertiary-container px-6 py-3 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-tertiary"
        >
          Hire for Project
        </button>
      </div>
    </div>
  );
}
