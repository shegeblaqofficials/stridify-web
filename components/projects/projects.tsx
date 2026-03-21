"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useAccount } from "@/provider/account-provider";
import { getProjects, deleteProject } from "@/lib/project/actions";
import type { Project, ProjectStatus } from "@/model/project/project";
import {
  HiOutlineCog6Tooth,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineClock,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineGlobeAlt,
  HiOutlinePhone,
  HiOutlineCodeBracketSquare,
  HiOutlineDevicePhoneMobile,
  HiOutlineSparkles,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
} from "react-icons/hi2";
import { HiViewGrid, HiViewList } from "react-icons/hi";

type FilterTab = "all" | "draft" | "building" | "deployed";

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
  ready: {
    label: "Ready",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600 dark:text-amber-400",
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

const agentIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  web: HiOutlineGlobeAlt,
  telephony: HiOutlinePhone,
  widget: HiOutlineCodeBracketSquare,
  mobile: HiOutlineDevicePhoneMobile,
};

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All Projects" },
  { id: "draft", label: "Drafts" },
  { id: "building", label: "Building" },
  { id: "deployed", label: "Deployed" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function actionLabel(status: ProjectStatus): string {
  switch (status) {
    case "deployed":
      return "Open";
    case "building":
      return "Resume";
    default:
      return "Edit";
  }
}

export default function Projects() {
  const { organization } = useAccount();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!organization) return;
    setLoading(true);
    getProjects(organization.organization_id).then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, [organization]);

  const filtered =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => p.status === activeFilter);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const success = await deleteProject(deleteTarget.project_id);
    if (success) {
      setProjects((prev) =>
        prev.filter((p) => p.project_id !== deleteTarget.project_id),
      );
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Projects</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                All your agents in one place. Create, manage, and deploy with
                ease.
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
                href="/home"
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

          {/* Loading */}
          {loading && (
            <div className="mt-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
              <p className="text-sm">Loading projects…</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <HiOutlineSparkles className="size-7 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {activeFilter === "all"
                    ? "No projects yet"
                    : `No ${activeFilter} projects`}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create your first voice agent to get started.
                </p>
              </div>
              <Link
                href="/home"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
              >
                <HiOutlinePlus className="h-4 w-4" />
                New Project
              </Link>
            </div>
          )}

          {/* Grid view */}
          {!loading && filtered.length > 0 && viewMode === "grid" && (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((project) => (
                <ProjectCard
                  key={project.project_id}
                  project={project}
                  onDelete={setDeleteTarget}
                />
              ))}

              {/* Create new */}
              <Link
                href="/home"
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
          {!loading && filtered.length > 0 && viewMode === "list" && (
            <div className="mt-8 overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated/50">
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">
                      Project
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">
                      Type
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">
                      Status
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
                  {filtered.map((project) => {
                    const status = statusConfig[project.status];
                    const Icon =
                      agentIcons[project.agent_type] ?? HiOutlineGlobeAlt;
                    return (
                      <tr
                        key={project.project_id}
                        className="border-b border-border last:border-b-0 transition-colors hover:bg-surface-elevated/30"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/projects/${project.project_id}`}
                            className="flex items-center gap-3 group/title"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-elevated">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p
                              className="text-sm font-semibold text-foreground truncate max-w-[200px] group-hover/title:text-primary transition-colors"
                              title={project.title}
                            >
                              {project.title}
                            </p>
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-xs capitalize text-muted-foreground">
                          {project.agent_type}
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
                        <td className="px-5 py-4 text-xs text-muted-foreground">
                          {timeAgo(project.updated_at)}
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/projects/${project.project_id}`}
                            className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                          >
                            {actionLabel(project.status)}
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

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        project={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}

/* ------------------------------------------------------------------ */
/*  Project Card                                                       */
/* ------------------------------------------------------------------ */

function ProjectCard({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: (project: Project) => void;
}) {
  const status = statusConfig[project.status];
  const Icon = agentIcons[project.agent_type] ?? HiOutlineGlobeAlt;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      {/* Preview */}
      <div className="relative flex h-28 items-center justify-center bg-surface-elevated/40">
        <Icon className="h-10 w-10 text-muted-foreground/20 transition-transform duration-300 group-hover:scale-110" />

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

        {/* Quick actions — always visible on mobile, hover on desktop */}
        <div className="absolute right-3 top-3 flex items-center gap-1 md:opacity-0 md:transition-opacity md:duration-200 md:group-hover:opacity-100">
          <button
            type="button"
            className="rounded-lg bg-surface/80 p-1.5 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
          >
            <HiOutlineCog6Tooth className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(project)}
            className="rounded-lg bg-surface/80 p-1.5 text-muted-foreground backdrop-blur-sm transition-colors hover:text-danger"
          >
            <HiOutlineTrash className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <Link href={`/projects/${project.project_id}`} className="block p-5">
        <h3
          className="text-sm font-bold text-foreground transition-colors group-hover:text-primary truncate"
          title={project.title}
        >
          {project.title}
        </h3>
        <p className="mt-1 text-[11px] capitalize text-muted-foreground">
          {project.agent_type} agent
        </p>

        {/* Meta row */}
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <HiOutlineClock className="h-3.5 w-3.5" />
            {timeAgo(project.updated_at)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-surface-elevated px-3 py-1.5 text-[11px] font-semibold text-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground">
            {actionLabel(project.status)}
            <HiOutlineArrowTopRightOnSquare className="h-3 w-3" />
          </span>
        </div>
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Delete Confirmation Modal                                          */
/* ------------------------------------------------------------------ */

function DeleteConfirmModal({
  project,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  project: Project | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!project) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [project, isDeleting, onCancel]);

  if (!project) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === overlayRef.current && !isDeleting) onCancel();
      }}
    >
      <div className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-2xl border border-border bg-surface shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-2 duration-200">
        <div className="p-6">
          {/* Icon */}
          <div className="mx-auto mb-4 size-12 rounded-xl bg-red-500/10 flex items-center justify-center">
            <HiOutlineExclamationTriangle className="size-6 text-red-500" />
          </div>

          {/* Copy */}
          <h3 className="text-center text-base font-bold text-foreground">
            Delete project?
          </h3>
          <p className="mt-1.5 text-center text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">{project.title}</span>{" "}
            will be permanently deleted. This action cannot be undone.
          </p>

          {/* Actions */}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-60"
            >
              {isDeleting ? (
                <>
                  <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Deleting…
                </>
              ) : (
                <>
                  <HiOutlineTrash className="size-4" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
