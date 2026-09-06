"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthShell,
  FormField,
  PrimaryButton,
  TextArea,
  TextInput,
} from "@/components/AuthForm";
import { useAuth } from "@/components/AuthProvider";
import { PRO_SERVICES } from "@/lib/auth";
import { createJob } from "@/lib/jobs";

export default function NewJobPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [service, setService] = useState(PRO_SERVICES[0]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "client") {
      router.replace("/jobs");
    }
  }, [ready, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || user.role !== "client") return;
    setError("");
    setPending(true);
    try {
      const job = await createJob({
        clientId: user.id,
        clientName: user.fullName,
        title,
        description,
        city: city || user.city,
        budget,
        service,
      });
      router.push(`/jobs/${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post job.");
    } finally {
      setPending(false);
    }
  }

  if (!ready || !user || user.role !== "client") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-on-surface-variant">
        Loading...
      </main>
    );
  }

  return (
    <AuthShell
      title="Post a Job"
      subtitle="Describe your roofing project so verified pros can reach out."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Job title">
          <TextInput
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Re-roof bungalow in Ikeja"
          />
        </FormField>
        <FormField label="City / Area">
          <TextInput
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={user.city}
          />
        </FormField>
        <FormField label="Service type">
          <select
            required
            value={service}
            onChange={(e) => setService(e.target.value as typeof service)}
            className="w-full border border-border-subtle bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {PRO_SERVICES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Budget (optional)">
          <TextInput
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. ₦800k – ₦1.2m"
          />
        </FormField>
        <FormField label="Project details">
          <TextArea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Roof type, size, timeline, access notes..."
          />
        </FormField>
        {error ? <p className="text-sm text-status-urgent">{error}</p> : null}
        <PrimaryButton type="submit" className="w-full" disabled={pending}>
          {pending ? "Posting..." : "Publish Job"}
        </PrimaryButton>
      </form>
      <Link href="/jobs" className="text-sm font-semibold text-primary underline">
        Back to job board
      </Link>
    </AuthShell>
  );
}
