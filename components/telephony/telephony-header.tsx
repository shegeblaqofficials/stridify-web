"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { StridifyLogo } from "@/components/ui/logo";
import { useAccount } from "@/provider/account-provider";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { DeployModal } from "@/components/workspace/deploy-modal";
import {
  HiOutlineFolderOpen,
  HiOutlineShare,
  HiOutlineRocketLaunch,
  HiOutlineCog6Tooth,
  HiOutlineEllipsisHorizontal,
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
  const { user, organization } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(projectName);
  const [showDeploy, setShowDeploy] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.select();
  }, [isEditing]);

  useEffect(() => {
    if (!showMenu) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const isClickOnButton = menuButtonRef.current?.contains(target);
      const isClickOnMenu = menuRef.current?.contains(target);

      if (!isClickOnButton && !isClickOnMenu) {
        setShowMenu(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [showMenu]);

  const commitName = () => {
    setIsEditing(false);
    const trimmed = name.trim() || "Untitled Agent";
    setName(trimmed);
    onProjectNameChange?.(trimmed);
  };

  const menuItems = [
    { label: "Share", icon: HiOutlineShare, onClick: () => {} },
    { label: "Settings", icon: HiOutlineCog6Tooth, onClick: () => {} },
  ];

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
        {/* More menu dropdown */}
        <div ref={menuRef} className="relative">
          <button
            ref={menuButtonRef}
            onClick={() => setShowMenu((v) => !v)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-surface-elevated hover:opacity-80 transition-colors"
          >
            <span>More</span>
            <HiOutlineEllipsisHorizontal className="size-4 text-muted-foreground" />
          </button>

          {showMenu && (
            <div className="absolute top-full right-0 mt-1.5 w-44 rounded-xl border border-border bg-surface shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    item.onClick();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowDeploy(true)}
          className="flex items-center gap-1.5 md:gap-2 p-1.5 md:px-4 md:py-1.5 text-xs md:text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <HiOutlineRocketLaunch className="size-4" />
          <span className="hidden md:inline">Deploy Agent</span>
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
