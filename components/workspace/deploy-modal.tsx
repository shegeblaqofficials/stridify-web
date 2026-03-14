"use client";

import { useState, useEffect, useRef } from "react";
import {
  HiOutlineXMark,
  HiOutlineGlobeAlt,
  HiOutlineDevicePhoneMobile,
  HiOutlineCodeBracket,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

const deployOptions = [
  {
    id: "web" as const,
    label: "Web Application",
    description: "Host on custom subdomain or your own domain.",
    icon: HiOutlineGlobeAlt,
  },
  {
    id: "pwa" as const,
    label: "Mobile PWA",
    description: "Optimized for iOS & Android installation.",
    icon: HiOutlineDevicePhoneMobile,
  },
  {
    id: "api" as const,
    label: "API Endpoint",
    description: "Headless logic available via REST/gRPC.",
    icon: HiOutlineCodeBracket,
  },
];

type DeployTarget = (typeof deployOptions)[number]["id"];

interface DeployModalProps {
  open: boolean;
  onClose: () => void;
  onDeploy?: (target: DeployTarget) => void;
}

export function DeployModal({ open, onClose, onDeploy }: DeployModalProps) {
  const [selected, setSelected] = useState<DeployTarget>("web");
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg mx-4 rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-xl font-bold text-foreground">
            Deploy Application
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
          >
            <HiOutlineXMark className="size-5" />
          </button>
        </div>

        {/* Description */}
        <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
          Choose your deployment method. Stridify handles infrastructure and
          scaling automatically.
        </p>

        {/* Options */}
        <div className="px-6 space-y-3">
          {deployOptions.map((opt) => {
            const isActive = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={[
                  "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                  isActive
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border hover:border-muted-foreground/30 hover:bg-surface-elevated",
                ].join(" ")}
              >
                <div
                  className={[
                    "size-10 rounded-xl flex items-center justify-center shrink-0",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-surface-elevated text-muted-foreground",
                  ].join(" ")}
                >
                  <opt.icon className="size-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">
                    {opt.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {opt.description}
                  </div>
                </div>

                <div
                  className={[
                    "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border",
                  ].join(" ")}
                >
                  {isActive && <HiOutlineCheckCircle className="size-4" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action */}
        <div className="px-6 pt-6 pb-6">
          <button
            onClick={() => {
              onDeploy?.(selected);
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Deploy Now
          </button>
        </div>
      </div>
    </div>
  );
}
