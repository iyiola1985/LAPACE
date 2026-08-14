import Link from "next/link";
import { ProCardCompact } from "@/components/ProCardCompact";
import { materials, professionals, projects } from "@/lib/data";

export default function HomePage() {
  const featuredPros = professionals.slice(0, 3);
  const featuredAluminum = materials.find((m) => m.id === "aluminum-coils");
  const featuredStone = materials.find((m) => m.id === "stone-coated-tiles");

  return (
    <main>
      <section className="relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden bg-surface-dark">
        <div className="absolute inset-0 z-0 opacity-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
            alt="Premium modern roof installation"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-surface-dark via-surface-dark/80 to-transparent" />
        <div className="relative z-20 mx-auto max-w-4xl px-4 py-12 text-center md:px-8">
          <h1 className="mb-6 font-headline text-4xl font-extrabold tracking-tight text-white md:text-5xl md:leading-[56px]">
            Your Complete Roofing Solution
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-7 text-surface-variant">
            Expertise in importation, corrugation, and installation of premium
            aluminum and stone-coated roofs for residential and commercial
            projects.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/pros"
              className="w-full rounded-xl bg-primary-container px-6 py-3 text-sm font-semibold text-on-primary-container shadow-md transition-colors hover:bg-primary hover:text-on-primary sm:w-auto"
            >
              Find a Roofing Pro
            </Link>
            <Link
              href="/materials"
              className="w-full rounded-xl border border-border-subtle bg-surface px-6 py-3 text-sm font-semibold text-primary shadow-md transition-colors hover:bg-surface-container-low sm:w-auto"
            >
              Browse Materials
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-surface-bright px-4 py-12 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="mb-2 font-headline text-[28px] font-bold leading-9 text-on-background md:text-[32px] md:leading-10">
                Verified Professionals
              </h2>
              <p className="text-base text-on-surface-variant">
                Top-rated contractors ready for your project.
              </p>
            </div>
            <Link
              href="/pros"
              className="hidden items-center text-sm font-semibold text-primary hover:underline md:flex"
            >
              View Directory
              <span className="material-symbols-outlined ml-1 text-sm">
                arrow_forward
              </span>
            </Link>
          </div>
          <div className="scrollbar-hide flex snap-x gap-4 overflow-x-auto pb-4">
            {featuredPros.map((pro) => (
              <ProCardCompact key={pro.id} pro={pro} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface px-4 py-12 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 text-center">
            <h2 className="mb-2 font-headline text-[28px] font-bold leading-9 text-on-background md:text-[32px]">
              Premium Materials
            </h2>
            <p className="mx-auto max-w-2xl text-base text-on-surface-variant">
              High-quality imported and locally corrugated options for lasting
              durability.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {featuredAluminum ? (
              <div className="group flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-md md:col-span-8 md:flex-row">
                <div className="relative h-48 overflow-hidden md:h-auto md:w-1/2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredAluminum.image}
                    alt={featuredAluminum.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center p-3 md:w-1/2">
                  <span className="mb-2 text-xs font-medium uppercase tracking-wider text-primary-container">
                    Industrial Grade
                  </span>
                  <h3 className="mb-2 font-headline text-2xl font-semibold text-on-background">
                    {featuredAluminum.name}
                  </h3>
                  <p className="mb-4 text-base text-on-surface-variant">
                    {featuredAluminum.description}
                  </p>
                  <Link
                    href="/materials"
                    className="mt-auto self-start rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-low"
                  >
                    View Specifications
                  </Link>
                </div>
              </div>
            ) : null}

            {featuredStone ? (
              <div className="group flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-md md:col-span-4">
                <div className="relative h-48 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredStone.image}
                    alt={featuredStone.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-grow flex-col p-3">
                  <span className="mb-2 text-xs font-medium uppercase tracking-wider text-primary-container">
                    Premium Finish
                  </span>
                  <h3 className="mb-2 font-headline text-2xl font-semibold text-on-background">
                    {featuredStone.name}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-base text-on-surface-variant">
                    {featuredStone.description}
                  </p>
                  <Link
                    href="/materials"
                    className="mt-auto w-full rounded-lg border border-primary px-4 py-2 text-center text-sm font-semibold text-primary transition-colors hover:bg-surface-container-low"
                  >
                    Browse Catalog
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-surface-dark px-4 py-12 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className="mb-2 font-headline text-[28px] font-bold md:text-[32px]">
                Completed Projects
              </h2>
              <p className="text-base text-surface-variant">
                See our premium materials and expert installations in action
                across residential, commercial, and government projects.
              </p>
            </div>
            <Link
              href="/pros"
              className="whitespace-nowrap rounded-xl bg-surface-container-highest px-6 py-2 text-sm font-semibold text-on-background transition-colors hover:bg-surface-variant"
            >
              View Portfolio
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={
                  index === 1
                    ? "group relative hidden aspect-[4/3] cursor-pointer overflow-hidden rounded-xl md:block"
                    : index === 2
                      ? "group relative hidden aspect-[4/3] cursor-pointer overflow-hidden rounded-xl lg:block"
                      : "group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl"
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 opacity-90 transition-opacity group-hover:opacity-100">
                  <span className="mb-1 text-xs font-medium uppercase tracking-wider text-primary-fixed-dim">
                    {project.type}
                  </span>
                  <h3 className="font-headline text-2xl font-semibold text-white">
                    {project.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
