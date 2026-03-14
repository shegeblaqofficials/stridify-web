"use client";

import { Button } from "@/components/ui/button";
import { HiOutlineMicrophone } from "react-icons/hi2";
import { HiOutlinePaperClip } from "react-icons/hi2";
import { HiOutlineSparkles } from "react-icons/hi2";

const examplePrompts = [
  "Customer support voice bot",
  "Restaurant booking agent",
  "AI therapy companion",
];

export function HeroSection() {
  return (
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
        <span className="text-muted-foreground">Just by Prompting.</span>
      </h1>

      {/* Sub-copy */}
      <p
        data-aos="fade-up"
        data-aos-delay="350"
        className="mx-auto mb-16 mt-8 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground md:text-xl"
      >
        Deploy low-latency conversational agents in seconds. Describe your
        workflow, and we handle the LLM orchestration and voice streaming.
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
              placeholder="Create a voice assistant that books restaurant reservations…"
            />
          </div>
          <div className="flex items-center justify-between border-t border-primary/10 bg-surface/80 p-4">
            <div className="flex gap-4 text-muted-foreground/60">
              <HiOutlineMicrophone className="h-5 w-5 cursor-pointer transition-colors hover:text-primary" />
              <HiOutlinePaperClip className="h-5 w-5 cursor-pointer transition-colors hover:text-primary" />
            </div>
            <Button size="lg">Generate App ⚡</Button>
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
  );
}
