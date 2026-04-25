"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  HiOutlineXMark,
  HiOutlineGlobeAlt,
  HiOutlineRocketLaunch,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineEye,
  HiOutlineChevronUpDown,
  HiOutlineFolderOpen,
} from "react-icons/hi2";
import type {
  DeploymentEnvironment,
  Deployment,
} from "@/model/deployment/deployment";
import type { Project } from "@/model/project/project";

type DeployStep = "configure" | "deploying" | "success" | "error";

interface LatestDeployments {
  preview: Deployment | null;
  production: Deployment | null;
}

interface DeployModalProps {
  open: boolean;
  onClose: () => void;
  projectId?: string;
  organizationId?: string;
  userId?: string;
  /** When provided, the modal shows a project selector (used from the deployments page) */
  projects?: Project[];
}

export function DeployModal({
  open,
  onClose,
  projectId: externalProjectId,
  organizationId,
  userId,
  projects,
}: DeployModalProps) {
  const [step, setStep] = useState<DeployStep>("configure");
  const [environment, setEnvironment] =
    useState<DeploymentEnvironment>("preview");
  const [deploymentName, setDeploymentName] = useState("");
  const [deploymentId, setDeploymentId] = useState<string | null>(null);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [inspectorUrl, setInspectorUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("queued");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >(externalProjectId);
  const [latestDeployments, setLatestDeployments] = useState<LatestDeployments>(
    { preview: null, production: null },
  );
  const [loadingExisting, setLoadingExisting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeProjectId = externalProjectId ?? selectedProjectId;
  const existingDeployment = latestDeployments[environment];
  const isUpdate = Boolean(existingDeployment);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setStep("configure");
      setEnvironment("preview");
      setDeploymentName("");
      setDeploymentId(null);
      setDeployUrl(null);
      setInspectorUrl(null);
      setStatus("queued");
      setErrorMessage(null);
      setSelectedProjectId(externalProjectId);
      setLatestDeployments({ preview: null, production: null });
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open]);

  // Load latest deployments per environment for the active project
  useEffect(() => {
    if (!open || !activeProjectId) {
      setLatestDeployments({ preview: null, production: null });
      return;
    }
    let cancelled = false;
    setLoadingExisting(true);
    fetch(`/api/deploy?projectId=${encodeURIComponent(activeProjectId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (cancelled) return;
        setLatestDeployments({
          preview: data?.latest?.preview ?? null,
          production: data?.latest?.production ?? null,
        });
      })
      .catch(() => {
        if (!cancelled)
          setLatestDeployments({ preview: null, production: null });
      })
      .finally(() => {
        if (!cancelled) setLoadingExisting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, activeProjectId]);

  // When the selected environment changes, prefill name with existing deployment name if any
  useEffect(() => {
    if (!open) return;
    const existing = latestDeployments[environment];
    if (existing?.deployment_name) {
      setDeploymentName(existing.deployment_name);
    } else {
      setDeploymentName("");
    }
  }, [environment, latestDeployments, open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step !== "deploying") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose, step]);

  // Poll deployment status
  const startPolling = useCallback((depId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/deploy/status?deploymentId=${encodeURIComponent(depId)}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        setStatus(data.status);
        if (data.url) setDeployUrl(data.url);
        if (data.inspectorUrl) setInspectorUrl(data.inspectorUrl);

        if (data.status === "ready") {
          setStep("success");
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (data.status === "error" || data.status === "canceled") {
          setStep("error");
          setErrorMessage(
            "Deployment failed. Check Vercel dashboard for details.",
          );
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // Silently retry on network errors
      }
    }, 3000);
  }, []);

  const handleDeploy = async () => {
    const trimmedDeploymentName = deploymentName.trim();
    if (
      !activeProjectId ||
      !organizationId ||
      !userId ||
      !trimmedDeploymentName
    )
      return;

    setStep("deploying");
    setStatus("queued");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeProjectId,
          organizationId,
          userId,
          environment,
          deploymentName: trimmedDeploymentName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStep("error");
        setErrorMessage(data.error || "Deployment failed");
        return;
      }

      setDeploymentId(data.deploymentId);
      setDeployUrl(data.url);
      setInspectorUrl(data.inspectorUrl);
      setStatus(data.status);

      if (data.status === "ready") {
        setStep("success");
      } else {
        startPolling(data.deploymentId);
      }
    } catch (err: any) {
      setStep("error");
      setErrorMessage(err?.message || "Deployment failed");
    }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current && step !== "deploying") onClose();
      }}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg mx-4 rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {step === "configure" && (
          <ConfigureStep
            projects={projects}
            selectedProjectId={activeProjectId}
            setSelectedProjectId={setSelectedProjectId}
            environment={environment}
            setEnvironment={setEnvironment}
            deploymentName={deploymentName}
            setDeploymentName={setDeploymentName}
            onClose={onClose}
            onDeploy={handleDeploy}
            isUpdate={isUpdate}
            loadingExisting={loadingExisting}
            disabled={
              !activeProjectId ||
              !organizationId ||
              !userId ||
              !deploymentName.trim() ||
              loadingExisting
            }
          />
        )}

        {step === "deploying" && (
          <DeployingStep status={status} environment={environment} />
        )}

        {step === "success" && (
          <SuccessStep
            url={deployUrl}
            inspectorUrl={inspectorUrl}
            environment={environment}
            onClose={onClose}
          />
        )}

        {step === "error" && (
          <ErrorStep
            message={errorMessage}
            onRetry={() => setStep("configure")}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Configure Step ────────────────────────────────────── */

function ConfigureStep({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  environment,
  setEnvironment,
  deploymentName,
  setDeploymentName,
  onClose,
  onDeploy,
  disabled,
  isUpdate,
  loadingExisting,
}: {
  projects?: Project[];
  selectedProjectId?: string;
  setSelectedProjectId: (id: string) => void;
  environment: DeploymentEnvironment;
  setEnvironment: (e: DeploymentEnvironment) => void;
  deploymentName: string;
  setDeploymentName: (n: string) => void;
  onClose: () => void;
  onDeploy: () => void;
  disabled: boolean;
  isUpdate: boolean;
  loadingExisting: boolean;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <h2 className="text-xl font-bold text-foreground">
          {isUpdate ? "Update Deployment" : "Deploy to Vercel"}
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
        >
          <HiOutlineXMark className="size-5" />
        </button>
      </div>

      <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
        {isUpdate
          ? `An existing ${environment} deployment was found. You can push a new build to the same deployment below.`
          : "Deploy your application directly from your workspace. Choose an environment and deploy with one click."}
      </p>

      {/* Project selector (for deployments page flow) */}
      {projects && projects.length > 0 && (
        <div className="px-6 pb-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Project
          </label>
          <div className="relative mt-2">
            <select
              value={selectedProjectId ?? ""}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.project_id} value={project.project_id}>
                  {project.title}
                </option>
              ))}
            </select>
            <HiOutlineChevronUpDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      )}

      {projects && projects.length === 0 && (
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated/50 px-3 py-2.5 text-sm text-muted-foreground">
            <HiOutlineFolderOpen className="size-4" />
            No projects available yet.
          </div>
        </div>
      )}

      {/* Environment selector */}
      <div className="px-6 space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Environment
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setEnvironment("preview")}
            className={[
              "flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
              environment === "preview"
                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                : "border-border hover:border-muted-foreground/30 hover:bg-surface-elevated",
            ].join(" ")}
          >
            <div
              className={[
                "size-9 rounded-lg flex items-center justify-center shrink-0",
                environment === "preview"
                  ? "bg-primary/10 text-primary"
                  : "bg-surface-elevated text-muted-foreground",
              ].join(" ")}
            >
              <HiOutlineEye className="size-4.5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Preview
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Test before going live
              </div>
            </div>
          </button>

          <button
            onClick={() => setEnvironment("production")}
            className={[
              "flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
              environment === "production"
                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                : "border-border hover:border-muted-foreground/30 hover:bg-surface-elevated",
            ].join(" ")}
          >
            <div
              className={[
                "size-9 rounded-lg flex items-center justify-center shrink-0",
                environment === "production"
                  ? "bg-primary/10 text-primary"
                  : "bg-surface-elevated text-muted-foreground",
              ].join(" ")}
            >
              <HiOutlineGlobeAlt className="size-4.5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Production
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Live to the world
              </div>
            </div>
          </button>
        </div>

        {/* Required deployment name */}
        <div className="pt-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Deployment Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={deploymentName}
            onChange={(e) => setDeploymentName(e.target.value)}
            placeholder="e.g. storefront-v2"
            readOnly={isUpdate}
            className={[
              "mt-2 w-full px-3 py-2.5 text-sm rounded-xl border bg-background text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors",
              isUpdate
                ? "border-border cursor-not-allowed opacity-80"
                : "border-border focus:border-primary focus:ring-1 focus:ring-primary/30",
            ].join(" ")}
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {isUpdate
              ? `Updating the existing ${environment} deployment. The name can't be changed.`
              : "This will be used as the Vercel deployment name. On first deploy, it will also be used as the Vercel project name."}
          </p>
        </div>
      </div>

      <div className="px-6 pt-6 pb-6">
        <button
          disabled={disabled}
          onClick={onDeploy}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiOutlineRocketLaunch className="size-4" />
          {loadingExisting
            ? "Checking…"
            : isUpdate
              ? "Update Deployment"
              : "Deploy Now"}
        </button>
      </div>
    </>
  );
}

/* ─── Deploying Step ────────────────────────────────────── */

function DeployingStep({
  status,
  environment,
}: {
  status: string;
  environment: DeploymentEnvironment;
}) {
  const steps = [
    { key: "queued", label: "Queued" },
    { key: "building", label: "Building" },
    { key: "ready", label: "Ready" },
  ];

  const currentIdx = steps.findIndex((s) => s.key === status);

  return (
    <div className="px-6 py-10 flex flex-col items-center text-center">
      {/* Animated spinner */}
      <div className="relative size-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-border" />
        <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <HiOutlineRocketLaunch className="size-6 text-primary" />
        </div>
      </div>

      <h2 className="text-lg font-bold text-foreground">
        Deploying to {environment}...
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This usually takes 30–90 seconds.
      </p>

      {/* Progress steps */}
      <div className="mt-6 flex items-center gap-2">
        {steps.map((s, i) => {
          const isActive = i === currentIdx;
          const isDone = i < currentIdx;
          return (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={[
                  "size-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  isDone
                    ? "bg-green-500/10 text-green-500"
                    : isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-surface-elevated text-muted-foreground",
                ].join(" ")}
              >
                {isDone ? <HiOutlineCheckCircle className="size-4" /> : i + 1}
              </div>
              <span
                className={[
                  "text-xs font-medium",
                  isDone
                    ? "text-green-500"
                    : isActive
                      ? "text-foreground"
                      : "text-muted-foreground",
                ].join(" ")}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={[
                    "w-6 h-px",
                    isDone ? "bg-green-500/40" : "bg-border",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Success Step ──────────────────────────────────────── */

function SuccessStep({
  url,
  inspectorUrl,
  environment,
  onClose,
}: {
  url: string | null;
  inspectorUrl: string | null;
  environment: DeploymentEnvironment;
  onClose: () => void;
}) {
  return (
    <div className="px-6 py-10 flex flex-col items-center text-center">
      <div className="size-16 rounded-full bg-green-500/10 flex items-center justify-center mb-5">
        <HiOutlineCheckCircle className="size-8 text-green-500" />
      </div>

      <h2 className="text-lg font-bold text-foreground">
        Deployed Successfully!
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your app is now live on {environment}.
      </p>

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <HiOutlineArrowTopRightOnSquare className="size-4" />
          Visit Site
        </a>
      )}
      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={onClose}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ─── Error Step ────────────────────────────────────────── */

function ErrorStep({
  message,
  onRetry,
  onClose,
}: {
  message: string | null;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <div className="px-6 py-10 flex flex-col items-center text-center">
      <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
        <HiOutlineExclamationTriangle className="size-8 text-red-500" />
      </div>

      <h2 className="text-lg font-bold text-foreground">Deployment Failed</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        {message || "Something went wrong. Please try again."}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-surface-elevated transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
