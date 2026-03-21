"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/provider/account-provider";
import { HiOutlineMicrophone, HiOutlinePaperClip } from "react-icons/hi2";
import {
  HiOutlineSparkles,
  HiOutlineGlobeAlt,
  HiOutlinePhone,
  HiOutlineCodeBracketSquare,
  HiOutlineDevicePhoneMobile,
  HiOutlineChevronDown,
  HiOutlineBolt,
  HiOutlineArrowRight,
  HiOutlineCommandLine,
} from "react-icons/hi2";
import { createProject } from "@/lib/project/actions";

const agentTypes = [
  { id: "web", label: "Web", icon: HiOutlineGlobeAlt },
  { id: "telephony", label: "Telephony", icon: HiOutlinePhone },
  { id: "widget", label: "Widget", icon: HiOutlineCodeBracketSquare },
  { id: "mobile", label: "Mobile", icon: HiOutlineDevicePhoneMobile },
] as const;

type AgentType = (typeof agentTypes)[number]["id"];

const quickPrompts = [
  "Customer Support Bot",
  "Restaurant Assistant",
  "AI Concierge",
  "Sales Closer",
];

const placeholderPhrases = [
  "Create a voice assistant that books restaurant reservations...",
  "Build a customer support agent that handles returns...",
  "Design a scheduling assistant for appointments...",
];

function useTypingPlaceholder(
  phrases: string[],
  typingSpeed = 60,
  deletingSpeed = 30,
  pauseMs = 2000,
) {
  const [text, setText] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    let charIndex = 0;
    let isDeleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = phrases[indexRef.current];
      if (!isDeleting) {
        charIndex++;
        setText(current.slice(0, charIndex));
        if (charIndex === current.length) {
          isDeleting = true;
          timeout = setTimeout(tick, pauseMs);
          return;
        }
        timeout = setTimeout(tick, typingSpeed);
      } else {
        charIndex--;
        setText(current.slice(0, charIndex));
        if (charIndex === 0) {
          isDeleting = false;
          indexRef.current = (indexRef.current + 1) % phrases.length;
          timeout = setTimeout(tick, 400);
          return;
        }
        timeout = setTimeout(tick, deletingSpeed);
      }
    };

    timeout = setTimeout(tick, 500);
    return () => clearTimeout(timeout);
  }, [phrases, typingSpeed, deletingSpeed, pauseMs]);

  return text;
}

export default function DashboardHome() {
  const placeholder = useTypingPlaceholder(placeholderPhrases);
  const { account } = useAccount();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [agentType, setAgentType] = useState<AgentType>("web");
  const [typeOpen, setTypeOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setTypeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || !account || isCreating) return;
    setIsCreating(true);
    try {
      const result = await createProject(
        account.organization_id,
        account.user_id,
        prompt.trim().slice(0, 80),
        agentType,
        prompt.trim(),
      );
      if (result) {
        router.push(`/projects/${result.project.project_id}`);
      }
    } finally {
      setIsCreating(false);
    }
  }, [account, router, prompt, agentType, isCreating]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Main content centered */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-3xl">
          {/* Heading */}
          <h2 className="mb-10 text-center text-5xl font-black tracking-tight">
            What are we building today?
          </h2>

          {/* Prompt input */}
          <div className="relative mx-auto mb-10 max-w-3xl">
            <div className="absolute -inset-0.5 rounded-2xl bg-primary/10 opacity-30 blur-xl" />
            <div className="relative rounded-2xl border border-border bg-surface shadow-xl shadow-black/2">
              <div className="flex items-start gap-2 p-3 sm:gap-3 sm:p-5">
                <HiOutlineSparkles className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40 sm:h-5 sm:w-5" />
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-20 w-full resize-none bg-transparent text-base font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none sm:h-28 sm:text-xl"
                  placeholder={placeholder + "│"}
                />
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between rounded-b-2xl border-t border-border/50 bg-surface-elevated/30 p-2.5 sm:p-4">
                <div className="flex items-center gap-4 text-muted-foreground/50">
                  <HiOutlineMicrophone className="h-5 w-5 cursor-pointer transition-colors hover:text-foreground" />
                  <HiOutlinePaperClip className="h-5 w-5 cursor-pointer transition-colors hover:text-foreground" />

                  {/* Agent type dropdown */}
                  <div ref={dropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setTypeOpen(!typeOpen)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface/50 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:border-muted-foreground/40 hover:text-foreground"
                    >
                      {(() => {
                        const active = agentTypes.find(
                          (t) => t.id === agentType,
                        )!;
                        const ActiveIcon = active.icon;
                        return (
                          <>
                            <ActiveIcon className="h-3.5 w-3.5" />
                            {active.label}
                          </>
                        );
                      })()}
                      <HiOutlineChevronDown
                        className={`h-3 w-3 transition-transform ${typeOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {typeOpen && (
                      <div className="absolute left-0 top-full z-10 mt-2 min-w-40 rounded-xl border border-border bg-surface shadow-xl">
                        {agentTypes.map((type) => {
                          const Icon = type.icon;
                          const isActive = agentType === type.id;
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => {
                                setAgentType(type.id);
                                setTypeOpen(false);
                              }}
                              className={[
                                "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold transition-colors first:rounded-t-xl last:rounded-b-xl",
                                isActive
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground",
                              ].join(" ")}
                            >
                              <Icon className="h-4 w-4" />
                              {type.label}
                              {isActive && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  size="sm"
                  className="sm:px-10 sm:py-3.5 sm:text-sm"
                  onClick={handleGenerate}
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Generate App"}
                  {!isCreating && <HiOutlineBolt className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick prompts */}
          <div className="mb-12 flex flex-wrap justify-center gap-3">
            {quickPrompts.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setPrompt(label)}
                className="rounded-full border border-border bg-surface px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Bento cards */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 flex cursor-pointer flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-sm transition-colors hover:border-primary md:col-span-8">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <HiOutlineCommandLine className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-bold">Voice Synthesis Engine</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Configure ultra-low latency models for real-time natural
                  conversation.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-foreground">
                View Documentation
                <HiOutlineArrowRight className="h-3 w-3" />
              </div>
            </div>

            <div className="col-span-12 flex flex-col justify-between rounded-xl bg-primary p-6 text-primary-foreground shadow-sm md:col-span-4">
              <HiOutlineSparkles className="mb-4 h-6 w-6" />
              <div>
                <h3 className="mb-1 text-sm font-bold">Recent Projects</h3>
                <p className="text-[10px] opacity-80">
                  You have 12 active deployments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
