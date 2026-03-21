"use client";

import { useRef, useState, useCallback } from "react";
import { BrowserFrame, type BrowserFrameHandle } from "./browser-frame";
import {
  HiOutlineDevicePhoneMobile,
  HiOutlineDeviceTablet,
  HiOutlineComputerDesktop,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineArrowPath,
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
  projectStatus?: ProjectStatus;
  refreshKey?: number;
}

export function PreviewPanel({
  previewUrl,
  projectStatus,
  refreshKey,
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
          />
        </div>
      </div>
    </section>
  );
}
