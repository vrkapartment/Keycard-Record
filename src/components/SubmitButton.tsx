"use client";

import { useFormStatus } from "react-dom";

const VARIANTS = {
  primary: "bg-primary text-primary-ink hover:bg-primary-hover",
  secondary: "border border-border-strong hover:bg-surface-sunken",
  destructive:
    "border border-border-strong text-inactive-text hover:bg-inactive-bg",
} as const;

const SIZES = {
  sm: "px-3 py-1.5",
  md: "px-4 py-2",
} as const;

export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  size = "md",
}: {
  children: React.ReactNode;
  pendingText: string;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`rounded-md text-sm font-medium ${SIZES[size]} ${VARIANTS[variant]}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}
