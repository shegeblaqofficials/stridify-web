"use client";

import { useState, useEffect, useRef } from "react";
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
  HiOutlinePlus,
  HiOutlineEllipsisVertical,
  HiOutlinePencilSquare,
  HiOutlineTrash,
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
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDeployment, setSelectedDeployment] =
    useState<DeploymentType | null>(null);
  const [deployModalProjectId, setDeployModalProjectId] = useState<
    string | undefined
  >(undefined);
  const [openMenuDeploymentId, setOpenMenuDeploymentId] = useState<
    string | null
  >(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenuDeploymentId) return;
    const onOutsideClick = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setOpenMenuDeploymentId(null);
      }
    };
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [openMenuDeploymentId]);

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

  const handleOpenDeployModal = (projectId?: string) => {
    setDeployModalProjectId(projectId);
    setShowDeployModal(true);
  };

  const handleDeployModalClose = () => {
    setShowDeployModal(false);
    setDeployModalProjectId(undefined);
    // Refresh deployments after modal closes
    refresh();
  };

  const handleDeleteClick = (deployment: DeploymentType) => {
    setOpenMenuDeploymentId(null);
    setSelectedDeployment(deployment);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDeployment) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/deploy", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deploymentId: selectedDeployment.deployment_id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete deployment");
      }

      setShowDeleteDialog(false);
      setSelectedDeployment(null);
      await refresh();
    } catch (err) {
      console.error("[deployment] delete failed:", err);
      alert(err instanceof Error ? err.message : "Failed to delete deployment");
    } finally {
      setDeleting(false);
    }
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
            <div className="flex items-center gap-2">
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

              <button
                onClick={() => handleOpenDeployModal()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <HiOutlinePlus className="size-4" />
                New Deployment
              </button>
            </div>
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
                Create your first deployment in a few clicks.
              </p>
              <button
                onClick={() => handleOpenDeployModal()}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <HiOutlinePlus className="size-4" />
                New Deployment
              </button>
            </div>
          </div>
        )}

        {/* Deployment list */}
        {!loading && deployments.length > 0 && (
          <div
            ref={menuContainerRef}
            className="mt-8 overflow-visible rounded-xl border border-border bg-surface divide-y divide-border"
          >
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

                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenuDeploymentId((current) =>
                          current === dep.deployment_id
                            ? null
                            : dep.deployment_id,
                        )
                      }
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
                      title="Deployment actions"
                    >
                      <HiOutlineEllipsisVertical className="size-4" />
                    </button>

                    {openMenuDeploymentId === dep.deployment_id && (
                      <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-border bg-surface shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
                        <button
                          onClick={() => {
                            setOpenMenuDeploymentId(null);
                            handleOpenDeployModal(dep.project_id);
                          }}
                          className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-elevated transition-colors"
                        >
                          <HiOutlineArrowPath className="size-4 text-muted-foreground" />
                          Update Deployment
                        </button>
                        <button
                          onClick={() => setOpenMenuDeploymentId(null)}
                          className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-elevated transition-colors"
                        >
                          <HiOutlinePencilSquare className="size-4 text-muted-foreground" />
                          Edit Deployment
                        </button>
                        <button
                          onClick={() => handleDeleteClick(dep)}
                          className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <HiOutlineTrash className="size-4" />
                          Delete Deployment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeployModal
        open={showDeployModal}
        onClose={handleDeployModalClose}
        projectId={deployModalProjectId}
        organizationId={organization?.organization_id}
        userId={user?.id}
        projects={projects}
      />

      {showDeleteDialog && selectedDeployment && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-semibold text-foreground">
              Delete deployment?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This will delete the deployment from Vercel and remove it from
              your records.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Deployment:{" "}
              {selectedDeployment.deployment_name ||
                selectedDeployment.deployment_id.slice(0, 8)}
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  if (deleting) return;
                  setShowDeleteDialog(false);
                  setSelectedDeployment(null);
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-elevated transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
