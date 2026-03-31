"use client";

import { useState } from "react";
import {
  HiOutlinePhone,
  HiOutlinePlusCircle,
  HiOutlineChevronRight,
  HiOutlineEllipsisVertical,
  HiOutlineBookOpen,
  HiOutlineChatBubbleLeftRight,
  HiOutlineSignal,
} from "react-icons/hi2";

/* ------------------------------------------------------------------ */
/*  Voice options                                                     */
/* ------------------------------------------------------------------ */
const voiceOptions = [
  { id: "nova-professional", label: "Nova", style: "Professional & Concise" },
  { id: "luna-friendly", label: "Luna", style: "Warm & Friendly" },
  { id: "atlas-authoritative", label: "Atlas", style: "Authoritative & Calm" },
  { id: "ember-energetic", label: "Ember", style: "Energetic & Upbeat" },
];

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
  phoneNumbers: PhoneNumber[];
  selectedVoice: string;
  inboundEnabled: boolean;
  assistantName: string;
  onAssistantNameChange?: (name: string) => void;
  onAssistantNameBlur?: () => void;
  onBuyNumber?: () => void;
  onVoiceChange?: (voiceId: string) => void;
  onToggleInbound?: (enabled: boolean) => void;
  onOpenKnowledgeBase?: () => void;
  onOpenConversationFlow?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export function TelephonySetup({
  phoneNumbers,
  selectedVoice,
  inboundEnabled,
  assistantName,
  onAssistantNameChange,
  onAssistantNameBlur,
  onBuyNumber,
  onVoiceChange,
  onToggleInbound,
  onOpenKnowledgeBase,
  onOpenConversationFlow,
}: TelephonySetupProps) {
  const [voiceDropdownOpen, setVoiceDropdownOpen] = useState(false);
  const activeVoice =
    voiceOptions.find((v) => v.id === selectedVoice) ?? voiceOptions[0];

  return (
    <div className="h-full overflow-y-auto workspace-scrollbar bg-surface">
      <div className="px-6 py-8 space-y-8">
        {/* ─── Step header ─── */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground mb-0.5">
            Telephony Setup
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Link a number to your AI agent and define its behavior.
          </p>
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
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
          />
          <p className="text-[11px] text-muted-foreground -mt-1">
            Displayed during connected calls in the simulator.
          </p>
        </section>

        {/* ─── Phone Number ─── */}
        <section className="space-y-3">
          <div className="flex justify-between items-baseline">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Selected Number
            </label>
            <button
              onClick={onBuyNumber}
              className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Buy New Number
            </button>
          </div>

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
                  <button className="p-1.5 rounded-lg hover:bg-surface-elevated transition-colors">
                    <HiOutlineEllipsisVertical className="size-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <button
              onClick={onBuyNumber}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background px-4 py-6 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              <HiOutlinePlusCircle className="size-5" />
              Add a phone number
            </button>
          )}
        </section>

        {/* ─── Voice Configuration ─── */}
        <section className="space-y-3">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Voice & Tone
          </label>

          <div className="relative">
            <button
              onClick={() => setVoiceDropdownOpen((o) => !o)}
              className="w-full flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3.5 text-[13px] font-medium text-foreground hover:bg-surface-elevated transition-colors"
            >
              <span>
                {activeVoice.label}{" "}
                <span className="text-muted-foreground">
                  — {activeVoice.style}
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
                {voiceOptions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      onVoiceChange?.(v.id);
                      setVoiceDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors hover:bg-surface-elevated ${
                      v.id === selectedVoice
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span>
                      {v.label}{" "}
                      <span className="text-muted-foreground/60">
                        — {v.style}
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
            Preview {activeVoice.label}
          </button>
        </section>

        {/* ─── Knowledge & Logic ─── */}
        <section className="space-y-3">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Agent Intelligence
          </label>

          <button
            onClick={onOpenKnowledgeBase}
            className="w-full flex items-center gap-3.5 rounded-2xl border border-border bg-background px-4 py-3.5 transition-all hover:border-border/80 hover:shadow-sm group text-left"
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

          <button
            onClick={onOpenConversationFlow}
            className="w-full flex items-center gap-3.5 rounded-2xl border border-border bg-background px-4 py-3.5 transition-all hover:border-border/80 hover:shadow-sm group text-left"
          >
            <div className="size-9 rounded-xl bg-surface-elevated flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
              <HiOutlineChatBubbleLeftRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-foreground">
                Conversation Flow
              </p>
              <p className="text-[11px] text-muted-foreground">
                Edit logic and responses
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
      </div>
    </div>
  );
}
