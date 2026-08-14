import Link from "next/link";
import { Icon } from "@/components/Icon";

const links = [
  {
    href: "/materials",
    title: "Material Catalog",
    subtitle: "Browse aluminum, stone coated tiles, and accessories",
    icon: "architecture",
  },
  {
    href: "/pros",
    title: "Marketplace",
    subtitle: "Find Lapace verified roofing professionals",
    icon: "storefront",
  },
  {
    href: "/quotes",
    title: "Quote Requests",
    subtitle: "Review and submit your project quote basket",
    icon: "request_quote",
  },
] as const;

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <section className="mb-8 flex items-center gap-4 rounded-xl border border-border-subtle bg-surface-container-lowest p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-xl font-bold text-on-primary-container">
          LA
        </div>
        <div>
          <h1 className="font-headline text-2xl font-bold text-primary">
            Guest Account
          </h1>
          <p className="text-sm text-on-surface-variant">
            Auth / contractor dashboard comes in a later phase. Use the links
            below to explore the MVP.
          </p>
        </div>
      </section>

      <div className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-container-lowest px-4 py-4 transition-colors hover:bg-surface-container-low"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-primary">
              <Icon name={link.icon} />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">{link.title}</p>
              <p className="text-xs text-on-surface-variant">{link.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
