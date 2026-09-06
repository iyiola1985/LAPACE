"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthShell,
  FormField,
  PrimaryButton,
  TextInput,
} from "@/components/AuthForm";
import { useAuth } from "@/components/AuthProvider";
import { dashboardPathFor } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(dashboardPathFor(result.profile));
  }

  return (
    <AuthShell title="Log In" subtitle="Access your client or pro dashboard.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email">
          <TextInput required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField label="Password">
          <TextInput required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormField>
        {error ? <p className="text-sm text-status-urgent">{error}</p> : null}
        <PrimaryButton type="submit" className="w-full">
          Log In
        </PrimaryButton>
      </form>
      <p className="text-sm text-on-surface-variant">
        New here?{" "}
        <Link href="/register" className="font-semibold text-primary underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
