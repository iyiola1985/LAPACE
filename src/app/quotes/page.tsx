import { Suspense } from "react";
import QuotesClient from "./QuotesClient";

export default function QuotesPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-4 py-10 text-on-surface-variant">
          Loading quotes...
        </main>
      }
    >
      <QuotesClient />
    </Suspense>
  );
}
