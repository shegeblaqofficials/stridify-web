"use client";

import { Button } from "@/components/ui/button";
import {
  HiOutlineGlobeAlt,
  HiOutlineRocketLaunch,
  HiOutlineClock,
} from "react-icons/hi2";

/* ------------------------------------------------------------------ */
/*  Empty-state component                                              */
/* ------------------------------------------------------------------ */

export function Deployment() {
  // In the future these will come from props/server data
  const deployments: never[] = [];
  const hasDeployed = deployments.length > 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              Deployments
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Publish your agent to the web
            </p>
          </div>
        </div>

        {/* ── Web Deployment Card ───────────────────────── */}
        <div className="mt-8 rounded-xl border border-border bg-surface">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-4 sm:px-6">
            <HiOutlineGlobeAlt className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Web Application
            </h2>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated">
              <HiOutlineRocketLaunch className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="mt-5 text-sm font-semibold text-foreground">
              No deployments yet
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Once your agent is ready, deploy it here to get a public URL
              anyone can access.
            </p>
            <Button variant="primary" size="sm" className="mt-6">
              <HiOutlineRocketLaunch className="h-4 w-4" />
              Deploy to Web
            </Button>
          </div>
        </div>

        {/* ── Deployment History ────────────────────────── */}
        <div className="mt-8">
          <h2 className="text-base font-semibold text-foreground">History</h2>

          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
            {/* Empty state */}
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated">
                <HiOutlineClock className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">
                No deployment history
              </p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Previous deployments and their statuses will show up here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
