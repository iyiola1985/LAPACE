"use client";

import Link from "next/link";
import { FeaturedPros } from "@/components/FeaturedPros";
import {
  FadeIn,
  HeroItem,
  HeroReveal,
  PageReveal,
  Stagger,
  StaggerItem,
} from "@/components/Motion";
import { ScrollFrameSequence } from "@/components/ScrollFrameSequence";
import { materials, projects } from "@/lib/data";

export default function HomePage() {
  const featuredAluminum = materials.find((m) => m.id === "aluminum-coils");
  const featuredStone = materials.find((m) => m.id === "stone-coated-tiles");

  return (
    <ScrollFrameSequence>
      <main className="relative">
        <section className="relative z-10 flex min-h-[100dvh] w-full items-end">
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25" />
          <HeroReveal className="relative z-20 mx-auto w-full max-w-7xl px-4 pb-16 pt-14 md:px-8 md:pb-20 md:pt-20">
            <HeroItem>
              <h1 className="accent-underline max-w-3xl text-4xl font-bold tracking-tight text-white md:text-5xl">
                Your Complete Roofing Solution
              </h1>
            </HeroItem>
            <HeroItem>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/85 md:text-lg">
                Expertise in importation, corrugation, and installation of
                premium aluminum and stone-coated roofs for residential and
                commercial projects.
              </p>
            </HeroItem>
            <HeroItem>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/register/client"
                  className="inline-flex items-center justify-center bg-primary px-7 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-primary-container"
                >
                  Register as Client
                </Link>
                <Link
                  href="/register/pro"
                  className="inline-flex items-center justify-center border border-white/80 bg-transparent px-7 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white hover:text-surface-dark"
                >
                  Register as Pro Company
                </Link>
                <Link
                  href="/pros"
                  className="inline-flex items-center justify-center border border-white/40 bg-transparent px-7 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white/90 transition-colors hover:bg-white/10"
                >
                  Find a Roofing Pro
                </Link>
              </div>
            </HeroItem>
          </HeroReveal>
        </section>

        <FeaturedPros />

        <PageReveal as="section" className="bg-transparent px-4 py-16 md:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <FadeIn className="mb-8 text-center">
              <h2 className="accent-underline accent-underline-center text-2xl font-bold uppercase tracking-wide text-white drop-shadow-md md:text-3xl">
                Premium Materials
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 drop-shadow">
                High-quality imported and locally corrugated options for lasting
                durability.
              </p>
            </FadeIn>

            <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-12">
              {featuredAluminum ? (
                <StaggerItem className="md:col-span-8">
                  <div className="group flex h-full flex-col overflow-hidden border border-white/25 bg-white/15 shadow-lg backdrop-blur-sm transition-colors hover:bg-white/25 md:flex-row">
                    <div className="relative h-48 overflow-hidden md:h-auto md:w-1/2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featuredAluminum.image}
                        alt={featuredAluminum.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col justify-center p-6 md:w-1/2">
                      <span className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                        Industrial Grade
                      </span>
                      <h3 className="mb-2 text-2xl font-bold uppercase text-white drop-shadow">
                        {featuredAluminum.name}
                      </h3>
                      <p className="mb-5 text-base text-white/80">
                        {featuredAluminum.description}
                      </p>
                      <Link
                        href="/materials"
                        className="mt-auto self-start border border-white/70 px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white hover:text-surface-dark"
                      >
                        View Specifications
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              ) : null}

              {featuredStone ? (
                <StaggerItem className="md:col-span-4">
                  <div className="group flex h-full flex-col overflow-hidden border border-white/25 bg-white/15 shadow-lg backdrop-blur-sm transition-colors hover:bg-white/25">
                    <div className="relative h-48 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featuredStone.image}
                        alt={featuredStone.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-grow flex-col p-6">
                      <span className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                        Premium Finish
                      </span>
                      <h3 className="mb-2 text-xl font-bold uppercase text-white drop-shadow">
                        {featuredStone.name}
                      </h3>
                      <p className="mb-5 line-clamp-2 text-base text-white/80">
                        {featuredStone.description}
                      </p>
                      <Link
                        href="/materials"
                        className="mt-auto w-full border border-white/70 px-5 py-2 text-center text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white hover:text-surface-dark"
                      >
                        Browse Catalog
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              ) : null}
            </Stagger>
          </div>
        </PageReveal>

        <PageReveal
          as="section"
          className="bg-transparent px-4 py-16 text-white md:px-8"
        >
          <div className="mx-auto w-full max-w-7xl">
            <FadeIn className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <h2 className="accent-underline text-2xl font-bold uppercase tracking-wide drop-shadow-md md:text-3xl">
                  Completed Projects
                </h2>
                <p className="mt-4 text-base text-white/80 drop-shadow">
                  See our premium materials and expert installations in action
                  across residential, commercial, and government projects.
                </p>
              </div>
              <Link
                href="/pros"
                className="border border-white/50 bg-white/15 px-6 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-surface-dark"
              >
                View Portfolio
              </Link>
            </FadeIn>

            <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <StaggerItem
                  key={project.id}
                  className={
                    index === 1
                      ? "hidden md:block"
                      : index === 2
                        ? "hidden lg:block"
                        : undefined
                  }
                >
                  <div className="group relative aspect-[4/3] cursor-pointer overflow-hidden border border-white/20 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/20 to-transparent p-4">
                      <span className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                        {project.type}
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        {project.title}
                      </h3>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </PageReveal>
      </main>
    </ScrollFrameSequence>
  );
}
