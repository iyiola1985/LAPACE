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

export default function RegisterClientPage() {
  const router = useRouter();
  const { registerClient } = useAuth();
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const result = registerClient({ fullName, email, phone, city, password });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <AuthShell
      title="Client Registration"
      subtitle="Create an account to request quotes and hire verified pros."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full name">
          <TextInput required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </FormField>
        <FormField label="Email">
          <TextInput required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField label="Phone">
          <TextInput required value={phone} onChange={(e) => setPhone(e.target.value)} />
        </FormField>
        <FormField label="City / Area">
          <TextInput required value={city} onChange={(e) => setCity(e.target.value)} />
        </FormField>
        <FormField label="Password">
          <TextInput required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormField>
        {error ? <p className="text-sm text-status-urgent">{error}</p> : null}
        <PrimaryButton type="submit" className="w-full">
          Create Client Account
        </PrimaryButton>
      </form>
      <p className="text-sm text-on-surface-variant">
        Contractor?{" "}
        <Link href="/register/pro" className="font-semibold text-primary underline">
          Register as Pro
        </Link>
      </p>
    </AuthShell>
  );
}
