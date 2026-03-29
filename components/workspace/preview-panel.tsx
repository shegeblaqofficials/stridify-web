"use client";

import { useRef, useState, useCallback } from "react";
import { BrowserFrame, type BrowserFrameHandle } from "./browser-frame";
import {
  HiOutlineDevicePhoneMobile,
  HiOutlineDeviceTablet,
  HiOutlineComputerDesktop,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineArrowPath,
  HiOutlineEyeSlash,
  HiOutlineBolt,
  HiOutlineSparkles,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowsPointingOut,
} from "react-icons/hi2";
import type { ProjectStatus } from "@/model/project/project";

type DeviceMode = "phone" | "tablet" | "desktop";

const deviceStyles: Record<DeviceMode, string> = {
  phone: "max-w-[375px] mx-auto",
  tablet: "max-w-[768px] mx-auto",
  desktop: "w-full h-full",
};

interface PreviewPanelProps {
  previewUrl?: string;
  projectStatus: ProjectStatus;
  refreshKey: number;
  balanceExhausted: boolean;
  sandboxLoading: boolean;
  onUpgrade?: () => void;
  chatCollapsed?: boolean;
  onToggleChat?: () => void;
}

export function PreviewPanel({
  previewUrl,
  projectStatus,
  refreshKey,
  balanceExhausted,
  sandboxLoading,
  onUpgrade,
  chatCollapsed,
  onToggleChat,
}: PreviewPanelProps) {
  const browserRef = useRef<BrowserFrameHandle>(null);
  const [device, setDevice] = useState<DeviceMode>("desktop");

  const handleRefresh = useCallback(() => {
    browserRef.current?.refresh();
  }, []);

  const handleOpenExternal = useCallback(() => {
    if (previewUrl) {
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    }
  }, [previewUrl]);

  const deviceBtn = (
    mode: DeviceMode,
    Icon: React.ComponentType<{ className?: string }>,
    title: string,
  ) => (
    <button
      onClick={() => setDevice(mode)}
      className={`p-1.5 rounded-md transition-colors ${
        device === mode
          ? "bg-surface-elevated text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
      }`}
      title={title}
    >
      <Icon className="size-3.5" />
    </button>
  );

  return (
    <section className="flex-1 flex flex-col relative">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 h-11 bg-surface border-b border-border shrink-0">
        {/* Toggle chat */}
        <button
          onClick={onToggleChat}
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
          title={chatCollapsed ? "Show chat" : "Expand preview"}
        >
          {chatCollapsed ? (
            <HiOutlineChatBubbleLeftRight className="size-3.5" />
          ) : (
            <HiOutlineArrowsPointingOut className="size-3.5" />
          )}
          <span className="text-[11px] font-medium">
            {chatCollapsed ? "Chat" : "Expand"}
          </span>
        </button>

        {/* Divider */}
        <div className="hidden md:block h-4 w-px bg-border" />

        {/* Device buttons */}
        <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
          {deviceBtn("phone", HiOutlineDevicePhoneMobile, "Phone")}
          {deviceBtn("tablet", HiOutlineDeviceTablet, "Tablet")}
          {deviceBtn("desktop", HiOutlineComputerDesktop, "Desktop")}
        </div>

        {/* URL bar */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-sm h-7 bg-background rounded-md border border-border flex items-center px-3">
            <span className="text-[11px] text-muted-foreground truncate select-all">
              {previewUrl || "/"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleOpenExternal}
            disabled={!previewUrl}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors disabled:opacity-30 disabled:pointer-events-none"
            title="Open in new tab"
          >
            <HiOutlineArrowTopRightOnSquare className="size-3.5" />
          </button>
          <button
            onClick={handleRefresh}
            disabled={!previewUrl}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors disabled:opacity-30 disabled:pointer-events-none"
            title="Refresh preview"
          >
            <HiOutlineArrowPath className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Preview area — iframe resizes based on selected device */}
      <div
        className={`flex-1 overflow-hidden bg-background ${device !== "desktop" ? "p-8" : ""}`}
      >
        {balanceExhausted ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="size-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
              <HiOutlineBolt className="size-7 text-amber-500" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1.5">
              Preview unavailable
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Your credits have been exhausted. Upgrade your plan to resume
              building and previewing your agent.
            </p>
            <button
              type="button"
              onClick={onUpgrade}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.97]"
            >
              <HiOutlineSparkles className="size-4" />
              Buy 50,000 Credits
            </button>
          </div>
        ) : (
          <div
            className={`transition-all duration-300 ease-in-out h-full ${deviceStyles[device]} ${
              device !== "desktop"
                ? "border border-border shadow-lg rounded-xl overflow-hidden"
                : ""
            }`}
          >
            <BrowserFrame
              ref={browserRef}
              previewUrl={previewUrl}
              projectStatus={projectStatus}
              refreshKey={refreshKey}
              sandboxLoading={sandboxLoading}
            />
          </div>
        )}
      </div>
    </section>
  );
}
