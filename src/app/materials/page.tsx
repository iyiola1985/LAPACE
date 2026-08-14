"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FilterChips } from "@/components/FilterChips";
import { Icon } from "@/components/Icon";
import { MaterialCard } from "@/components/MaterialCard";
import { useQuote } from "@/components/QuoteProvider";
import {
  materialCategories,
  materials,
  type MaterialCategory,
} from "@/lib/data";

export default function MaterialsPage() {
  const [category, setCategory] = useState<MaterialCategory>("All Materials");
  const { items } = useQuote();

  const filtered = useMemo(() => {
    if (category === "All Materials") return materials;
    return materials.filter((material) => material.category === category);
  }, [category]);

  const quoteCount = items.filter((item) => item.kind === "material").length;

  return (
    <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-6 md:px-8">
      <section className="flex flex-col gap-2">
        <h1 className="font-headline text-[28px] font-bold text-primary md:text-[32px]">
          Materials Catalog
        </h1>
        <p className="max-w-2xl text-lg text-on-surface-variant">
          Browse our extensive inventory of high-grade roofing materials. Built
          for durability and designed for modern structural aesthetics.
        </p>
      </section>

      <section>
        <FilterChips
          options={materialCategories}
          value={category}
          onChange={setCategory}
          activeClassName="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-on-primary shadow-md transition-transform hover:-translate-y-0.5"
          idleClassName="rounded-full border border-border-subtle bg-surface px-6 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((material) => (
          <MaterialCard key={material.id} material={material} />
        ))}
      </section>

      <div className="h-24 md:hidden" />

      <div className="fixed bottom-16 right-4 z-40 md:bottom-8 md:right-8">
        <Link
          href="/quotes"
          className="flex items-center gap-3 rounded-full bg-tertiary-container px-6 py-4 text-on-tertiary-container shadow-lg transition-transform hover:scale-105 hover:bg-tertiary hover:text-on-primary active:scale-95"
        >
          <Icon name="request_quote" filled />
          <span className="text-sm font-bold">Request Bulk Quote</span>
          <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-surface text-xs font-bold text-primary">
            {quoteCount}
          </span>
        </Link>
      </div>
    </main>
  );
}
