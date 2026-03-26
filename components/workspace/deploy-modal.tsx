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
} from "react-icons/hi2";
import type { DeploymentEnvironment } from "@/model/deployment/deployment";

type DeployStep = "configure" | "deploying" | "success" | "error";

interface DeployModalProps {
  open: boolean;
  onClose: () => void;
  projectId?: string;
  organizationId?: string;
  userId?: string;
}

export function DeployModal({
  open,
  onClose,
  projectId,
  organizationId,
  userId,
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
  const overlayRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open]);

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
    if (!projectId || !organizationId || !userId) return;

    setStep("deploying");
    setStatus("queued");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          organizationId,
          userId,
          environment,
          deploymentName: deploymentName.trim() || undefined,
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg mx-4 rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {step === "configure" && (
          <ConfigureStep
            environment={environment}
            setEnvironment={setEnvironment}
            deploymentName={deploymentName}
            setDeploymentName={setDeploymentName}
            onClose={onClose}
            onDeploy={handleDeploy}
            disabled={!projectId || !organizationId || !userId}
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
  environment,
  setEnvironment,
  deploymentName,
  setDeploymentName,
  onClose,
  onDeploy,
  disabled,
}: {
  environment: DeploymentEnvironment;
  setEnvironment: (e: DeploymentEnvironment) => void;
  deploymentName: string;
  setDeploymentName: (n: string) => void;
  onClose: () => void;
  onDeploy: () => void;
  disabled: boolean;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <h2 className="text-xl font-bold text-foreground">Deploy to Vercel</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
        >
          <HiOutlineXMark className="size-5" />
        </button>
      </div>

      <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
        Deploy your application directly from your workspace. Choose an
        environment and deploy with one click.
      </p>

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

        {/* Optional deployment name */}
        <div className="pt-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Deployment Name{" "}
            <span className="font-normal normal-case">(optional)</span>
          </label>
          <input
            type="text"
            value={deploymentName}
            onChange={(e) => setDeploymentName(e.target.value)}
            placeholder="e.g. v2 redesign"
            className="mt-2 w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
          />
        </div>
      </div>

      <div className="px-6 pt-6 pb-6">
        <button
          disabled={disabled}
          onClick={onDeploy}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiOutlineRocketLaunch className="size-4" />
          Deploy Now
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

      {url && (
        <p className="mt-3 text-xs text-muted-foreground break-all max-w-sm">
          {url}
        </p>
      )}

      <div className="mt-5 flex items-center gap-3">
        {inspectorUrl && (
          <a
            href={inspectorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            View Build Logs
          </a>
        )}
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
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
