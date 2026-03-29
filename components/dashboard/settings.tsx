"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/provider/account-provider";
import { Button } from "@/components/ui/button";
import { getRedisOrganizationMetrics } from "@/lib/redis/actions";
import { getOrganizationMembers, type OrgMember } from "@/lib/account/actions";
import {
  HiOutlineUserPlus,
  HiOutlinePencil,
  HiOutlineChartBar,
  HiOutlineArrowDown,
  HiOutlineArrowUp,
  HiOutlineCreditCard,
  HiOutlinePlusCircle,
} from "react-icons/hi2";
import { TOPUP_CREDITS, TOPUP_PRICE_DOLLARS } from "@/lib/stripe/config";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const tabs = ["Profile", "Team", "Billing", "Usage"] as const;
type Tab = (typeof tabs)[number];

const sectionIds: Record<Tab, string> = {
  Profile: "profile",
  Team: "team",
  Billing: "billing",
  Usage: "usage",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Settings() {
  const { user, account, organization } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Profile");
  const containerRef = useRef<HTMLDivElement>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [topupLoading, setTopupLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  type ProjectUsage = {
    project_id: string;
    project_title: string;
    sessions: number;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    last_active: string;
  };
  const [usageData, setUsageData] = useState<ProjectUsage[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageLoaded, setUsageLoaded] = useState(false);

  const [members, setMembers] = useState<OrgMember[]>([]);
  const [membersLoaded, setMembersLoaded] = useState(false);

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

  const planName = organization?.plan ?? "Free";
  const isFree = organization?.is_free_plan ?? true;

  const fetchUsage = useCallback(async () => {
    if (!account?.organization_id || usageLoaded) return;
    setUsageLoading(true);
    const data = await getRedisOrganizationMetrics(account.organization_id);
    setUsageData(data);
    setUsageLoading(false);
    setUsageLoaded(true);
  }, [account?.organization_id, usageLoaded]);

  const fetchMembers = useCallback(async () => {
    if (!account?.organization_id || membersLoaded) return;
    const data = await getOrganizationMembers(account.organization_id);
    setMembers(data);
    setMembersLoaded(true);
  }, [account?.organization_id, membersLoaded]);

  // Fetch members on mount
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Fetch usage when tab becomes active
  useEffect(() => {
    if (activeTab === "Usage") fetchUsage();
  }, [activeTab, fetchUsage]);

  function scrollToSection(tab: Tab) {
    setActiveTab(tab);
    const el = document.getElementById(sectionIds[tab]);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /* Update active tab on scroll */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const offsets = tabs.map((tab) => {
        const el = document.getElementById(sectionIds[tab]);
        if (!el) return { tab, top: Infinity };
        return { tab, top: Math.abs(el.getBoundingClientRect().top - 140) };
      });
      const closest = offsets.reduce((a, b) => (a.top < b.top ? a : b));
      setActiveTab(closest.tab);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      {/* Sticky tab header */}
      <div className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 md:gap-8 md:px-8">
          <h1 className="shrink-0 text-base font-semibold text-foreground">
            Settings
          </h1>
          <nav className="flex gap-4 overflow-x-auto md:gap-6 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => scrollToSection(tab)}
                className={[
                  "relative shrink-0 whitespace-nowrap py-4 text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-foreground" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto max-w-4xl space-y-12 px-2 py-4 md:px-8 md:py-8">
          {/* ── Profile ─────────────────────────────────── */}
          <section id="profile">
            <h2 className="mb-6 text-xl font-bold text-foreground">Profile</h2>
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              {/* Avatar row */}
              <div className="flex items-center gap-5 border-b border-border p-6">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-border">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">
                        {initials}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 rounded-full border border-border bg-surface p-1.5 shadow-sm transition-colors hover:bg-surface-elevated"
                  >
                    <HiOutlinePencil className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {fullName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue={fullName}
                      className="w-full rounded-lg border border-border bg-surface-elevated/30 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={email}
                      disabled
                      className="w-full rounded-lg border border-border bg-surface-elevated/30 px-3 py-2.5 text-sm text-muted-foreground outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Team ────────────────────────────────────── */}
          <section id="team">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Team</h2>
              <Button variant="outline" size="sm">
                <HiOutlineUserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-surface divide-y divide-border">
              {members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-sm text-muted-foreground">
                    No team members yet.
                  </p>
                </div>
              ) : (
                members.map((m) => {
                  const memberName =
                    [m.first_name, m.last_name].filter(Boolean).join(" ") ||
                    m.email;
                  const memberInitials = memberName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <div
                      key={m.user_id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-elevated">
                          {m.photo_url ? (
                            <img
                              src={m.photo_url}
                              alt=""
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground">
                              {memberInitials}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {memberName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {m.email}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-surface-elevated px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {m.role}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* ── Billing ─────────────────────────────────── */}
          <section id="billing">
            <h2 className="mb-6 flex items-center gap-3 text-xl font-bold text-foreground">
              Billing
              <span className="rounded-full bg-surface-elevated px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {planName}
              </span>
              {organization?.subscription_status &&
                organization.subscription_status !== "inactive" && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      organization.subscription_status === "active"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {organization.subscription_status}
                  </span>
                )}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Plan */}
              <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-6">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Current Plan
                    </span>
                    <span className="rounded bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">
                      {planName.toUpperCase()}
                    </span>
                  </div>
                  {isFree ? (
                    <>
                      <h3 className="text-2xl font-bold text-foreground">
                        Free
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {organization?.token_balance?.toLocaleString() ?? 0}{" "}
                        credits remaining
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold text-foreground">
                        {planName}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {organization?.token_balance?.toLocaleString() ?? 0}{" "}
                        credits remaining
                      </p>
                    </>
                  )}
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {isFree ? (
                    <button
                      type="button"
                      onClick={() => router.push("/pricing")}
                      className="text-sm font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
                    >
                      Upgrade Plan
                    </button>
                  ) : (
                    <>
                      {planName !== "Team" && (
                        <button
                          type="button"
                          disabled={upgradeLoading}
                          onClick={async () => {
                            setUpgradeLoading(true);
                            try {
                              const res = await fetch("/api/stripe/checkout", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  type: "upgrade",
                                  plan: "Team",
                                }),
                              });
                              const data = await res.json();
                              if (data.url) {
                                window.location.href = data.url;
                              } else if (data.upgraded) {
                                window.location.reload();
                              }
                            } catch (err) {
                              console.error("Upgrade error:", err);
                            } finally {
                              setUpgradeLoading(false);
                            }
                          }}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
                        >
                          {upgradeLoading
                            ? "Upgrading…"
                            : "Upgrade to Team — $79/mo"}
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={portalLoading}
                        onClick={async () => {
                          setPortalLoading(true);
                          try {
                            const res = await fetch("/api/stripe/portal", {
                              method: "POST",
                            });
                            const data = await res.json();
                            if (data.url) window.location.href = data.url;
                          } catch (err) {
                            console.error("Portal error:", err);
                          } finally {
                            setPortalLoading(false);
                          }
                        }}
                        className="text-sm font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground disabled:opacity-50"
                      >
                        {portalLoading ? "Redirecting…" : "Manage Subscription"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Buy Credits / Payment */}
              <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-6">
                <div>
                  <span className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Credits Top-Up
                  </span>
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated">
                      <HiOutlinePlusCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {TOPUP_CREDITS.toLocaleString()} credits
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      One-time purchase — ${TOPUP_PRICE_DOLLARS}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={topupLoading}
                  onClick={async () => {
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
                  }}
                  className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-surface-elevated px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated/80 disabled:opacity-50"
                >
                  <HiOutlineCreditCard className="h-4 w-4" />
                  {topupLoading ? "Redirecting…" : "Buy 50,000 Credits"}
                </button>
              </div>
            </div>
          </section>

          {/* ── Usage ──────────────────────────────────── */}
          <section id="usage">
            <h2 className="mb-6 text-xl font-bold text-foreground">Usage</h2>

            {/* Summary cards */}
            {organization && (
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-surface p-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Credit Balance
                  </span>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
                    {organization.token_balance.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Total Tokens Used
                  </span>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
                    {usageData
                      .reduce((sum, p) => sum + p.total_tokens, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Agent Sessions
                  </span>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
                    {usageData
                      .reduce((sum, p) => sum + p.sessions, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Per-project breakdown */}
            <div className="overflow-hidden rounded-xl border border-border">
              {usageLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Loading usage data…
                    </p>
                  </div>
                </div>
              ) : usageData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated">
                    <HiOutlineChartBar className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    No usage yet
                  </p>
                  <p className="mt-1 max-w-xs text-center text-xs text-muted-foreground">
                    Token usage will appear here once you start building with
                    the AI coding agent.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-elevated/50">
                      <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Sessions
                      </th>
                      <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <HiOutlineArrowDown className="h-3 w-3" />
                          Input
                        </span>
                      </th>
                      <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <HiOutlineArrowUp className="h-3 w-3" />
                          Output
                        </span>
                      </th>
                      <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Last Active
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageData.map((row) => (
                      <tr
                        key={row.project_id}
                        className="border-b border-border last:border-b-0 transition-colors hover:bg-surface-elevated/30"
                      >
                        <td className="px-6 py-4 text-right tabular-nums text-sm text-muted-foreground">
                          {row.sessions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right tabular-nums text-sm text-muted-foreground">
                          {row.input_tokens.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right tabular-nums text-sm text-muted-foreground">
                          {row.output_tokens.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right tabular-nums text-sm font-semibold text-foreground">
                          {row.total_tokens.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                          {new Date(row.last_active).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
