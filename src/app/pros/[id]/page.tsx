import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { getProfessional } from "@/lib/data";
import { HireActions } from "./HireActions";

type ProProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProProfilePage({ params }: ProProfilePageProps) {
  const { id } = await params;
  const pro = getProfessional(id);

  if (!pro) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-12">
      <Link
        href="/pros"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        <Icon name="arrow_back" className="text-sm" /> Back to directory
      </Link>

      <section className="relative mb-6 flex flex-col items-center gap-6 overflow-hidden rounded-xl border border-border-subtle bg-surface-container-lowest p-6 md:mb-12 md:flex-row md:items-start">
        <div className="absolute right-0 top-0 -z-0 h-32 w-32 rounded-bl-full bg-primary-fixed opacity-20" />
        <div className="relative z-10 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pro.avatar}
            alt={pro.name}
            className="h-32 w-32 rounded-full border-4 border-surface-container-lowest object-cover shadow-md md:h-40 md:w-40"
          />
          {pro.verified ? (
            <div
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-status-success text-on-primary"
              title="Verified Pro"
            >
              <Icon name="verified" filled className="text-[16px]" />
            </div>
          ) : null}
        </div>

        <div className="relative z-10 flex-1 text-center md:text-left">
          <h1 className="mb-2 font-headline text-[28px] font-bold text-primary md:text-[32px]">
            {pro.name}
          </h1>
          <p className="mb-4 flex items-center justify-center gap-2 text-lg text-on-surface-variant md:justify-start">
            {pro.specialty}
          </p>
          <div className="mb-3 flex flex-wrap justify-center gap-2 md:justify-start">
            {pro.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid w-full grid-cols-3 gap-4 border-t border-border-subtle pt-4 text-center md:w-auto md:border-l md:border-t-0 md:pl-6 md:pt-0 md:text-right">
          <div>
            <div className="font-headline text-2xl font-semibold text-primary">
              {pro.projects}+
            </div>
            <div className="text-xs font-medium text-on-surface-variant">
              Projects
            </div>
          </div>
          <div>
            <div className="font-headline text-2xl font-semibold text-status-success">
              {pro.satisfaction}%
            </div>
            <div className="text-xs font-medium text-on-surface-variant">
              Satisfaction
            </div>
          </div>
          <div>
            <div className="font-headline text-2xl font-semibold text-primary">
              {pro.yearsOnLapace} Yrs
            </div>
            <div className="text-xs font-medium text-on-surface-variant">
              on Lapace
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <section className="rounded-xl border border-border-subtle bg-surface-container-lowest p-6">
            <h2 className="mb-3 border-b border-border-subtle pb-2 font-headline text-2xl font-semibold text-primary">
              Credentials
            </h2>
            <ul className="space-y-4">
              {pro.credentials.map((credential) => (
                <li key={credential.title} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                    <Icon name={credential.icon} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-on-surface">
                      {credential.title}
                    </div>
                    <div className="text-xs font-medium text-on-surface-variant">
                      {credential.subtitle}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-border-subtle bg-surface-container-lowest p-6">
            <h2 className="mb-3 border-b border-border-subtle pb-2 font-headline text-2xl font-semibold text-primary">
              About
            </h2>
            <p className="text-base text-on-surface-variant">{pro.about}</p>
          </section>
        </div>

        <div className="lg:col-span-2">
          <section className="pb-28 md:pb-24">
            <h2 className="mb-3 font-headline text-2xl font-semibold text-primary">
              Portfolio Gallery
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {pro.portfolio.map((item) => (
                <article
                  key={item.title}
                  className="overflow-hidden rounded-xl border border-border-subtle bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="aspect-[3/2] w-full overflow-hidden bg-surface-container-low">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-on-surface">
                      {item.title}
                    </h3>
                    <p className="text-xs font-medium text-on-surface-variant">
                      {item.subtitle}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

      <HireActions proId={pro.id} proName={pro.name} />
    </main>
  );
}
