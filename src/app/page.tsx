import Link from "next/link";
import { ProCardCompact } from "@/components/ProCardCompact";
import { materials, professionals, projects } from "@/lib/data";

export default function HomePage() {
  const featuredPros = professionals.slice(0, 3);
  const featuredAluminum = materials.find((m) => m.id === "aluminum-coils");
  const featuredStone = materials.find((m) => m.id === "stone-coated-tiles");

  return (
    <main>
      <section className="relative flex min-h-[52vh] w-full items-end overflow-hidden bg-surface-dark md:min-h-[60vh]">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
            alt="Premium modern roof installation"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-10 bg-black/55" />
        <div className="relative z-20 mx-auto w-full max-w-7xl px-4 py-14 md:px-8 md:py-20">
          <h1 className="accent-underline max-w-3xl text-4xl font-bold tracking-tight text-white md:text-5xl">
            Your Complete Roofing Solution
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/85 md:text-lg">
            Expertise in importation, corrugation, and installation of premium
            aluminum and stone-coated roofs for residential and commercial
            projects.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pros"
              className="inline-flex items-center justify-center bg-primary px-7 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-primary-container"
            >
              Find a Roofing Pro
            </Link>
            <Link
              href="/materials"
              className="inline-flex items-center justify-center border border-white/80 bg-transparent px-7 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white hover:text-surface-dark"
            >
              Browse Materials
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="accent-underline text-2xl font-bold uppercase tracking-wide text-on-background md:text-3xl">
                Verified Professionals
              </h2>
              <p className="mt-4 text-base text-on-surface-variant">
                Top-rated contractors ready for your project.
              </p>
            </div>
            <Link
              href="/pros"
              className="hidden text-xs font-bold uppercase tracking-[0.12em] text-primary hover:underline md:inline-flex"
            >
              View Directory →
            </Link>
          </div>
          <div className="scrollbar-hide flex snap-x gap-4 overflow-x-auto pb-4">
            {featuredPros.map((pro) => (
              <ProCardCompact key={pro.id} pro={pro} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-4 py-14 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h2 className="accent-underline accent-underline-center text-2xl font-bold uppercase tracking-wide text-on-background md:text-3xl">
              Premium Materials
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-on-surface-variant">
              High-quality imported and locally corrugated options for lasting
              durability.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {featuredAluminum ? (
              <div className="group flex flex-col overflow-hidden border border-border-subtle bg-white shadow-sm transition-shadow hover:shadow-md md:col-span-8 md:flex-row">
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
                  <h3 className="mb-2 text-2xl font-bold uppercase text-on-background">
                    {featuredAluminum.name}
                  </h3>
                  <p className="mb-5 text-base text-on-surface-variant">
                    {featuredAluminum.description}
                  </p>
                  <Link
                    href="/materials"
                    className="mt-auto self-start border border-primary px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    View Specifications
                  </Link>
                </div>
              </div>
            ) : null}

            {featuredStone ? (
              <div className="group flex flex-col overflow-hidden border border-border-subtle bg-white shadow-sm transition-shadow hover:shadow-md md:col-span-4">
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
                  <h3 className="mb-2 text-xl font-bold uppercase text-on-background">
                    {featuredStone.name}
                  </h3>
                  <p className="mb-5 line-clamp-2 text-base text-on-surface-variant">
                    {featuredStone.description}
                  </p>
                  <Link
                    href="/materials"
                    className="mt-auto w-full border border-primary px-5 py-2 text-center text-xs font-bold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    Browse Catalog
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-surface-dark px-4 py-14 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className="accent-underline text-2xl font-bold uppercase tracking-wide md:text-3xl">
                Completed Projects
              </h2>
              <p className="mt-4 text-base text-white/70">
                See our premium materials and expert installations in action
                across residential, commercial, and government projects.
              </p>
            </div>
            <Link
              href="/pros"
              className="border border-white/30 bg-white px-6 py-2 text-xs font-bold uppercase tracking-[0.12em] text-surface-dark transition-colors hover:bg-primary hover:text-white"
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
                    ? "group relative hidden aspect-[4/3] cursor-pointer overflow-hidden md:block"
                    : index === 2
                      ? "group relative hidden aspect-[4/3] cursor-pointer overflow-hidden lg:block"
                      : "group relative aspect-[4/3] cursor-pointer overflow-hidden"
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/25 to-transparent p-4">
                  <span className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                    {project.type}
                  </span>
                  <h3 className="text-xl font-bold text-white">{project.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
