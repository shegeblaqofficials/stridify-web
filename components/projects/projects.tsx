"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/layout";
import {
  HiOutlineCog6Tooth,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineArrowPath,
  HiOutlineBookmarkSquare,
  HiOutlineEllipsisHorizontal,
  HiOutlineGlobeAlt,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import { HiViewGrid, HiViewList } from "react-icons/hi";

type ProjectStatus = "deployed" | "building" | "draft";
type FilterTab = "all" | "recent" | "deployed" | "archived";

interface Project {
  id: string;
  name: string;
  stack: string;
  status: ProjectStatus;
  icon: string;
  timeAgo: string;
  metric: string;
  metricIcon: "chart" | "sync" | "save";
  actionLabel: string;
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Smart Home Assistant",
    stack: "Next.js • Python • AI Engine",
    status: "deployed",
    icon: "🤖",
    timeAgo: "2h ago",
    metric: "1.2k req/h",
    metricIcon: "chart",
    actionLabel: "Open",
  },
  {
    id: "2",
    name: "Customer Support Bot",
    stack: "React • Node.js • LangChain",
    status: "building",
    icon: "💬",
    timeAgo: "5h ago",
    metric: "84% complete",
    metricIcon: "sync",
    actionLabel: "Resume",
  },
  {
    id: "3",
    name: "Reservations AI",
    stack: "Svelte • Go • PostgreSQL",
    status: "draft",
    icon: "📋",
    timeAgo: "1d ago",
    metric: "Last saved",
    metricIcon: "save",
    actionLabel: "Edit",
  },
];

const statusConfig: Record<
  ProjectStatus,
  { label: string; dotColor: string; bgColor: string; textColor: string }
> = {
  deployed: {
    label: "Deployed",
    dotColor: "bg-emerald-500",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  building: {
    label: "Building",
    dotColor: "bg-blue-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  draft: {
    label: "Draft",
    dotColor: "bg-muted-foreground",
    bgColor: "bg-muted-foreground/10",
    textColor: "text-muted-foreground",
  },
};

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All Projects" },
  { id: "recent", label: "Recent" },
  { id: "deployed", label: "Deployed" },
  { id: "archived", label: "Archived" },
];

function MetricIcon({ type }: { type: Project["metricIcon"] }) {
  switch (type) {
    case "chart":
      return <HiOutlineChartBar className="h-3.5 w-3.5 text-primary" />;
    case "sync":
      return <HiOutlineArrowPath className="h-3.5 w-3.5" />;
    case "save":
      return <HiOutlineBookmarkSquare className="h-3.5 w-3.5" />;
  }
}

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Projects</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage and monitor your applications
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={[
                    "rounded-md p-1.5 transition-colors",
                    viewMode === "grid"
                      ? "bg-surface-elevated text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <HiViewGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={[
                    "rounded-md p-1.5 transition-colors",
                    viewMode === "list"
                      ? "bg-surface-elevated text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <HiViewList className="h-4 w-4" />
                </button>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                <HiOutlinePlus className="h-4 w-4" />
                New Project
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex gap-2 overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={[
                  "rounded-full border px-4 py-1.5 text-xs font-medium transition-all whitespace-nowrap",
                  activeFilter === tab.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid view */}
          {viewMode === "grid" && (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {mockProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}

              {/* Create new */}
              <Link
                href="/"
                className="group flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-border transition-all hover:border-primary/50 hover:bg-surface-elevated/30"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-elevated transition-colors group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary">
                  <HiOutlinePlus className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  New Project
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Start from scratch or a template
                </p>
              </Link>
            </div>
          )}

          {/* List view */}
          {viewMode === "list" && (
            <div className="mt-8 overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated/50">
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">
                      Project
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">
                      Metric
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">
                      Updated
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockProjects.map((project) => {
                    const status = statusConfig[project.status];
                    return (
                      <tr
                        key={project.id}
                        className="border-b border-border last:border-b-0 transition-colors hover:bg-surface-elevated/30"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-lg">
                              {project.icon}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {project.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {project.stack}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={[
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                              status.bgColor,
                              status.textColor,
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "h-1.5 w-1.5 rounded-full",
                                status.dotColor,
                                project.status === "deployed"
                                  ? "animate-pulse"
                                  : "",
                              ].join(" ")}
                            />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MetricIcon type={project.metricIcon} />
                            {project.metric}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">
                          {project.timeAgo}
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/projects/${project.id}`}
                            className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                          >
                            {project.actionLabel}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ------------------------------------------------------------------ */
/*  Project Card                                                       */
/* ------------------------------------------------------------------ */

function ProjectCard({ project }: { project: Project }) {
  const status = statusConfig[project.status];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      {/* Preview */}
      <div className="relative flex h-28 items-center justify-center bg-surface-elevated/40">
        <span className="text-4xl opacity-20 transition-transform duration-300 group-hover:scale-110">
          {project.icon}
        </span>

        {/* Status badge */}
        <div className="absolute left-4 top-4">
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
              status.bgColor,
              status.textColor,
            ].join(" ")}
          >
            <span
              className={[
                "h-1.5 w-1.5 rounded-full",
                status.dotColor,
                project.status === "deployed" ? "animate-pulse" : "",
              ].join(" ")}
            />
            {status.label}
          </span>
        </div>

        {/* Quick actions (visible on hover) */}
        <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            className="rounded-lg bg-surface/80 p-1.5 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
          >
            <HiOutlineCog6Tooth className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="rounded-lg bg-surface/80 p-1.5 text-muted-foreground backdrop-blur-sm transition-colors hover:text-danger"
          >
            <HiOutlineTrash className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">
          {project.name}
        </h3>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {project.stack}
        </p>

        {/* Meta row */}
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <HiOutlineClock className="h-3.5 w-3.5" />
              {project.timeAgo}
            </span>
            <span className="flex items-center gap-1">
              <MetricIcon type={project.metricIcon} />
              {project.metric}
            </span>
          </div>
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-surface-elevated px-3 py-1.5 text-[11px] font-semibold text-foreground transition-all hover:bg-primary hover:text-primary-foreground active:scale-[0.97]"
          >
            {project.actionLabel}
            <HiOutlineArrowTopRightOnSquare className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
