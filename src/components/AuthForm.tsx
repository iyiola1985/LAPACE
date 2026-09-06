"use client";

import {
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { Icon } from "./Icon";

export function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-on-background">
        {label}
      </span>
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border border-border-subtle bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${props.className ?? ""}`}
    />
  );
}

export function PasswordInput({
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        autoComplete={props.autoComplete ?? "current-password"}
        className={`w-full border border-border-subtle bg-white py-2.5 pl-3 pr-11 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${className ?? ""}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-on-surface-variant transition-colors hover:text-on-background"
      >
        <Icon
          name={visible ? "visibility_off" : "visibility"}
          className="text-[22px]"
        />
      </button>
    </div>
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full border border-border-subtle bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${props.className ?? ""}`}
    />
  );
}

export function PrimaryButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-xl px-4 py-8 md:px-8 md:py-12">
      <h1 className="accent-underline text-2xl font-bold uppercase tracking-wide md:text-3xl">
        {title}
      </h1>
      <p className="mt-4 text-sm text-on-surface-variant md:text-base">
        {subtitle}
      </p>
      <div className="mt-8 space-y-4 border border-border-subtle bg-white p-5 md:p-6">
        {children}
      </div>
    </main>
  );
}
