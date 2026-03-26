"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { StridifyLogo } from "@/components/ui/logo";
import { useAccount } from "@/provider/account-provider";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { DeployModal } from "@/components/workspace/deploy-modal";
import {
  HiOutlineFolderOpen,
  HiOutlineChevronDown,
  HiOutlineShare,
  HiOutlineCog6Tooth,
  HiOutlineRocketLaunch,
  HiOutlineCheck,
  HiOutlineBolt,
  HiOutlineArrowDownTray,
} from "react-icons/hi2";
import type { Snapshot } from "@/model/project/snapshot";

export interface TokenUsageDisplay {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

interface WorkspaceHeaderProps {
  projectId?: string;
  projectName?: string;
  onProjectNameChange?: (name: string) => void;
  snapshots?: Snapshot[];
  activeSnapshotId?: string;
  onSnapshotChange?: (snapshotId: string) => void;
  tokenUsage?: TokenUsageDisplay | null;
}

function formatSnapshotDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function WorkspaceHeader({
  projectId,
  projectName = "Untitled Project",
  onProjectNameChange,
  snapshots = [],
  activeSnapshotId,
  onSnapshotChange,
  tokenUsage,
}: WorkspaceHeaderProps) {
  const { user, organization } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(projectName);
  const [showVersions, setShowVersions] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [currentSnapshotId, setCurrentSnapshotId] = useState(
    activeSnapshotId ?? snapshots[0]?.snapshot_id,
  );
  const activeSnapshot = snapshots.find(
    (s) => s.snapshot_id === currentSnapshotId,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.select();
  }, [isEditing]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showVersions) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowVersions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showVersions]);

  // Close dropdown on Escape
  useEffect(() => {
    if (!showVersions) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowVersions(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showVersions]);

  const commitName = () => {
    setIsEditing(false);
    const trimmed = name.trim() || "Untitled Project";
    setName(trimmed);
    onProjectNameChange?.(trimmed);
  };

  const selectSnapshot = useCallback(
    (id: string) => {
      setCurrentSnapshotId(id);
      setShowVersions(false);
      onSnapshotChange?.(id);
    },
    [onSnapshotChange],
  );

  return (
    <header className="flex h-14 items-center justify-between px-3 md:px-6 border-b border-border bg-surface shrink-0">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <Link href="/home" className="flex items-center gap-2 shrink-0">
          <StridifyLogo className="h-5 w-5 text-foreground" />
          <span className="hidden sm:inline text-base font-bold uppercase tracking-widest">
            Stridify
          </span>
          <span
            className="hidden sm:inline rounded-md border border-foreground/30 px-2 py-[3px] text-[9px] font-bold uppercase leading-none tracking-wide dark:border-primary/50"
            style={{ color: "var(--foreground)" }}
          >
            Beta
          </span>
        </Link>

        <div className="hidden sm:block h-4 w-px bg-border mx-2" />

        <div className="flex items-center gap-2 text-muted-foreground min-w-0">
          <HiOutlineFolderOpen className="size-4 shrink-0 hidden sm:block" />
          {isEditing ? (
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitName();
                if (e.key === "Escape") {
                  setName(projectName);
                  setIsEditing(false);
                }
              }}
              className="text-sm font-medium bg-transparent border-b border-primary outline-none text-foreground w-48 py-0.5"
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm font-medium hover:text-foreground transition-colors truncate max-w-[200px]"
              title={name}
            >
              {name}
            </button>
          )}

          {/* Snapshot version dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => snapshots.length > 0 && setShowVersions((v) => !v)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                snapshots.length > 0
                  ? "hover:bg-surface-elevated cursor-pointer"
                  : "opacity-50 cursor-default"
              }`}
            >
              {activeSnapshot ? (
                <>
                  <span className="text-xs text-muted-foreground">
                    v{activeSnapshot.version_number}
                  </span>
                  <span className="hidden sm:inline text-xs text-muted-foreground/60">
                    — {formatSnapshotDate(activeSnapshot.created_at)}
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">v0</span>
              )}
              {snapshots.length > 0 && (
                <HiOutlineChevronDown
                  className={`size-3 transition-transform ${showVersions ? "rotate-180" : ""}`}
                />
              )}
            </button>

            {showVersions && snapshots.length > 0 && (
              <div className="absolute top-full left-0 mt-1.5 w-56 rounded-xl border border-border bg-surface shadow-lg py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Snapshots
                </div>
                {snapshots.map((s) => {
                  const isActive = s.snapshot_id === currentSnapshotId;
                  return (
                    <button
                      key={s.snapshot_id}
                      onClick={() => selectSnapshot(s.snapshot_id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-surface-elevated transition-colors"
                    >
                      <div className="flex flex-col items-start">
                        <span
                          className={
                            isActive
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          v{s.version_number}
                          <span className="ml-1.5 text-xs text-muted-foreground/60">
                            {s.version_name}
                          </span>
                        </span>
                        <span className="text-[10px] text-muted-foreground/50">
                          {new Date(s.created_at).toLocaleString()}
                        </span>
                      </div>
                      {isActive && (
                        <HiOutlineCheck className="size-4 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
        {tokenUsage && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-elevated border border-border text-xs text-muted-foreground">
            <HiOutlineBolt className="size-3.5 text-amber-500" />
            <span className="font-medium tabular-nums">
              {tokenUsage.totalTokens.toLocaleString()}
            </span>
            <span className="text-muted-foreground/60">tokens</span>
          </div>
        )}
        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-surface-elevated hover:opacity-80 transition-colors">
          <HiOutlineShare className="size-4" />
          <span>Share</span>
        </button>
        <button
          disabled={!projectId || downloading}
          onClick={async () => {
            if (!projectId) return;
            setDownloading(true);
            try {
              const res = await fetch(
                `/api/sandbox/download?projectId=${encodeURIComponent(projectId)}`,
              );
              if (!res.ok) {
                console.error("[download] failed:", res.status);
                return;
              }
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download =
                res.headers
                  .get("Content-Disposition")
                  ?.match(/filename="(.+)"/)?.[1] ?? "project.tar.gz";
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            } catch (err) {
              console.error("[download] error:", err);
            } finally {
              setDownloading(false);
            }
          }}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-surface-elevated hover:opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiOutlineArrowDownTray
            className={`size-4 ${downloading ? "animate-bounce" : ""}`}
          />
          <span>{downloading ? "Downloading..." : "Download"}</span>
        </button>
        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-surface-elevated hover:opacity-80 transition-colors">
          <HiOutlineCog6Tooth className="size-4" />
          <span>Settings</span>
        </button>
        <button
          onClick={() => setShowDeploy(true)}
          className="flex items-center gap-1.5 md:gap-2 p-1.5 md:px-4 md:py-1.5 text-xs md:text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <HiOutlineRocketLaunch className="size-4" />
          <span className="hidden md:inline">Deploy</span>
        </button>

        {user && <UserDropdown user={user} />}
      </div>

      <DeployModal
        open={showDeploy}
        onClose={() => setShowDeploy(false)}
        projectId={projectId}
        organizationId={organization?.organization_id}
        userId={user?.id}
      />
    </header>
  );
}
