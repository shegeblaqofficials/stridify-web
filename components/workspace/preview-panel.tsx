"use client";

import { useState } from "react";
import { BrowserFrame } from "./browser-frame";
import {
  HiOutlineDevicePhoneMobile,
  HiOutlineDeviceTablet,
  HiOutlineComputerDesktop,
  HiOutlineCommandLine,
} from "react-icons/hi2";

const tabs = ["App", "Web", "Code", "Launch"] as const;

interface PreviewPanelProps {
  previewUrl?: string;
}

export function PreviewPanel({ previewUrl }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("Web");

  return (
    <section className="flex-1 flex flex-col relative">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-6 bg-surface border-b border-border shrink-0">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <HiOutlineDevicePhoneMobile className="size-5" />
          </button>
          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <HiOutlineDeviceTablet className="size-5" />
          </button>
          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <HiOutlineComputerDesktop className="size-5" />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex overflow-hidden bg-background">
        <div className="flex-1 relative flex items-center justify-center p-6 lg:p-10">
          <BrowserFrame previewUrl={previewUrl} />
        </div>
      </div>

      {/* Status bar */}
      <div className="h-10 border-t border-border bg-surface flex items-center justify-end px-6 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <HiOutlineCommandLine className="size-3.5" />
          <span>Idle</span>
        </div>
      </div>
    </section>
  );
}
