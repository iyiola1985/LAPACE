"use client";

import { useMemo, useState } from "react";
import { FilterChips } from "@/components/FilterChips";
import { Icon } from "@/components/Icon";
import { ProCard } from "@/components/ProCard";
import { proFilters, professionals, type ProFilter } from "@/lib/data";

export default function ProsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProFilter>("Residential");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return professionals.filter((pro) => {
      const matchesFilter = pro.filters.includes(filter);
      const matchesQuery =
        !normalized ||
        pro.name.toLowerCase().includes(normalized) ||
        pro.about.toLowerCase().includes(normalized) ||
        pro.tags.some((tag) => tag.toLowerCase().includes(normalized));
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <section className="mb-12">
        <h1 className="mb-3 text-center font-headline text-[32px] font-bold leading-10 md:text-left">
          Find a Roofing Professional
        </h1>
        <div className="relative mx-auto w-full max-w-3xl md:mx-0">
          <Icon
            name="search"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-full border border-border-subtle bg-surface-container-lowest py-3 pl-12 pr-4 text-base shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container"
            placeholder="Search by location or service..."
            type="search"
          />
        </div>
        <div className="mt-3 flex justify-center md:justify-start">
          <FilterChips
            options={proFilters}
            value={filter}
            onChange={setFilter}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.map((pro) => (
          <ProCard key={pro.id} pro={pro} />
        ))}
        {results.length === 0 ? (
          <p className="text-on-surface-variant md:col-span-2 lg:col-span-3">
            No professionals match this search. Try another filter.
          </p>
        ) : null}
      </section>
    </main>
  );
}
