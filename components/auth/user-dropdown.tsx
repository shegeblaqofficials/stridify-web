"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  HiOutlineUser,
  HiOutlineFolder,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBolt,
} from "react-icons/hi2";
import { useRouter } from "next/navigation";
import { useAccount } from "@/provider/account-provider";

export function UserDropdown({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { organization } = useAccount();

  const name =
    user.user_metadata?.full_name || user.user_metadata?.name || "User";
  const email = user.email || "";
  const avatar = user.user_metadata?.avatar_url || "";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-border transition-all hover:border-primary/50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={36}
            height={36}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-bold text-primary">
            {initials}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-background shadow-xl">
          {/* User info */}
          <div className="border-b border-border px-4 py-3.5">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>

          {/* Token balance */}
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

          {/* Menu items */}
          <div className="p-1.5">
            <Link
              href="/home"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
            >
              <HiOutlineUser className="h-4 w-4" />
              Account
            </Link>
            <Link
              href="/projects"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
            >
              <HiOutlineFolder className="h-4 w-4" />
              Projects
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-border p-1.5">
            <button
              type="button"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
            >
              <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
