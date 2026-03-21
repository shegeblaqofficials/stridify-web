"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  HiOutlineXMark,
  HiOutlineBolt,
  HiOutlineSparkles,
} from "react-icons/hi2";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
        >
          <HiOutlineXMark className="size-5" />
        </button>

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="mx-auto mb-5 size-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <HiOutlineBolt className="size-8 text-amber-500" />
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-foreground">
            You&apos;ve run out of credits
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Your token balance has reached zero. Upgrade your plan to continue
            building and deploying agents.
          </p>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              <HiOutlineSparkles className="size-4" />
              Upgrade Plan
            </Link>
            <button
              onClick={onClose}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
