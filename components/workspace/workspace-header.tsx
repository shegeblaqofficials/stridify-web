"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { StridifyLogo } from "@/components/ui/logo";
import { useUser } from "@/hooks/use-user";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { DeployModal } from "@/components/workspace/deploy-modal";
import {
  HiOutlineFolderOpen,
  HiOutlineChevronDown,
  HiOutlineShare,
  HiOutlineCog6Tooth,
  HiOutlineRocketLaunch,
  HiOutlineCheck,
} from "react-icons/hi2";

export interface ProjectVersion {
  id: string;
  label: string;
}

interface WorkspaceHeaderProps {
  projectName?: string;
  onProjectNameChange?: (name: string) => void;
  versions?: ProjectVersion[];
  activeVersionId?: string;
  onVersionChange?: (versionId: string) => void;
}

const defaultVersions: ProjectVersion[] = [
  { id: "v1.0", label: "v1.0 — Initial" },
  { id: "v1.1", label: "v1.1 — Voice Flow" },
  { id: "v1.2", label: "v1.2 — Latest" },
];

export function WorkspaceHeader({
  projectName = "Untitled Project",
  onProjectNameChange,
  versions = defaultVersions,
  activeVersionId,
  onVersionChange,
}: WorkspaceHeaderProps) {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(projectName);
  const [showVersions, setShowVersions] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);
  const [currentVersionId, setCurrentVersionId] = useState(
    activeVersionId ?? versions[versions.length - 1]?.id,
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

  const selectVersion = useCallback(
    (id: string) => {
      setCurrentVersionId(id);
      setShowVersions(false);
      onVersionChange?.(id);
    },
    [onVersionChange],
  );

  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials =
    user?.user_metadata?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  return (
    <header className="flex h-14 items-center justify-between px-6 border-b border-border bg-surface shrink-0">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <StridifyLogo className="h-5 w-5 text-foreground" />
          <span className="text-base font-bold uppercase tracking-widest">
            Stridify
          </span>
        </Link>

        <div className="h-4 w-px bg-border mx-2" />

        <div className="flex items-center gap-2 text-muted-foreground">
          <HiOutlineFolderOpen className="size-4 shrink-0" />
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
              className="text-sm font-medium hover:text-foreground transition-colors"
            >
              {name}
            </button>
          )}

          {/* Version dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setShowVersions((v) => !v)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-surface-elevated transition-colors"
            >
              <span className="text-xs text-muted-foreground">
                {versions.find((v) => v.id === currentVersionId)?.id ??
                  "version"}
              </span>
              <HiOutlineChevronDown
                className={`size-3 transition-transform ${showVersions ? "rotate-180" : ""}`}
              />
            </button>

            {showVersions && (
              <div className="absolute top-full left-0 mt-1.5 w-52 rounded-xl border border-border bg-surface shadow-lg py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Versions
                </div>
                {versions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => selectVersion(v.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-surface-elevated transition-colors"
                  >
                    <span
                      className={
                        v.id === currentVersionId
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {v.label}
                    </span>
                    {v.id === currentVersionId && (
                      <HiOutlineCheck className="size-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-surface-elevated hover:opacity-80 transition-colors">
          <HiOutlineShare className="size-4" />
          <span>Share</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-surface-elevated hover:opacity-80 transition-colors">
          <HiOutlineCog6Tooth className="size-4" />
          <span>Settings</span>
        </button>
        <button
          onClick={() => setShowDeploy(true)}
          className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <HiOutlineRocketLaunch className="size-4" />
          <span>Deploy</span>
        </button>

        <div className="size-8 rounded-full bg-surface-elevated flex items-center justify-center overflow-hidden border border-border ml-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="size-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-xs font-bold text-muted-foreground">
              {initials}
            </span>
          )}
        </div>
        <ThemeSwitcher />
      </div>

      <DeployModal open={showDeploy} onClose={() => setShowDeploy(false)} />
    </header>
  );
}
