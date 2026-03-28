"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/provider/account-provider";
import {
  HiOutlineGlobeAlt,
  HiOutlinePhone,
  HiOutlineCodeBracketSquare,
  HiOutlineChevronDown,
  HiOutlineArrowRight,
  HiOutlineCommandLine,
  HiOutlineSparkles,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import { createProject, getProjects } from "@/lib/project/actions";

const agentTypes = [
  { id: "web", label: "Web", icon: HiOutlineGlobeAlt },
  { id: "telephony", label: "Telephony", icon: HiOutlinePhone },
  { id: "widget", label: "Widget", icon: HiOutlineCodeBracketSquare },
] as const;

type AgentType = (typeof agentTypes)[number]["id"];

const visibilityOptions = [
  { id: "public", label: "Public", icon: HiOutlineGlobeAlt },
  { id: "private", label: "Private", icon: HiOutlineLockClosed },
] as const;

type Visibility = (typeof visibilityOptions)[number]["id"];

const quickPrompts = [
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

export default function DashboardHome() {
  const placeholder = useTypingPlaceholder(placeholderPhrases);
  const { account } = useAccount();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [agentType, setAgentType] = useState<AgentType>("web");
  const [typeOpen, setTypeOpen] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [visOpen, setVisOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const visDropdownRef = useRef<HTMLDivElement>(null);
  const [projectCount, setProjectCount] = useState<number | null>(null);

  useEffect(() => {
    if (!account) return;
    getProjects(account.organization_id).then((projects) =>
      setProjectCount(projects.length),
    );
  }, [account]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setTypeOpen(false);
      }
      if (
        visDropdownRef.current &&
        !visDropdownRef.current.contains(e.target as Node)
      ) {
        setVisOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGenerate = async () => {
    if (!account || isCreating) return;
    setIsCreating(true);
    try {
      const result = await createProject(
        account.organization_id,
        account.user_id,
        prompt.trim().slice(0, 80),
        agentType,
        prompt.trim(),
        visibility,
      );
      if (result) {
        router.push(`/projects/${result.project.project_id}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

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
            <div className="rounded-2xl border border-border bg-surface shadow-sm transition-shadow focus-within:shadow-md focus-within:border-foreground/20">
              <div className="p-4 sm:p-5">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-20 w-full resize-none bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none sm:h-24 sm:text-lg"
                  placeholder={placeholder + "│"}
                />
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3">
                  {/* Agent type dropdown */}
                  <div ref={dropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setTypeOpen(!typeOpen);
                        setVisOpen(false);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground"
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
                      <div className="absolute left-0 top-full z-10 mt-2 min-w-40 rounded-xl border border-border bg-surface shadow-lg">
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
                                "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors first:rounded-t-xl last:rounded-b-xl",
                                isActive
                                  ? "bg-foreground/5 text-foreground"
                                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                              ].join(" ")}
                            >
                              <Icon className="h-4 w-4" />
                              {type.label}
                              {isActive && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Visibility dropdown */}
                  <div ref={visDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setVisOpen(!visOpen);
                        setTypeOpen(false);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground"
                    >
                      {(() => {
                        const active = visibilityOptions.find(
                          (v) => v.id === visibility,
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
                        className={`h-3 w-3 transition-transform ${visOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {visOpen && (
                      <div className="absolute left-0 top-full z-10 mt-2 min-w-40 rounded-xl border border-border bg-surface shadow-lg">
                        {visibilityOptions.map((opt) => {
                          const Icon = opt.icon;
                          const isActive = visibility === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setVisibility(opt.id);
                                setVisOpen(false);
                              }}
                              className={[
                                "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors first:rounded-t-xl last:rounded-b-xl",
                                isActive
                                  ? "bg-foreground/5 text-foreground"
                                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                              ].join(" ")}
                            >
                              <Icon className="h-4 w-4" />
                              {opt.label}
                              {isActive && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  size="md"
                  className="gap-2 rounded-lg px-5"
                  onClick={handleGenerate}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    "Creating..."
                  ) : (
                    <>
                      Generate
                      <HiOutlineArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick prompts */}
          <div className="mb-8 flex flex-wrap justify-center gap-2 sm:mb-12">
            {quickPrompts.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setPrompt(item.value)}
                className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Bento cards */}
          <div className="grid grid-cols-12 gap-4">
            <div className="order-2 col-span-12 flex cursor-pointer flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-sm transition-colors hover:border-primary md:order-1 md:col-span-8">
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

            <div className="order-1 col-span-12 flex flex-col justify-between rounded-xl bg-primary p-6 text-primary-foreground shadow-sm md:order-2 md:col-span-4">
              <HiOutlineSparkles className="mb-4 h-6 w-6" />
              <div>
                <h3 className="mb-1 text-sm font-bold">Recent Projects</h3>
                <p className="text-[10px] opacity-80">
                  {projectCount !== null
                    ? `You have ${projectCount} active project${projectCount !== 1 ? "s" : ""}.`
                    : "Loading projects..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
