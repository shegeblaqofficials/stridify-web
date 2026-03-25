"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAccount } from "@/provider/account-provider";
import { HiOutlineMicrophone } from "react-icons/hi2";
import { HiOutlinePaperClip } from "react-icons/hi2";
import { HiOutlineSparkles } from "react-icons/hi2";
import {
  HiOutlineGlobeAlt,
  HiOutlinePhone,
  HiOutlineCodeBracketSquare,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import { useRouter } from "next/navigation";
import { createProject, setPendingPrompt } from "@/lib/project/actions";

const agentTypes = [
  { id: "web", label: "Web", icon: HiOutlineGlobeAlt },
  { id: "telephony", label: "Telephony", icon: HiOutlinePhone },
  { id: "widget", label: "Widget", icon: HiOutlineCodeBracketSquare },
] as const;

type AgentType = (typeof agentTypes)[number]["id"];

const examplePrompts = [
  {
    label: "Customer Support Website",
    value:
      "Build a website with an embedded voice assistant that greets visitors, answers FAQs about orders, shipping, and returns, escalates complex issues to a human, and confirms resolution before ending the call.",
  },
  {
    label: "Restaurant Landing Page",
    value:
      "Create a landing page for a restaurant with a voice assistant that checks table availability, takes reservation details like party size and preferred time, handles dietary restrictions, and answers questions about the menu.",
  },
  {
    label: "Hotel Concierge Site",
    value:
      "Build a hotel website with a voice concierge that recommends local attractions, books restaurant reservations, arranges transportation, answers questions about amenities, and handles room service requests.",
  },
  {
    label: "SaaS Product Page",
    value:
      "Build a product landing page with a voice assistant that walks visitors through features, answers pricing questions, compares plans, and helps them sign up or book a demo.",
  },
  {
    label: "Real Estate Listing Site",
    value:
      "Create a real estate website with a voice assistant that helps visitors browse listings, filter by location and budget, schedule property tours, and answers questions about neighborhoods.",
  },
];

const placeholderPhrases = [
  "Build a website with a voice assistant that books appointments...",
  "Create a landing page with a voice agent for customer support...",
  "Build a product page with a voice assistant that answers FAQs...",
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

export function HeroSection() {
  const placeholder = useTypingPlaceholder(placeholderPhrases);
  const { account, user } = useAccount();
  const [authOpen, setAuthOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [agentType, setAgentType] = useState<AgentType>("web");
  const [typeOpen, setTypeOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const closeAuth = useCallback(() => setAuthOpen(false), []);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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

  const handleGenerate = async () => {
    if (!user) {
      if (prompt.trim()) {
        await setPendingPrompt(prompt.trim(), agentType);
      }
      setAuthOpen(true);
      return;
    }
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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <>
      <section className="relative mx-auto max-w-5xl px-6 pb-20 pt-24 text-center">
        {/* Badge */}
        <div
          data-aos="fade-down"
          data-aos-delay="100"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface/50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Next-Gen Voice Infrastructure
        </div>

        {/* Headline */}
        <h1
          data-aos="fade-up"
          data-aos-delay="200"
          className="text-6xl font-black leading-[0.9] tracking-tight md:text-8xl"
        >
          Build Voice Apps
          <br />
          <span className="bg-gradient-to-r from-muted-foreground/50 via-muted-foreground/50 to-muted-foreground/50 bg-clip-text text-transparent">
            Just by Prompting.
          </span>
        </h1>

        {/* Sub-copy */}
        <p
          data-aos="fade-up"
          data-aos-delay="350"
          className="mx-auto mb-16 mt-8 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground md:text-xl"
        >
          Write a prompt and turn your idea into a live AI voice agent you can
          test, deploy, and use anywhere. Build for web or telephony in seconds.
        </p>

        {/* Prompt box */}
        <div
          data-aos="fade-up"
          data-aos-delay="500"
          className="relative mx-auto mb-12 max-w-3xl z-10"
        >
          <div className="absolute -inset-1 rounded-2xl bg-primary/20 opacity-40 blur-xl" />
          <div className="relative rounded-2xl border border-primary/20 bg-surface shadow-2xl shadow-primary/5">
            <div className="flex items-start gap-3 p-5">
              <HiOutlineSparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary/60" />
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-20 w-full resize-none bg-transparent text-xl font-medium text-foreground placeholder:text-muted-foreground focus:outline-none sm:h-28"
                placeholder={placeholder + "│"}
                onKeyDown={handleKeyDown}
              />
            </div>
            {/* Toolbar */}
            <div className="flex items-center justify-between border-t border-primary/10 p-4">
              <div className="flex items-center gap-4 text-muted-foreground/60">
                <HiOutlineMicrophone className="h-5 w-5 cursor-pointer transition-colors hover:text-primary" />
                <HiOutlinePaperClip className="h-5 w-5 cursor-pointer transition-colors hover:text-primary" />

                {/* Agent type dropdown */}
                <div ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setTypeOpen(!typeOpen)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated/50 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:border-muted-foreground/40 hover:text-foreground"
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
                    <div className="absolute left-0 top-full z-10 mt-2 min-w-[160px] rounded-xl border border-border bg-surface shadow-xl">
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
                              "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold transition-colors",
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
                size="lg"
                className="px-4 py-2 text-xs sm:px-10 sm:py-3.5 sm:text-sm"
                onClick={handleGenerate}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Generate App ⚡"}
              </Button>
            </div>
          </div>
        </div>

        {/* Suggestion pills */}
        <div
          data-aos="fade-up"
          data-aos-delay="650"
          className="mx-auto flex max-w-xl flex-wrap justify-center gap-2 sm:gap-3"
        >
          {examplePrompts.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPrompt(p.value)}
              className="rounded-full border border-primary/20 bg-surface px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground transition-all hover:border-primary hover:text-foreground sm:px-5 sm:py-2 sm:text-[10px] sm:font-bold sm:tracking-widest"
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <AuthModal open={authOpen} onClose={closeAuth} />
    </>
  );
}
