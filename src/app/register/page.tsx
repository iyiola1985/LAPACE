import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
      <h1 className="accent-underline accent-underline-center mx-auto text-center text-2xl font-bold uppercase tracking-wide md:text-3xl">
        Create Your Account
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-center text-on-surface-variant">
        Choose how you want to use Lapace Roofing Marketplace.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Link
          href="/register/client"
          className="border border-border-subtle bg-white p-6 hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center bg-primary text-white">
            <Icon name="home" />
          </div>
          <h2 className="text-lg font-bold uppercase">I need a roofing pro</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            For homeowners and businesses hiring installers or requesting quotes.
          </p>
        </Link>
        <Link
          href="/register/pro"
          className="border border-border-subtle bg-white p-6 hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center bg-surface-dark text-white">
            <Icon name="engineering" />
          </div>
          <h2 className="text-lg font-bold uppercase">I offer roofing services</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            For contractors who want jobs and a Lapace Pro profile.
          </p>
        </Link>
      </div>
      <p className="mt-8 text-center text-sm text-on-surface-variant">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
