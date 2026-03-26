"use client";

import { useState, useEffect } from "react";
import { useAccount } from "@/provider/account-provider";
import { getOrganizationDeployments } from "@/lib/deployment/actions";
import { getProjects } from "@/lib/project/actions";
import { DeployModal } from "@/components/workspace/deploy-modal";
import type { Project } from "@/model/project/project";
import type {
  Deployment as DeploymentType,
  DeploymentStatus,
  DeploymentEnvironment,
} from "@/model/deployment/deployment";
import {
  HiOutlineRocketLaunch,
  HiOutlineClock,
  HiOutlineGlobeAlt,
  HiOutlineEye,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineArrowPath,
  HiOutlineFolderOpen,
} from "react-icons/hi2";

const statusConfig: Record<
  DeploymentStatus,
  { label: string; dotColor: string; bgColor: string; textColor: string }
> = {
  ready: {
    label: "Ready",
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
  queued: {
    label: "Queued",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  error: {
    label: "Error",
    dotColor: "bg-red-500",
    bgColor: "bg-red-500/10",
    textColor: "text-red-600 dark:text-red-400",
  },
  canceled: {
    label: "Canceled",
    dotColor: "bg-muted-foreground",
    bgColor: "bg-muted-foreground/10",
    textColor: "text-muted-foreground",
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: DeploymentStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.textColor}`}
    >
      <span className={`size-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}

function EnvironmentBadge({
  environment,
}: {
  environment: DeploymentEnvironment;
}) {
  const isProduction = environment === "production";
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      {isProduction ? (
        <HiOutlineGlobeAlt className="size-3.5" />
      ) : (
        <HiOutlineEye className="size-3.5" />
      )}
      {isProduction ? "Production" : "Preview"}
    </span>
  );
}

export function Deployment() {
  const { organization, user, loading: accountLoading } = useAccount();
  const [deployments, setDeployments] = useState<DeploymentType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);

  useEffect(() => {
    if (accountLoading || !organization?.organization_id) return;
    Promise.all([
      getOrganizationDeployments(organization.organization_id),
      getProjects(organization.organization_id),
    ]).then(([deps, projs]) => {
      setDeployments(deps);
      setProjects(projs);
      setLoading(false);
    });
  }, [organization?.organization_id, accountLoading]);

  const refresh = async () => {
    if (!organization?.organization_id) return;
    setLoading(true);
    const [deps, projs] = await Promise.all([
      getOrganizationDeployments(organization.organization_id),
      getProjects(organization.organization_id),
    ]);
    setDeployments(deps);
    setProjects(projs);
    setLoading(false);
  };

  const handleDeployProject = (project: Project) => {
    setSelectedProject(project);
    setShowDeployModal(true);
  };

  const handleDeployModalClose = () => {
    setShowDeployModal(false);
    setSelectedProject(null);
    // Refresh deployments after modal closes
    refresh();
  };

  const isEmpty = !loading && deployments.length === 0;

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
              All deployments across your projects
            </p>
          </div>
          {!isEmpty && (
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-elevated transition-colors disabled:opacity-50"
            >
              <HiOutlineArrowPath
                className={`size-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="h-4 w-32 rounded bg-surface-elevated" />
                  <div className="h-4 w-20 rounded bg-surface-elevated" />
                  <div className="ml-auto h-4 w-24 rounded bg-surface-elevated" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="mt-8 rounded-xl border border-border bg-surface">
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated">
                <HiOutlineRocketLaunch className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="mt-5 text-sm font-semibold text-foreground">
                No deployments yet
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Select a project below to deploy it to Vercel.
              </p>
            </div>

            {/* Project picker */}
            {projects.length > 0 && (
              <div className="border-t border-border">
                <div className="px-5 py-3 sm:px-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Your Projects
                  </h4>
                </div>
                <div className="divide-y divide-border">
                  {projects.map((project) => (
                    <div
                      key={project.project_id}
                      className="flex items-center gap-4 px-5 py-3.5 sm:px-6 hover:bg-surface-elevated/50 transition-colors"
                    >
                      <div className="flex size-9 items-center justify-center rounded-lg bg-surface-elevated shrink-0">
                        <HiOutlineFolderOpen className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {project.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(project.updated_at)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeployProject(project)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity shrink-0"
                      >
                        <HiOutlineRocketLaunch className="size-3.5" />
                        Deploy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projects.length === 0 && (
              <div className="border-t border-border px-6 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No projects found. Create a project in the workspace first.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Deployment list */}
        {!loading && deployments.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-xl border border-border bg-surface divide-y divide-border">
            {deployments.map((dep) => (
              <div
                key={dep.deployment_id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-surface-elevated/50 transition-colors"
              >
                {/* Name + env */}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {dep.deployment_name || dep.deployment_id.slice(0, 8)}
                    </span>
                    <EnvironmentBadge environment={dep.environment} />
                  </div>
                  {dep.url && (
                    <a
                      href={dep.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary truncate transition-colors"
                    >
                      {dep.url}
                    </a>
                  )}
                </div>

                {/* Status */}
                <StatusBadge status={dep.status} />

                {/* Date */}
                <span className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
                  <HiOutlineClock className="size-3.5 inline mr-1" />
                  {formatDate(dep.created_at)}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {dep.url && dep.status === "ready" && (
                    <a
                      href={dep.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
                      title="Visit site"
                    >
                      <HiOutlineArrowTopRightOnSquare className="size-4" />
                    </a>
                  )}
                  {dep.inspector_url && (
                    <a
                      href={dep.inspector_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
                      title="Build logs"
                    >
                      <HiOutlineEye className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeployModal
        open={showDeployModal}
        onClose={handleDeployModalClose}
        projectId={selectedProject?.project_id}
        organizationId={organization?.organization_id}
        userId={user?.id}
      />
    </div>
  );
}
