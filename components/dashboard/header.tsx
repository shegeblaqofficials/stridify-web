"use client";

import Link from "next/link";
import { useAccount } from "@/provider/account-provider";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { StridifyLogo } from "@/components/ui/logo";
import {
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
  HiOutlineBolt,
  HiOutlineCreditCard,
} from "react-icons/hi2";

export function DashboardHeader() {
  const { user } = useAccount();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface/80 px-6 backdrop-blur-md">
      {/* Logo + Search */}
      <div className="flex flex-1 items-center gap-5">
        <div className="flex w-48 shrink-0 items-center pl-0">
          <Link href="/" className="flex items-center gap-2">
            <StridifyLogo className="h-5 w-5 text-foreground" />
            <span className="text-base font-bold uppercase tracking-widest text-foreground">
              Stridify
            </span>
          </Link>
        </div>
        <div className="h-6 w-px bg-border" />
        <div className="relative max-w-md flex-1">
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
        {/* Credits */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated/50 px-3 py-1.5">
          <HiOutlineCreditCard className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">1,250</span>
          <span className="text-[10px] text-muted-foreground">credits</span>
        </div>

        {/* Upgrade */}
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 rounded-lg bg-linear-to-r from-primary to-primary/80 px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md hover:shadow-primary/20 active:scale-[0.98]"
        >
          <HiOutlineBolt className="h-3.5 w-3.5" />
          Upgrade
        </Link>
        <div className="mx-1 h-6 w-px bg-border" />

        {/* New Project */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-1.5 text-xs font-semibold text-background transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <HiOutlinePlus className="h-3.5 w-3.5" />
          New Project
        </Link>
        <div className="mx-1 h-6 w-px bg-border" />
        <ThemeSwitcher />
      </div>
    </header>
  );
}
