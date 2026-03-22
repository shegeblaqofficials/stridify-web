"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { StridifyLogo } from "@/components/ui/logo";
import { useAccount } from "@/provider/account-provider";
import { createClient } from "@/lib/supabase/client";
import {
  HiOutlineFolder,
  HiOutlineRocketLaunch,
  HiOutlineDocumentText,
  HiOutlineCog6Tooth,
  HiOutlineUser,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronUp,
  HiOutlineBolt,
  HiOutlineXMark,
  HiHome,
} from "react-icons/hi2";

const navItems = [
  { href: "/home", label: "Home", icon: HiHome },
  { href: "/projects", label: "Projects", icon: HiOutlineFolder },
  { href: "/deployments", label: "Deployments", icon: HiOutlineRocketLaunch },
  { href: "/templates", label: "Templates", icon: HiOutlineDocumentText },
  { href: "/settings", label: "Settings", icon: HiOutlineCog6Tooth },
] as const;

export function Sidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, account, organization } = useAccount();
  const [menuOpen, setMenuOpen] = useState(false);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const fullName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || "User";
  const email = user?.email || "";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const planLabel = account?.is_active ? "Pro Plan" : "Free Plan";

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-user-menu]")) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onMobileClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const sidebarContent = (
    <>
      {/* Mobile close header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4 md:hidden">
        <div className="flex items-center gap-2">
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
        </div>
        <button
          type="button"
          onClick={onMobileClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-surface-elevated"
          aria-label="Close menu"
        >
          <HiOutlineXMark className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto p-6">
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-surface-elevated text-foreground"
                    : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User */}
      <div
        data-user-menu
        className="relative mt-auto border-t border-border p-4"
      >
        {menuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
            <div className="border-b border-border px-4 py-3">
              <p className="truncate text-sm font-semibold">{fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>

            {organization && (
              <div className="border-b border-border px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <HiOutlineBolt className="size-3.5 text-amber-500" />
                    <span>Credits</span>
                  </div>
                  <span className="text-xs font-bold tabular-nums">
                    {organization.token_balance.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="p-1.5">
              <Link
                href="/settings#profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
              >
                <HiOutlineUser className="h-4 w-4" />
                Account
              </Link>
              <Link
                href="/projects"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
              >
                <HiOutlineFolder className="h-4 w-4" />
                Projects
              </Link>
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
              >
                <HiOutlineCog6Tooth className="h-4 w-4" />
                Settings
              </Link>
            </div>

            <div className="border-t border-border p-1.5">
              <button
                type="button"
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  router.push("/");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
              >
                <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-elevated"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-xs font-bold text-muted-foreground">
                {initials}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-xs font-semibold">{fullName}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {planLabel}
            </p>
          </div>
          <HiOutlineChevronUp
            className={[
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              menuOpen ? "" : "rotate-180",
            ].join(" ")}
          />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="hidden w-60 flex-col border-r border-border bg-surface md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onMobileClose}
      />

      {/* Mobile slide-in sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-surface shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
