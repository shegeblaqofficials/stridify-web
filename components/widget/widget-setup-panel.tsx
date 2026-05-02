"use client";

import { useEffect, useRef, useState } from "react";
import {
  HiOutlineBookOpen,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
  HiOutlineCheckCircle,
  HiOutlineSignal,
} from "react-icons/hi2";
import type { WidgetProject } from "@/model/project/widget-project";
import {
  updateWidgetProject,
  updateProjectPrompt,
  type Voice,
} from "@/lib/project/actions";

interface WidgetSetupPanelProps {
  projectId: string;
  organizationId: string;
  voices: Voice[];
  widget: WidgetProject;
  systemPrompt: string;
  onOpenKnowledgeBase: () => void;
  onWidgetChange?: (next: WidgetProject) => void;
}

export function WidgetSetupPanel({
  projectId,
  organizationId,
  voices,
  widget,
  systemPrompt,
  onOpenKnowledgeBase,
  onWidgetChange,
}: WidgetSetupPanelProps) {
  const [agentName, setAgentName] = useState(widget.agent_name);
  const [companyName, setCompanyName] = useState(widget.company_name);
  const [triggerLabel, setTriggerLabel] = useState(widget.trigger_label);
  const [voiceId, setVoiceId] = useState(
    widget.agent_voice || voices[0]?.id || "",
  );
  const [voiceOpen, setVoiceOpen] = useState(false);

  const [prompt, setPrompt] = useState(systemPrompt);
  useEffect(() => setPrompt(systemPrompt), [systemPrompt]);

  const [savedAt, setSavedAt] = useState<number | null>(null);
  useEffect(() => {
    if (savedAt === null) return;
    const t = setTimeout(() => setSavedAt(null), 1500);
    return () => clearTimeout(t);
  }, [savedAt]);

  const flashSaved = () => setSavedAt(Date.now());

  const persistWidget = async (
    fields: Parameters<typeof updateWidgetProject>[0],
  ) => {
    const next = await updateWidgetProject(fields);
    if (next) {
      onWidgetChange?.(next);
      flashSaved();
    }
  };

  const persistPrompt = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || trimmed === systemPrompt.trim()) return;
    const res = await updateProjectPrompt(projectId, organizationId, trimmed);
    if (res) flashSaved();
  };

  const activeVoice = voices.find((v) => v.id === voiceId) ?? voices[0];

  const voiceRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!voiceOpen) return;
    const handler = (e: MouseEvent) => {
      if (voiceRef.current && !voiceRef.current.contains(e.target as Node)) {
        setVoiceOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [voiceOpen]);

  return (
    <div className="h-full w-full overflow-y-auto workspace-scrollbar bg-surface">
      <div className="p-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground mb-0.5">
              Widget Setup
            </h1>
            <p className="text-[13px] text-muted-foreground">
              Configure how the embedded voice agent looks and speaks.
            </p>
          </div>
          {savedAt !== null && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground animate-in fade-in duration-150 mt-1.5">
              <HiOutlineCheckCircle className="size-3.5 text-emerald-500" />
              Saved
            </span>
          )}
        </div>

        <section className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Agent Name
          </label>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            onBlur={() => {
              const trimmed = agentName.trim() || "Voice Assistant";
              setAgentName(trimmed);
              if (trimmed !== widget.agent_name)
                persistWidget({ projectId, agentName: trimmed });
            }}
            placeholder="Voice Assistant"
            className={inputClass}
          />
          <p className="text-[11px] text-muted-foreground -mt-1">
            Shown to visitors during the live conversation.
          </p>
        </section>

        <section className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Trigger Button Label
          </label>
          <input
            type="text"
            value={triggerLabel}
            onChange={(e) => setTriggerLabel(e.target.value)}
            onBlur={() => {
              const trimmed = triggerLabel.trim() || "Talk to us";
              setTriggerLabel(trimmed);
              if (trimmed !== widget.trigger_label)
                persistWidget({ projectId, triggerLabel: trimmed });
            }}
            placeholder="Talk to us"
            className={inputClass}
          />
          <p className="text-[11px] text-muted-foreground -mt-1">
            Text shown on the floating popup trigger.
          </p>
        </section>

        <section className="space-y-4">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Company Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            onBlur={() => {
              const trimmed = companyName.trim() || "Stridify";
              setCompanyName(trimmed);
              if (trimmed !== widget.company_name)
                persistWidget({ projectId, companyName: trimmed });
            }}
            placeholder="Stridify"
            className={inputClass}
          />
        </section>

        <section className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Voice & Tone
          </label>
          <div ref={voiceRef} className="relative mt-2">
            <button
              onClick={() => setVoiceOpen((o) => !o)}
              className="w-full flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3.5 text-[13px] font-medium text-foreground hover:bg-surface-elevated transition-colors"
            >
              <span>
                {activeVoice?.name}{" "}
                <span className="text-muted-foreground">
                  — {activeVoice?.description}
                </span>
              </span>
              <HiOutlineChevronDown
                className={`size-4 text-muted-foreground transition-transform ${voiceOpen ? "rotate-180" : ""}`}
              />
            </button>
            {voiceOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-full rounded-xl border border-border bg-surface shadow-xl z-20 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {voices.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setVoiceId(v.id);
                      setVoiceOpen(false);
                      if (v.id !== widget.agent_voice)
                        persistWidget({ projectId, agentVoice: v.id });
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors hover:bg-surface-elevated ${
                      v.id === voiceId
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
                    {v.id === voiceId && (
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

        <section className="space-y-4">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            System Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onBlur={persistPrompt}
            rows={10}
            placeholder="Instructions that drive your agent's persona, tone, and scope…"
            className="w-full rounded-xl border border-border bg-background mt-2 px-4 py-3 text-[12.5px] leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors resize-y workspace-scrollbar font-sans"
          />
          <p className="text-[11px] text-muted-foreground -mt-1">
            Auto-generated from your description. Edit to refine.
          </p>
        </section>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-background mt-2 px-4 py-3 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors";
