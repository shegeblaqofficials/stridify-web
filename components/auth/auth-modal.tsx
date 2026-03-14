"use client";

import { useEffect, useRef } from "react";
import { signInWithGoogle } from "@/components/auth/action";
import { StridifyLogo } from "@/components/ui/logo";

export function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div
        data-aos="zoom-in"
        data-aos-duration="300"
        className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-2xl"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Logo & heading */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <StridifyLogo className="h-10 w-10 text-foreground" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome to Stridify
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to start building voice agents with just a prompt.
          </p>
        </div>

        {/* Google sign-in */}
        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-5 py-3.5 text-sm font-semibold transition-all hover:border-muted-foreground/50 hover:bg-surface-elevated active:scale-[0.98]"
          >
            <GoogleIcon className="h-5 w-5" />
            Continue with Google
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Email placeholder (disabled for now) */}
        <div className="space-y-3">
          <input
            type="email"
            placeholder="name@company.com"
            disabled
            className="w-full rounded-xl border border-border bg-surface-elevated/50 px-4 py-3 text-sm text-muted-foreground/50 outline-none placeholder:text-muted-foreground/30"
          />
          <button
            type="button"
            disabled
            className="w-full rounded-xl bg-foreground/10 px-5 py-3 text-sm font-semibold text-muted-foreground/40"
          >
            Continue with Email — Coming Soon
          </button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground/60">
          By continuing, you agree to Stridify&apos;s{" "}
          <span className="underline">Terms of Service</span> and{" "}
          <span className="underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
