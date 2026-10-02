"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BackToDashboard } from "@/components/BackToDashboard";
import { Icon } from "@/components/Icon";
import {
  ProfileCheckBadge,
  ProfileMediaCard,
  ProfilePillButton,
  formatCompactCount,
} from "@/components/ProfileMediaCard";
import { ProTrustBadges } from "@/components/ProTrustBadges";
import type { Professional } from "@/lib/data";
import { getMarketplacePro } from "@/lib/marketplace";
import { HireActions } from "./HireActions";

export default function ProProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [pro, setPro] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError("");
      try {
        const next = await getMarketplacePro(id);
        if (!cancelled) {
          setPro(next);
          if (!next) setError("Professional not found.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load profile.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-white/80">
        Loading professional...
      </main>
    );
  }

  if (error || !pro) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-status-urgent">{error || "Not found"}</p>
        <Link href="/pros" className="mt-4 inline-block text-primary underline">
          Back to marketplace
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-12">
      <BackToDashboard secondaryHref="/pros" secondaryLabel="Back to directory" />

      <section className="relative mb-8 overflow-hidden rounded-[1.75rem] shadow-[0_18px_40px_rgba(0,0,0,0.28)] md:mb-12">
        <div className="relative min-h-[420px] md:min-h-[520px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pro.avatar}
            alt={pro.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent" />

          <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-end gap-5 p-6 md:min-h-[520px] md:p-10">
            <div className="max-w-2xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                  {pro.name}
                </h1>
                <ProfileCheckBadge
                  certified={pro.certified}
                  verified={pro.verified}
                />
              </div>
              <p className="mb-3 text-base text-white/85 md:text-lg">
                {pro.specialty}
              </p>
              {pro.location ? (
                <p className="mb-4 flex items-center gap-1 text-sm font-medium text-white/75">
                  <Icon name="location_on" className="text-base" />
                  {pro.location}
                </p>
              ) : null}
              <p className="mb-5 max-w-xl text-sm leading-6 text-white/80 md:text-base">
                {pro.about}
              </p>
              <div className="mb-4">
                <ProTrustBadges pro={pro} size="md" variant="glass" />
              </div>
              <div className="mb-5 flex flex-wrap gap-2">
                {pro.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-wrap items-center gap-5 text-white/90">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                  <Icon name="work" className="text-[18px] text-white/70" />
                  {formatCompactCount(pro.projects)} projects
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                  <Icon name="thumb_up" className="text-[18px] text-white/70" />
                  {pro.satisfaction}%
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                  <Icon
                    name="photo_library"
                    className="text-[18px] text-white/70"
                  />
                  {formatCompactCount(pro.portfolio.length)} portfolio
                </span>
              </div>
              <ProfilePillButton href="#portfolio" variant="ghost">
                View Portfolio
              </ProfilePillButton>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <section className="rounded-[1.5rem] border border-white/15 bg-white/92 p-6 text-[#2c2c2c] shadow-lg backdrop-blur-sm">
            <h2 className="mb-3 border-b border-black/10 pb-2 text-2xl font-semibold text-[#2c2c2c]">
              Credentials
            </h2>
            <ul className="space-y-4">
              {pro.credentials.map((credential) => (
                <li key={credential.title} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <Icon name={credential.icon} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#2c2c2c]">
                      {credential.title}
                    </div>
                    <div className="text-xs font-medium text-[#555555]">
                      {credential.subtitle}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[1.5rem] border border-white/15 bg-white/92 p-6 text-[#2c2c2c] shadow-lg backdrop-blur-sm">
            <h2 className="mb-3 border-b border-black/10 pb-2 text-2xl font-semibold text-[#2c2c2c]">
              About
            </h2>
            <p className="text-base text-[#555555]">{pro.about}</p>
          </section>
        </div>

        <div className="lg:col-span-2" id="portfolio">
          <section className="pb-28 md:pb-24">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              Portfolio Gallery
            </h2>
            {pro.portfolio.length === 0 ? (
              <p className="text-sm text-white/80">
                Portfolio photos coming soon. Message this pro to discuss your
                project.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {pro.portfolio.map((item) => (
                  <ProfileMediaCard
                    key={`${item.title}-${item.image}`}
                    image={item.image}
                    imageAlt={item.title}
                    title={item.title}
                    subtitle={item.subtitle}
                    aspectClassName="aspect-[4/5] min-h-[280px]"
                    stats={[
                      { icon: "architecture", label: "Project", value: "1" },
                    ]}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <HireActions proId={pro.id} proName={pro.name} />
    </main>
  );
}
