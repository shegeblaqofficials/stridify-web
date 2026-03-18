"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { StridifyLogo } from "@/components/ui/logo";
import { useAccount } from "@/provider/account-provider";
import { signOutUser } from "@/components/auth/action";
import {
  HiOutlineFolder,
  HiOutlineRocketLaunch,
  HiOutlineDocumentText,
  HiOutlineCog6Tooth,
  HiOutlineUser,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronUp,
  HiHome,
} from "react-icons/hi2";

const navItems = [
  { href: "/", label: "Home", icon: HiHome },
  { href: "/projects", label: "Projects", icon: HiOutlineFolder },
  { href: "/deployments", label: "Deployments", icon: HiOutlineRocketLaunch },
  { href: "/templates", label: "Templates", icon: HiOutlineDocumentText },
  { href: "/settings", label: "Settings", icon: HiOutlineCog6Tooth },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, account } = useAccount();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <aside className="flex w-60 flex-col border-r border-border bg-surface">
      {/* Nav */}
      <div className="p-6">
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
        ref={menuRef}
        className="relative mt-auto border-t border-border p-4"
      >
        {/* Dropdown (opens upward) */}
        {menuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
            {/* User info */}
            <div className="border-b border-border px-4 py-3">
              <p className="truncate text-sm font-semibold">{fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>

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
              <form
                action={async () => {
                  await signOutUser();
                  setMenuOpen(false);
                  window.location.href = "/";
                }}
              >
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
                >
                  <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Avatar button */}
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
    </aside>
  );
}
