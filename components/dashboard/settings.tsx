"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAccount } from "@/provider/account-provider";
import { Button } from "@/components/ui/button";
import { getOrganizationMetrics } from "@/lib/metric/actions";
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineEllipsisVertical,
  HiOutlineUserPlus,
  HiOutlinePencil,
  HiOutlineBolt,
  HiOutlineChartBar,
  HiOutlineArrowDown,
  HiOutlineArrowUp,
} from "react-icons/hi2";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const tabs = ["Profile", "API Keys", "Team", "Billing", "Usage"] as const;
type Tab = (typeof tabs)[number];

const sectionIds: Record<Tab, string> = {
  Profile: "profile",
  "API Keys": "api-keys",
  Team: "team",
  Billing: "billing",
  Usage: "usage",
};

const apiKeys = [
  {
    name: "Production Main",
    key: "str_live_••••••••••••••••4f2a",
    created: "Oct 12, 2023",
  },
  {
    name: "Development",
    key: "str_test_••••••••••••••••9e11",
    created: "Jan 05, 2024",
  },
];

const teamMembers = [
  {
    name: "Alex Rivera",
    email: "alex.rivera@stridify.ai",
    role: "Owner",
    avatar: null,
  },
  {
    name: "Sarah Chen",
    email: "s.chen@stridify.ai",
    role: "Developer",
    avatar: null,
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Settings() {
  const { user, account, organization } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("Profile");
  const containerRef = useRef<HTMLDivElement>(null);

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
  const planLabel = account?.is_active ? "Pro" : "Free";

  const fetchUsage = useCallback(async () => {
    if (!account?.organization_id || usageLoaded) return;
    setUsageLoading(true);
    const data = await getOrganizationMetrics(account.organization_id);
    setUsageData(data);
    setUsageLoading(false);
    setUsageLoaded(true);
  }, [account?.organization_id, usageLoaded]);

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
        <div className="mx-auto flex max-w-4xl items-center gap-8 px-8">
          <h1 className="shrink-0 text-base font-semibold text-foreground">
            Settings
          </h1>
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => scrollToSection(tab)}
                className={[
                  "relative py-4 text-sm font-medium transition-colors",
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
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Content */}
        <div className="mx-auto max-w-4xl space-y-12 px-8 py-8">
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
                      className="w-full rounded-lg border border-border bg-surface-elevated/30 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-6">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Password
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last changed 3 months ago
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* ── API Keys ────────────────────────────────── */}
          <section id="api-keys">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">API Keys</h2>
              <Button size="sm">
                <HiOutlinePlus className="h-4 w-4" />
                Create New Key
              </Button>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated/50">
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Name
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Key
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Created
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((k) => (
                    <tr
                      key={k.name}
                      className="border-b border-border last:border-b-0 transition-colors hover:bg-surface-elevated/30"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {k.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {k.key}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {k.created}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          className="text-muted-foreground transition-colors hover:text-danger"
                        >
                          <HiOutlineTrash className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              {teamMembers.map((m) => (
                <div
                  key={m.email}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-elevated">
                      <span className="text-xs font-bold text-muted-foreground">
                        {m.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {m.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-surface-elevated px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {m.role}
                    </span>
                    {m.role !== "Owner" && (
                      <button
                        type="button"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <HiOutlineEllipsisVertical className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Billing ─────────────────────────────────── */}
          <section id="billing">
            <h2 className="mb-6 text-xl font-bold text-foreground">Billing</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Plan */}
              <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-6">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Current Plan
                    </span>
                    <span className="rounded bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">
                      {planLabel.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    $49
                    <span className="text-sm font-normal text-muted-foreground">
                      /mo
                    </span>
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Next billing date: Feb 12, 2024
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-8 text-left text-sm font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
                >
                  Manage Subscription
                </button>
              </div>

              {/* Payment */}
              <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-6">
                <div>
                  <span className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Payment Method
                  </span>
                  <div className="flex items-center gap-4 rounded-lg border border-border bg-surface-elevated/30 p-3">
                    <div className="flex h-6 w-10 items-center justify-center rounded bg-surface-elevated">
                      <span className="text-[8px] font-bold italic text-muted-foreground">
                        VISA
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Visa ending in 4242
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expires 12/26
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-8 text-left text-sm font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
                >
                  Update Method
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

          {/* ── Actions ─────────────────────────────────── */}
          <div className="flex justify-end gap-3 border-t border-border pt-8">
            <Button variant="outline" size="md">
              Discard Changes
            </Button>
            <Button variant="primary" size="md">
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
