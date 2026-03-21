"use client";

import Link from "next/link";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { StridifyLogo } from "@/components/ui/logo";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineBolt,
  HiOutlineBars3,
} from "react-icons/hi2";

export function DashboardHeader({
  onMenuToggle,
}: {
  onMenuToggle: () => void;
}) {
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
        {/* Upgrade — hidden on mobile */}
        <Link
          href="/pricing"
          className="hidden items-center gap-1.5 rounded-lg bg-linear-to-r from-primary to-primary/80 px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md hover:shadow-primary/20 active:scale-[0.98] md:inline-flex"
        >
          <HiOutlineBolt className="h-3.5 w-3.5" />
          Upgrade
        </Link>
        <div className="mx-1 hidden h-6 w-px bg-border md:block" />
        <ThemeSwitcher />
      </div>
    </header>
  );
}
