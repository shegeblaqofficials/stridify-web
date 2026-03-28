"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAccount } from "@/provider/account-provider";
import {
  HiOutlineGlobeAlt,
  HiOutlinePhone,
  HiOutlineCodeBracketSquare,
  HiOutlineChevronDown,
  HiOutlineArrowRight,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import { useRouter } from "next/navigation";
import { createProject, setPendingPrompt } from "@/lib/project/actions";

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

const examplePrompts = [
  {
    label: "Customer Support",
    value:
      "Build a website with an embedded voice assistant that greets visitors, answers FAQs about orders, shipping, and returns, escalates complex issues to a human, and confirms resolution before ending the call.",
  },
  {
    label: "Restaurant Booking",
    value:
      "Create a landing page for a restaurant with a voice assistant that checks table availability, takes reservation details like party size and preferred time, handles dietary restrictions, and answers questions about the menu.",
  },
  {
    label: "Hotel Concierge",
    value:
      "Build a hotel website with a voice concierge that recommends local attractions, books restaurant reservations, arranges transportation, answers questions about amenities, and handles room service requests.",
  },
  {
    label: "SaaS Demo",
    value:
      "Build a product landing page with a voice assistant that walks visitors through features, answers pricing questions, compares plans, and helps them sign up or book a demo.",
  },
  {
    label: "Real Estate",
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
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [visOpen, setVisOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const closeAuth = useCallback(() => setAuthOpen(false), []);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const visDropdownRef = useRef<HTMLDivElement>(null);

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
    if (!user) {
      if (prompt.trim()) {
        await setPendingPrompt(prompt.trim(), agentType, visibility);
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <>
      <section className="relative overflow-hidden">
        {/* Background gradient mesh */}
        <div className="hero-gradient" />
        <div
          className="absolute inset-0 grid-pattern"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 40%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 40%, transparent 100%)",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-28 text-center sm:pt-36 sm:pb-32">
          {/* Badge */}
          <div
            data-aos="fade-down"
            data-aos-delay="100"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-[11px] font-medium text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Now in Beta. Start building for free
          </div>

          {/* Headline */}
          <h1
            data-aos="fade-up"
            data-aos-delay="200"
            className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.08] tracking-tight"
          >
            Build voice apps,
            <br />
            <span className="text-muted-foreground">ship with one prompt.</span>
          </h1>

          {/* Sub-copy */}
          <p
            data-aos="fade-up"
            data-aos-delay="350"
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Describe your AI voice agent in your own words. Stridify builds,
            tests, and deploys it to web, telephony, or widget in seconds.
          </p>

          {/* Prompt box */}
          <div
            data-aos="fade-up"
            data-aos-delay="500"
            className="relative z-10 mx-auto mt-12 max-w-2xl"
          >
            <div className="rounded-2xl border border-border bg-surface shadow-sm transition-shadow focus-within:shadow-md focus-within:border-foreground/20">
              <div className="p-4 sm:p-5">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="h-20 w-full resize-none bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none sm:h-24 sm:text-lg"
                  placeholder={placeholder + "│"}
                  onKeyDown={handleKeyDown}
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

          {/* Suggestion pills */}
          <div
            data-aos="fade-up"
            data-aos-delay="650"
            className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2"
          >
            {examplePrompts.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPrompt(p.value)}
                className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <AuthModal open={authOpen} onClose={closeAuth} />
    </>
  );
}
