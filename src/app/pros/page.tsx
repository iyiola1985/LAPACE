"use client";

import { useEffect, useMemo, useState } from "react";
import { FilterChips } from "@/components/FilterChips";
import { Icon } from "@/components/Icon";
import { ProCard } from "@/components/ProCard";
import { proFilters, type ProFilter, type Professional } from "@/lib/data";
import { listMarketplacePros } from "@/lib/marketplace";
import { useAuth } from "@/components/AuthProvider";

export default function ProsPage() {
  const { usingSupabase } = useAuth();
  const [query, setQuery] = useState("");
  const filterOptions = ["All", ...proFilters] as Array<"All" | ProFilter>;
  const [filter, setFilter] = useState<"All" | ProFilter>("All");
  const [pros, setPros] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError("");
      try {
        const next = await listMarketplacePros();
        if (!cancelled) setPros(next);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load professionals.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return pros.filter((pro) => {
      const matchesFilter =
        filter === "All" || pro.filters.includes(filter as ProFilter);
      const matchesQuery =
        !normalized ||
        pro.name.toLowerCase().includes(normalized) ||
        pro.about.toLowerCase().includes(normalized) ||
        pro.tags.some((tag) => tag.toLowerCase().includes(normalized));
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, pros]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <section className="mb-12">
        <h1 className="accent-underline mb-2 text-center text-2xl font-bold uppercase tracking-wide md:text-left md:text-3xl">
          Find a Roofing Professional
        </h1>
        <p className="mb-6 text-center text-sm text-on-surface-variant md:text-left">
          {usingSupabase
            ? "Showing Lapace-verified pros from the live directory."
            : "Showing seed pros plus locally verified registrations."}
        </p>
        <div className="relative mx-auto w-full max-w-3xl md:mx-0">
          <Icon
            name="search"
            className="absolute top-1/2 left-4 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-full border border-border-subtle bg-surface-container-lowest py-3 pr-4 pl-12 text-base shadow-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary-container focus:outline-none"
            placeholder="Search by location or service..."
            type="search"
          />
        </div>
        <div className="mt-3 flex justify-center md:justify-start">
          <FilterChips
            options={filterOptions}
            value={filter}
            onChange={setFilter}
          />
        </div>
      </section>

      {loading ? (
        <p className="text-on-surface-variant">Loading verified professionals...</p>
      ) : null}
      {error ? <p className="text-status-urgent">{error}</p> : null}

      {!loading && !error ? (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((pro) => (
            <ProCard key={pro.id} pro={pro} />
          ))}
          {results.length === 0 ? (
            <p className="text-on-surface-variant md:col-span-2 lg:col-span-3">
              No verified professionals match this search yet.
              {usingSupabase
                ? " Approve pros in Admin to publish them here."
                : " Approve a registered pro in Admin, or browse seed listings with All filter."}
            </p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
