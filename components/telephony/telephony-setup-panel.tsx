"use client";

import { useEffect, useState } from "react";
import {
  HiOutlinePhone,
  HiOutlinePlusCircle,
  HiOutlineChevronRight,
  HiOutlineBookOpen,
  HiOutlineSignal,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import type { Voice } from "@/lib/project/actions";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface PhoneNumber {
  id: string;
  number: string;
  label?: string;
  active: boolean;
}

interface TelephonySetupProps {
  voices: Voice[];
  phoneNumbers: PhoneNumber[];
  canBuyNumber: boolean;
  releasingNumber: boolean;
  selectedVoice: string;
  inboundEnabled: boolean;
  assistantName: string;
  systemPrompt?: string;
  onSystemPromptSave?: (next: string) => Promise<void> | void;
  onAssistantNameChange?: (name: string) => void;
  onAssistantNameBlur?: () => void;
  onBuyNumber?: () => void;
  onReleaseNumber?: () => void;
  onUpgradePlan?: () => void;
  onVoiceChange?: (voiceId: string) => Promise<void> | void;
  onToggleInbound?: (enabled: boolean) => void;
  onOpenKnowledgeBase?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export function TelephonySetupPanel({
  voices,
  phoneNumbers,
  canBuyNumber,
  releasingNumber,
  selectedVoice,
  inboundEnabled,
  assistantName,
  systemPrompt = "",
  onSystemPromptSave,
  onAssistantNameChange,
  onAssistantNameBlur,
  onBuyNumber,
  onReleaseNumber,
  onUpgradePlan,
  onVoiceChange,
  onToggleInbound,
  onOpenKnowledgeBase,
}: TelephonySetupProps) {
  const [voiceDropdownOpen, setVoiceDropdownOpen] = useState(false);
  const [prompt, setPrompt] = useState(systemPrompt);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => setPrompt(systemPrompt), [systemPrompt]);
  useEffect(() => {
    if (savedAt === null) return;
    const t = setTimeout(() => setSavedAt(null), 1500);
    return () => clearTimeout(t);
  }, [savedAt]);

  const activeVoice = voices.find((v) => v.id === selectedVoice) ?? voices[0];

  return (
    <div className="h-full w-full overflow-y-auto workspace-scrollbar bg-surface">
      <div className="p-8 space-y-8">
        {/* ─── Step header ─── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground mb-0.5">
              Telephony Setup
            </h1>
            <p className="text-[13px] text-muted-foreground">
              Link a number to your AI agent and define its behavior.
            </p>
          </div>
          {savedAt !== null && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground animate-in fade-in duration-150 mt-1.5">
              <HiOutlineCheckCircle className="size-3.5 text-emerald-500" />
              Saved
            </span>
          )}
        </div>

        {/* ─── Agent Name ─── */}
        <section className="space-y-3">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Agent Name
          </label>
          <input
            type="text"
            value={assistantName}
            onChange={(e) => onAssistantNameChange?.(e.target.value)}
            onBlur={() => onAssistantNameBlur?.()}
            placeholder="Agent Name"
            className="w-full rounded-xl border border-border bg-background mt-2 px-4 py-3 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
          />
          <p className="text-[11px] text-muted-foreground -mt-1">
            Displayed during connected calls in the simulator.
          </p>
        </section>

        {/* ─── Phone Number ─── */}
        <section className="space-y-4">
          <div className="flex justify-between items-baseline">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Selected Number
            </label>
            <button
              onClick={onBuyNumber}
              disabled={!canBuyNumber}
              className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              Buy New Number
            </button>
          </div>

          {!canBuyNumber && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2">
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Buying phone numbers is available on paid plans only. Free US
                local number is included with paid plans.
              </p>
              <button
                type="button"
                onClick={onUpgradePlan}
                className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Upgrade to a paid plan
              </button>
            </div>
          )}

          {phoneNumbers.length > 0 ? (
            <div className="space-y-2">
              {phoneNumbers.map((pn) => (
                <div
                  key={pn.id}
                  className="group relative flex items-center gap-3.5 rounded-2xl border border-border bg-background p-4 transition-all hover:border-border/80 hover:shadow-sm"
                >
                  <div className="size-10 rounded-xl bg-surface-elevated flex items-center justify-center shrink-0 border border-border/60">
                    <HiOutlinePhone className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-foreground tabular-nums">
                      {pn.number}
                    </p>
                    {pn.active && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-500">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active Agent Connected
                      </span>
                    )}
                  </div>
                  <button
                    onClick={onReleaseNumber}
                    disabled={releasingNumber}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {releasingNumber ? "Releasing…" : "Release"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <button
              onClick={onBuyNumber}
              disabled={!canBuyNumber}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background px-4 py-6 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              <HiOutlinePlusCircle className="size-5" />
              Add a phone number
            </button>
          )}
        </section>

        {/* ─── Voice Configuration ─── */}
        <section className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Voice & Tone
          </label>

          <div className="relative mt-2">
            <button
              onClick={() => setVoiceDropdownOpen((o) => !o)}
              className="w-full flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3.5 text-[13px] font-medium text-foreground hover:bg-surface-elevated transition-colors"
            >
              <span>
                {activeVoice?.name}{" "}
                <span className="text-muted-foreground">
                  — {activeVoice?.description}
                </span>
              </span>
              <svg
                className={`size-4 text-muted-foreground transition-transform ${voiceDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {voiceDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-full rounded-xl border border-border bg-surface shadow-xl z-20 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {voices.map((v) => (
                  <button
                    key={v.id}
                    onClick={async () => {
                      setVoiceDropdownOpen(false);
                      await onVoiceChange?.(v.id);
                      setSavedAt(Date.now());
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors hover:bg-surface-elevated ${
                      v.id === selectedVoice
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span>
                      {v.name}{" "}
                      <span className="text-muted-foreground/60">
                        — {v.description}
                      </span>
                    </span>
                    {v.id === selectedVoice && (
                      <span className="size-2 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-1">
            <HiOutlineSignal className="size-3.5" />
            Preview {activeVoice?.name}
          </button>
        </section>

        {/* ─── Knowledge & Logic ─── */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Agent Intelligence
          </label>

          <button
            onClick={onOpenKnowledgeBase}
            className="w-full flex items-center gap-3.5 mt-2 rounded-2xl border border-border bg-background px-4 py-3.5 transition-all hover:border-border/80 hover:shadow-sm group text-left"
          >
            <div className="size-9 rounded-xl bg-surface-elevated flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
              <HiOutlineBookOpen className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-foreground">
                Add Knowledge Base
              </p>
              <p className="text-[11px] text-muted-foreground">
                Upload PDFs or link URLs
              </p>
            </div>
            <HiOutlineChevronRight className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
          </button>
        </section>

        {/* ─── Inbound Toggle ─── */}
        <section>
          <div className="flex items-center justify-between rounded-2xl border border-border bg-background p-4">
            <div>
              <p className="text-[13px] font-bold text-foreground">
                Inbound Calls
              </p>
              <p className="text-[11px] text-muted-foreground">
                Agent will answer instantly
              </p>
            </div>
            <button
              onClick={() => onToggleInbound?.(!inboundEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                inboundEnabled ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  inboundEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </section>

        {/* ─── System Prompt (last) ─── */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            System Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onBlur={async () => {
              const trimmed = prompt.trim();
              if (!trimmed || trimmed === systemPrompt.trim()) return;
              await onSystemPromptSave?.(trimmed);
              setSavedAt(Date.now());
            }}
            rows={10}
            placeholder="Instructions that drive your agent's persona, tone, and scope…"
            className="w-full rounded-xl border border-border bg-background mt-2 px-4 py-3 text-[12.5px] leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors resize-y workspace-scrollbar font-sans"
          />
          <p className="text-[11px] text-muted-foreground -mt-1">
            Auto generated from your description. Edit to refine.
          </p>
        </section>
      </div>
    </div>
  );
}
