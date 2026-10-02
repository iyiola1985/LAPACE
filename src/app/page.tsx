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
import { materials, projects } from "@/lib/data";

export default function HomePage() {
  const featuredAluminum = materials.find((m) => m.id === "aluminum-coils");
  const featuredStone = materials.find((m) => m.id === "stone-coated-tiles");

  return (
    <main className="font-helvetica relative">
      <section className="relative z-10 flex min-h-[100dvh] w-full items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        <HeroReveal className="relative z-20 mx-auto w-full max-w-7xl px-4 py-24 md:px-8 md:py-28">
          <div className="max-w-xl text-left md:max-w-2xl">
            <HeroItem>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Lapace Marketplace
              </p>
            </HeroItem>
            <HeroItem>
              <h1 className="text-[2.5rem] font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Where Contractors
                <br />
                Meet Workers.
              </h1>
            </HeroItem>
            <HeroItem>
              <p className="mt-6 max-w-md text-base leading-7 text-white/90 md:text-lg">
                Lapace is the roofing marketplace where verified contractors and
                skilled workers connect, hire, and get hired — with quotes,
                jobs, and deals kept on-site from first message to finish.
              </p>
            </HeroItem>
            <HeroItem>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-sm bg-primary px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary-container"
                >
                  Join the Marketplace
                </Link>
                <Link
                  href="/pros"
                  className="inline-flex items-center justify-center rounded-sm border border-white/50 bg-transparent px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-surface-dark"
                >
                  Browse Pros
                </Link>
              </div>
            </HeroItem>
            <HeroItem>
              <p className="mt-6 text-sm text-white/70">
                For clients hiring crews · For pros finding work · One Lapace
                network
              </p>
            </HeroItem>
          </div>
        </HeroReveal>
      </section>

      <FeaturedPros />

        <PageReveal as="section" className="bg-transparent px-4 py-16 md:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <FadeIn className="mb-8 text-center">
              <h2 className="accent-underline accent-underline-center text-2xl font-bold uppercase tracking-wide text-white md:text-3xl">
                Premium Materials
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-white">
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
                      <h3 className="mb-2 text-2xl font-bold uppercase text-white">
                        {featuredAluminum.name}
                      </h3>
                      <p className="mb-5 text-base text-white">
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
                      <h3 className="mb-2 text-xl font-bold uppercase text-white">
                        {featuredStone.name}
                      </h3>
                      <p className="mb-5 line-clamp-2 text-base text-white">
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
                <h2 className="accent-underline text-2xl font-bold uppercase tracking-wide md:text-3xl">
                  Completed Projects
                </h2>
                <p className="mt-4 text-base text-white">
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
  );
}
