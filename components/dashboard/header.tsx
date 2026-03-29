"use client";

import { useState } from "react";
import Link from "next/link";
import { StridifyLogo } from "@/components/ui/logo";
import { useAccount } from "@/provider/account-provider";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineBolt,
  HiOutlineBars3,
  HiOutlinePlusCircle,
} from "react-icons/hi2";

export function DashboardHeader({
  onMenuToggle,
}: {
  onMenuToggle: () => void;
}) {
  const { organization } = useAccount();
  const isFree = organization?.is_free_plan ?? true;
  const [topupLoading, setTopupLoading] = useState(false);

  async function handleTopup() {
    setTopupLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "topup" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error("Topup error:", err);
    } finally {
      setTopupLoading(false);
    }
  }
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-md md:px-6">
      {/* Left: menu + logo */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-surface-elevated md:hidden"
          aria-label="Toggle menu"
        >
          <HiOutlineBars3 className="h-5 w-5" />
        </button>

        <Link href="/home" className="flex items-center gap-2">
          <StridifyLogo className="h-5 w-5 text-foreground" />
          <span className="text-base font-bold uppercase tracking-widest text-foreground">
            Stridify
          </span>
          <span
            className="rounded-md border border-foreground/30 px-2 py-[3px] text-[9px] font-bold uppercase leading-none tracking-wide dark:border-primary/50"
            style={{ color: "var(--foreground)" }}
          >
            Beta
          </span>
        </Link>
      </div>

      {/* Center: search */}
      <div className="hidden max-w-md flex-1 mx-8 md:block">
        <div className="relative">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects, templates..."
            className="w-full rounded-lg border border-border bg-surface-elevated/50 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Buy Credits — for paid users */}
        {!isFree && (
          <button
            onClick={handleTopup}
            disabled={topupLoading}
            className="hidden items-center gap-1.5 rounded-lg border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-all hover:bg-surface-elevated active:scale-[0.98] disabled:opacity-50 md:inline-flex"
          >
            <HiOutlinePlusCircle className="h-3.5 w-3.5" />
            {topupLoading ? "Redirecting…" : "Buy 50,000 Credits"}
          </button>
        )}
        {/* Upgrade — only on free plan, hidden on mobile */}
        {isFree && (
          <Link
            href="/pricing"
            className="hidden items-center gap-1.5 rounded-lg bg-linear-to-r from-primary to-primary/80 px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md hover:shadow-primary/20 active:scale-[0.98] md:inline-flex"
          >
            <HiOutlineBolt className="h-3.5 w-3.5" />
            Upgrade
          </Link>
        )}
      </div>
    </header>
  );
}
