"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { StridifyLogo } from "@/components/ui/logo";
import { useAccount } from "@/provider/account-provider";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { updateProjectStatus } from "@/lib/project/actions";
import {
  HiOutlineFolderOpen,
  HiOutlineRocketLaunch,
  HiOutlineCheckCircle,
  HiOutlinePencilSquare,
} from "react-icons/hi2";

interface TelephonyHeaderProps {
  projectId?: string;
  projectName?: string;
  onProjectNameChange?: (name: string) => void;
}

export function TelephonyHeader({
  projectId,
  projectName = "Untitled Agent",
  onProjectNameChange,
}: TelephonyHeaderProps) {
  const { user } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(projectName);
  const [isLive, setIsLive] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.select();
  }, [isEditing]);

  const commitName = () => {
    setIsEditing(false);
    const trimmed = name.trim() || "Untitled Agent";
    setName(trimmed);
    onProjectNameChange?.(trimmed);
  };

  const handleGoLive = async () => {
    if (!projectId || publishing || isLive) return;
    setPublishing(true);
    const ok = await updateProjectStatus(projectId, "deployed");
    setPublishing(false);
    if (ok) setIsLive(true);
  };

  return (
    <header className="flex h-14 items-center justify-between px-3 md:px-6 border-b border-border bg-surface shrink-0">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <Link href="/home" className="flex items-center gap-2 shrink-0">
          <StridifyLogo className="h-5 w-5 text-foreground" />
          <span className="hidden sm:inline text-base font-bold uppercase tracking-widest">
            Stridify
          </span>
          <span className="hidden sm:inline rounded-md border border-foreground/30 px-2 py-0.75 text-[9px] font-bold uppercase leading-none tracking-wide dark:border-primary/50">
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
              className="group/title flex items-center gap-1.5 text-sm font-medium hover:text-foreground transition-colors truncate max-w-50"
              title={name}
            >
              <span className="truncate">{name}</span>
              <HiOutlinePencilSquare className="size-3.5 shrink-0 opacity-0 group-hover/title:opacity-60 transition-opacity" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
        <button
          onClick={handleGoLive}
          disabled={publishing || isLive || !projectId}
          className="flex items-center gap-1.5 md:gap-2 p-1.5 md:px-4 md:py-1.5 text-xs md:text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLive ? (
            <HiOutlineCheckCircle className="size-4" />
          ) : (
            <HiOutlineRocketLaunch className="size-4" />
          )}
          <span className="hidden md:inline">
            {isLive ? "Live" : publishing ? "Publishing…" : "Go Live"}
          </span>
        </button>

        {user && <UserDropdown user={user} />}
      </div>
    </header>
  );
}
