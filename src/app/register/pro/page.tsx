"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthShell,
  FormField,
  PasswordInput,
  PrimaryButton,
  TextArea,
  TextInput,
} from "@/components/AuthForm";
import { useAuth } from "@/components/AuthProvider";
import { PRO_SERVICES, type ProService } from "@/lib/auth";

export default function RegisterProPage() {
  const router = useRouter();
  const { registerPro } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [city, setCity] = useState("");
  const [services, setServices] = useState<ProService[]>([]);
  const [about, setAbout] = useState("");
  const [licenseNote, setLicenseNote] = useState("");

  function toggleService(service: ProService) {
    setServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service],
    );
  }

  function goNext() {
    setError("");
    if (step === 1) {
      if (!fullName || !email || !phone || password.length < 6) {
        setError("Fill all account fields.");
        return;
      }
      setStep(2);
      return;
    }
    if (!companyName || !city || services.length === 0) {
      setError("Add company details and at least one service.");
      return;
    }
    setStep(3);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!about.trim()) {
      setError("Add a short about section.");
      return;
    }
    const result = registerPro({
      fullName,
      email,
      phone,
      password,
      companyName,
      city,
      services,
      about,
      licenseNote,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/pro/dashboard");
  }

  return (
    <AuthShell
      title="Pro Registration"
      subtitle="Join as a contractor. Status stays pending until Lapace verifies you."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 ? (
          <>
            <FormField label="Full name">
              <TextInput required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </FormField>
            <FormField label="Email">
              <TextInput required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormField>
            <FormField label="Phone">
              <TextInput required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </FormField>
            <FormField label="Password">
              <PasswordInput
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </FormField>
          </>
        ) : null}
        {step === 2 ? (
          <>
            <FormField label="Company name">
              <TextInput required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </FormField>
            <FormField label="City">
              <TextInput required value={city} onChange={(e) => setCity(e.target.value)} />
            </FormField>
            <div className="flex flex-wrap gap-2">
              {PRO_SERVICES.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={
                    services.includes(service)
                      ? "bg-primary px-3 py-1.5 text-xs font-bold uppercase text-white"
                      : "border border-border-subtle px-3 py-1.5 text-xs font-bold uppercase text-on-surface-variant"
                  }
                >
                  {service}
                </button>
              ))}
            </div>
          </>
        ) : null}
        {step === 3 ? (
          <>
            <FormField label="About">
              <TextArea required rows={4} value={about} onChange={(e) => setAbout(e.target.value)} />
            </FormField>
            <FormField label="License notes (optional)">
              <TextInput value={licenseNote} onChange={(e) => setLicenseNote(e.target.value)} />
            </FormField>
          </>
        ) : null}
        {error ? <p className="text-sm text-status-urgent">{error}</p> : null}
        <div className="flex gap-3">
          {step > 1 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="flex-1 border px-4 py-3 text-xs font-bold uppercase">
              Back
            </button>
          ) : null}
          {step < 3 ? (
            <PrimaryButton type="button" onClick={goNext} className="flex-1">
              Continue
            </PrimaryButton>
          ) : (
            <PrimaryButton type="submit" className="flex-1">
              Submit Application
            </PrimaryButton>
          )}
        </div>
      </form>
      <p className="text-sm text-on-surface-variant">
        Need to hire?{" "}
        <Link href="/register/client" className="font-semibold text-primary underline">
          Register as Client
        </Link>
      </p>
    </AuthShell>
  );
}
