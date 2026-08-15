"use client";

import { useQuote } from "@/components/QuoteProvider";

type HireActionsProps = {
  proId: string;
  proName: string;
};

export function HireActions({ proId, proName }: HireActionsProps) {
  const { addItem } = useQuote();

  return (
    <div className="fixed bottom-20 left-0 z-40 flex w-full items-center justify-end gap-4 border-t border-border-subtle bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:bottom-0">
      <div className="mx-auto flex w-full max-w-7xl justify-end gap-4 px-4 md:px-8">
        <button
          type="button"
          className="border border-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary-fixed"
        >
          Message Pro
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
  );
}
