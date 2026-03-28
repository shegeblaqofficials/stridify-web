import {
  HiOutlineUser,
  HiOutlineCpuChip,
  HiOutlineCheckCircle,
  HiOutlinePaperAirplane,
  HiOutlineGlobeAlt,
  HiOutlineArrowTrendingUp,
  HiOutlineSignal,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import Link from "next/link";

/* ──────────────────────────────────────────────
   Feature 1 Mockup – AI Chat Builder
   ────────────────────────────────────────────── */
function ChatBuilderMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="p-5 md:p-6 space-y-4">
          {/* User message */}
          <div className="flex gap-3 items-start">
            <div className="size-7 rounded-full bg-surface-elevated flex items-center justify-center shrink-0">
              <HiOutlineUser className="size-3.5 text-muted-foreground" />
            </div>
            <div className="bg-surface-elevated rounded-xl rounded-tl-none px-4 py-2.5 text-sm text-foreground leading-relaxed">
              Build a customer support agent for an e-commerce store that
              handles returns and order tracking.
            </div>
          </div>

          {/* System logs */}
          <div className="flex gap-3 items-start">
            <div className="size-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <HiOutlineCpuChip className="size-3.5 text-accent" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Build Log
              </p>
              <div className="flex items-center gap-2.5 text-xs">
                <HiOutlineCheckCircle className="size-3.5 text-green-500 shrink-0" />
                <span className="text-muted-foreground">
                  Generating voice pipeline
                </span>
                <span className="ml-auto text-[10px] text-muted-foreground/50 font-mono">
                  0.6s
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <HiOutlineCheckCircle className="size-3.5 text-green-500 shrink-0" />
                <span className="text-muted-foreground">
                  Configuring LLM context
                </span>
                <span className="ml-auto text-[10px] text-muted-foreground/50 font-mono">
                  1.2s
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <div className="size-3.5 rounded-full border-2 border-foreground/30 border-t-transparent animate-spin shrink-0" />
                <span className="text-foreground font-medium">
                  Wiring integrations...
                </span>
              </div>
            </div>
          </div>

          {/* AI response */}
          <div className="flex gap-3 items-start">
            <div className="size-7 invisible shrink-0" />
            <div className="bg-accent/5 border border-accent/15 rounded-xl px-4 py-2.5 text-sm text-foreground leading-relaxed">
              Your support agent is ready. It handles returns, tracks orders,
              and escalates to human agents.
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className="px-5 pb-5 md:px-6 md:pb-6">
          <div className="relative">
            <div className="w-full rounded-xl bg-surface-elevated px-4 py-3 text-sm text-muted-foreground/50">
              Describe the feature you want to build...
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="size-7 rounded-lg bg-foreground flex items-center justify-center">
                <HiOutlinePaperAirplane className="size-3.5 text-background" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Feature 2 Mockup – Live Preview
   ────────────────────────────────────────────── */
function LivePreviewMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        {/* Browser chrome */}
        <div className="h-10 bg-surface-elevated border-b border-border flex items-center px-4 gap-3">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-muted-foreground/20" />
            <div className="size-2.5 rounded-full bg-muted-foreground/20" />
            <div className="size-2.5 rounded-full bg-muted-foreground/20" />
          </div>
          <div className="flex-1 max-w-55 h-6 bg-background rounded-md px-2.5 flex items-center border border-border">
            <span className="text-[9px] text-muted-foreground font-mono">
              stridify.app/travel-concierge
            </span>
          </div>
        </div>

        {/* App preview content */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">
              Travel Concierge
            </h4>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10">
              <div className="size-1.5 rounded-full bg-green-500" />
              <span className="text-[9px] font-medium text-green-600 dark:text-green-400">
                Live
              </span>
            </div>
          </div>

          {/* Voice visualizer */}
          <div className="flex items-center justify-center py-5">
            <div className="relative">
              <div className="size-16 rounded-full bg-foreground/5 flex items-center justify-center">
                <div className="size-10 rounded-full bg-foreground/10 flex items-center justify-center">
                  <div className="size-5 rounded-full bg-foreground" />
                </div>
              </div>
              <div className="absolute inset-0 rounded-full border border-foreground/10 animate-ping" />
            </div>
          </div>

          {/* Conversation preview */}
          <div className="space-y-2">
            <div className="bg-surface-elevated rounded-lg px-3.5 py-2.5 text-xs text-muted-foreground">
              <span className="text-foreground font-medium">User:</span>{" "}
              &ldquo;Find me a flight to Tokyo next week&rdquo;
            </div>
            <div className="bg-accent/5 border border-accent/10 rounded-lg px-3.5 py-2.5 text-xs text-muted-foreground">
              <span className="text-foreground font-medium">Agent:</span>{" "}
              &ldquo;Found 3 flights. Best option departs Tuesday at 10:45 AM
              for $847.&rdquo;
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Latency</p>
              <p className="text-sm font-semibold text-foreground font-mono">
                120ms
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Sessions</p>
              <p className="text-sm font-semibold text-foreground font-mono">
                2.4k
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Accuracy</p>
              <p className="text-sm font-semibold text-foreground font-mono">
                98.7%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Feature 3 Mockup – Deploy & Scale
   ────────────────────────────────────────────── */
function DeployMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">
              Deployment
            </h4>
            <span className="text-[10px] font-medium text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">
              Production
            </span>
          </div>

          {/* Deploy options as cards */}
          <div className="space-y-2">
            <div className="flex items-center gap-3.5 p-3 rounded-xl border border-foreground/15 bg-foreground/3">
              <div className="size-8 rounded-lg bg-foreground/5 flex items-center justify-center">
                <HiOutlineGlobeAlt className="size-4 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">
                  Web Application
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  agent.stridify.app
                </p>
              </div>
              <HiOutlineCheckCircle className="size-4.5 text-foreground" />
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl border border-border">
              <div className="size-8 rounded-lg bg-surface-elevated flex items-center justify-center">
                <HiOutlineSignal className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">
                  API Endpoint
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  api.stridify.app/v1
                </p>
              </div>
              <div className="size-4.5 rounded-full border-2 border-border" />
            </div>
          </div>

          {/* Usage bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Auto scaling
              </span>
              <span className="text-[10px] font-medium text-foreground font-mono">
                3 / 10
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-elevated">
              <div className="h-full w-[30%] rounded-full bg-foreground" />
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-surface-elevated">
              <div className="flex items-center gap-1.5 mb-1">
                <HiOutlineArrowTrendingUp className="size-3.5 text-green-500" />
                <span className="text-[10px] text-muted-foreground">
                  Uptime
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground font-mono">
                99.99%
              </p>
            </div>
            <div className="p-3 rounded-xl bg-surface-elevated">
              <div className="flex items-center gap-1.5 mb-1">
                <HiOutlineSignal className="size-3.5 text-accent" />
                <span className="text-[10px] text-muted-foreground">
                  Requests
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground font-mono">
                1.2M/mo
              </p>
            </div>
          </div>

          {/* Deploy button */}
          <button className="w-full py-2.5 rounded-xl bg-foreground text-background font-medium text-sm transition-colors hover:bg-foreground/90">
            Deploy Now
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Features data
   ────────────────────────────────────────────── */
const features = [
  {
    step: "01",
    title: "Describe your agent in plain English",
    description:
      "Write what your voice agent should do: handle support tickets, book appointments, answer product questions. Stridify understands intent, builds the conversation flow, and wires the logic automatically.",
    cta: { label: "Start building", href: "/discover" },
    mockup: ChatBuilderMockup,
    reverse: false,
  },
  {
    step: "02",
    title: "Preview and test in real time",
    description:
      "See your agent come alive as you build. Test voice interactions, conversation flows, and UI side by side. Every change renders instantly. What you describe is what you get.",
    cta: { label: "Explore templates", href: "/discover" },
    mockup: LivePreviewMockup,
    reverse: true,
  },
  {
    step: "03",
    title: "Deploy to production in one click",
    description:
      "Ship your agent as a web app, embeddable widget, or connect it to a phone number. Stridify handles infrastructure, scaling, and global routing. Zero configuration required.",
    cta: { label: "View pricing", href: "/pricing" },
    mockup: DeployMockup,
    reverse: false,
  },
];

/* ──────────────────────────────────────────────
   Section component
   ────────────────────────────────────────────── */
export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24 md:py-32">
      {/* Section header */}
      <div
        data-aos="fade-up"
        className="mx-auto max-w-3xl text-center mb-20 md:mb-28"
      >
        <p className="text-sm font-medium text-muted-foreground mb-4">
          How it works
        </p>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          From idea to live agent
          <br />
          <span className="text-muted-foreground">in three steps.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground leading-relaxed md:text-lg">
          A complete workspace to design, test, and deploy production ready
          voice agents. No backend setup, no complex integrations.
        </p>
      </div>

      {/* Feature blocks */}
      <div className="mx-auto max-w-6xl space-y-24 md:space-y-32">
        {features.map((feature, i) => (
          <div
            key={feature.step}
            data-aos="fade-up"
            data-aos-delay={String(i * 80)}
            className={`flex flex-col items-center gap-12 lg:gap-20 ${
              feature.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
            }`}
          >
            {/* Text content */}
            <div className="flex-1 max-w-lg">
              <span className="step-number text-sm font-medium text-muted-foreground/50 mb-4 block">
                {feature.step}
              </span>
              <h3 className="text-2xl font-bold tracking-tight md:text-3xl leading-tight">
                {feature.title}
              </h3>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
                {feature.description}
              </p>
              <div className="mt-6">
                <Link
                  href={feature.cta.href}
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  {feature.cta.label}
                  <HiOutlineArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* Mockup */}
            <div className="flex-1 w-full max-w-lg">
              <feature.mockup />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
