"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthShell,
  FormField,
  PasswordInput,
  PrimaryButton,
  TextInput,
} from "@/components/AuthForm";
import { useAuth } from "@/components/AuthProvider";
import {
  DEMO_CLIENT_EMAIL,
  DEMO_CLIENT_PASSWORD,
  ensureDemoAccounts,
} from "@/lib/admin";
import { dashboardPathFor } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, usingSupabase } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!usingSupabase) ensureDemoAccounts();
  }, [usingSupabase]);

  function fillDemoClient() {
    ensureDemoAccounts();
    setEmail(DEMO_CLIENT_EMAIL);
    setPassword(DEMO_CLIENT_PASSWORD);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      if (!usingSupabase) ensureDemoAccounts();
      const result = await login(email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(dashboardPathFor(result.profile));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell title="Log In" subtitle="Access your client or pro dashboard.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email">
          <TextInput
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <FormField label="Password">
          <PasswordInput
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </FormField>
        {error ? <p className="text-sm text-status-urgent">{error}</p> : null}
        <PrimaryButton type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in..." : "Log In"}
        </PrimaryButton>
      </form>

      {!usingSupabase ? (
        <div className="border border-border-subtle bg-surface-container-low px-3 py-3 text-sm text-on-surface-variant">
          <p className="font-semibold text-on-background">Test client login</p>
          <p className="mt-1">
            {DEMO_CLIENT_EMAIL} / {DEMO_CLIENT_PASSWORD}
          </p>
          <button
            type="button"
            onClick={fillDemoClient}
            className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-primary underline"
          >
            Fill client credentials
          </button>
        </div>
      ) : (
        <p className="text-sm text-on-surface-variant">
          Connected to Supabase. Use your registered account email and password.
        </p>
      )}

      <p className="text-sm text-on-surface-variant">
        New here?{" "}
        <Link href="/register" className="font-semibold text-primary underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
