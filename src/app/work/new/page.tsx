"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { BackToDashboard } from "@/components/BackToDashboard";
import { PrimaryButton, FormField, TextInput, TextArea } from "@/components/AuthForm";
import { PRO_SERVICES } from "@/lib/auth";
import { marketplaceLockMessage } from "@/lib/access";
import {
  createWorkPost,
  type WorkAudience,
  type WorkPostType,
} from "@/lib/workPosts";

export default function NewWorkPostPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [service, setService] = useState(PRO_SERVICES[0]);
  const [postType, setPostType] = useState<WorkPostType>("pro_work");
  const [audience, setAudience] = useState<WorkAudience>("both");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "pro") {
      router.replace("/dashboard");
    }
  }, [ready, user, router]);

  const lockMessage = marketplaceLockMessage(user);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      const post = await createWorkPost({
        poster: user,
        postType,
        audience,
        title,
        description,
        city: city || (user.role === "pro" ? user.city : ""),
        budget,
        service,
      });
      router.push(`/work/${post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create post.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready || !user || user.role !== "pro") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-on-surface-variant">
        Loading...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-10">
      <BackToDashboard secondaryHref="/work" secondaryLabel="Back to work board" />
      <h1 className="mt-2 accent-underline text-2xl font-bold uppercase tracking-wide">
        Post work available
      </h1>
      <p className="mt-3 text-sm text-on-surface-variant">
        Share capacity, subcontract needs, or pro-to-pro collaboration. Keep
        contact details out of the post — deals stay on Lapace.
      </p>

      {lockMessage ? (
        <p className="mt-6 border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
          {lockMessage}
        </p>
      ) : (
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="mt-8 space-y-4"
        >
          <FormField label="Post type">
            <select
              value={postType}
              onChange={(event) => {
                const value = event.target.value as WorkPostType;
                setPostType(value);
                if (value === "pro_to_pro") setAudience("pros");
              }}
              className="w-full border border-border-subtle bg-white px-3 py-2.5 text-sm"
            >
              <option value="pro_work">Work available / capacity</option>
              <option value="pro_to_pro">Pro-to-pro collaboration</option>
            </select>
          </FormField>
          <FormField label="Who can respond">
            <select
              value={audience}
              onChange={(event) =>
                setAudience(event.target.value as WorkAudience)
              }
              className="w-full border border-border-subtle bg-white px-3 py-2.5 text-sm"
            >
              <option value="both">Clients and verified pros</option>
              <option value="clients">Clients only</option>
              <option value="pros">Verified pros only</option>
            </select>
          </FormField>
          <FormField label="Title">
            <TextInput
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </FormField>
          <FormField label="Description">
            <TextArea
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </FormField>
          <FormField label="City / area">
            <TextInput
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder={user.city}
            />
          </FormField>
          <FormField label="Budget / rate">
            <TextInput
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              placeholder="Optional"
            />
          </FormField>
          <FormField label="Service">
            <select
              value={service}
              onChange={(event) =>
                setService(event.target.value as (typeof PRO_SERVICES)[number])
              }
              className="w-full border border-border-subtle bg-white px-3 py-2.5 text-sm"
            >
              {PRO_SERVICES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>
          {error ? <p className="text-sm text-status-urgent">{error}</p> : null}
          <PrimaryButton type="submit" disabled={busy}>
            {busy ? "Publishing..." : "Publish work post"}
          </PrimaryButton>
        </form>
      )}
    </main>
  );
}
