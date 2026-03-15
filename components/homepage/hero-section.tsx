"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAccount } from "@/provider/account-provider";
import { HiOutlineMicrophone } from "react-icons/hi2";
import { HiOutlinePaperClip } from "react-icons/hi2";
import { HiOutlineSparkles } from "react-icons/hi2";

const examplePrompts = [
  "Customer support voice agent",
  "Restaurant booking agent",
  "AI therapy companion",
];

const placeholderPhrases = [
  "Build a voice assistant that answers phone calls and schedules appointments",
  "Design an AI tutor that teaches languages and answers student questions",
  "Build a customer support voice agent that handles common inquiries",
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
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const handleGenerate = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (account && account.is_active === false) {
      window.location.href = "/beta-access";
      return;
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
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Just by Prompting.
          </span>
        </h1>

        {/* Sub-copy */}
        <p
          data-aos="fade-up"
          data-aos-delay="350"
          className="mx-auto mb-16 mt-8 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground md:text-xl"
        >
          Write a prompt and Stridify turns your idea into a live AI voice agent
          you can test, deploy, and use anywhere. Build for web, phone, or
          mobile.
        </p>

        {/* Prompt box */}
        <div
          data-aos="fade-up"
          data-aos-delay="500"
          className="relative mx-auto mb-12 max-w-3xl"
        >
          <div className="absolute -inset-1 rounded-2xl bg-primary/20 opacity-40 blur-xl" />
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-surface shadow-2xl shadow-primary/5">
            <div className="flex items-start gap-3 p-5">
              <HiOutlineSparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary/60" />
              <textarea
                className="h-24 w-full resize-none bg-transparent text-xl font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
                placeholder={placeholder + "│"}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="flex items-center justify-between border-t border-primary/10 bg-surface/80 p-4">
              <div className="flex gap-4 text-muted-foreground/60">
                <HiOutlineMicrophone className="h-5 w-5 cursor-pointer transition-colors hover:text-primary" />
                <HiOutlinePaperClip className="h-5 w-5 cursor-pointer transition-colors hover:text-primary" />
              </div>
              <Button size="lg" onClick={handleGenerate}>
                Generate App ⚡
              </Button>
            </div>
          </div>
        </div>

        {/* Suggestion pills */}
        <div
          data-aos="fade-up"
          data-aos-delay="650"
          className="flex flex-wrap justify-center gap-3"
        >
          {examplePrompts.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              className="rounded-full uppercase tracking-tight"
            >
              {prompt}
            </Button>
          ))}
        </div>
      </section>

      <AuthModal open={authOpen} onClose={closeAuth} />
    </>
  );
}
