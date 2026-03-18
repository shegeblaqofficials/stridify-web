import {
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineEye,
  HiOutlineCloudArrowUp,
  HiOutlineUser,
  HiOutlineCpuChip,
  HiOutlineCheckCircle,
  HiOutlinePaperAirplane,
  HiOutlineSparkles,
  HiOutlineGlobeAlt,
  HiOutlineArrowTrendingUp,
  HiOutlineSignal,
} from "react-icons/hi2";
import Link from "next/link";

/* ──────────────────────────────────────────────
   Feature 1 Mockup – AI Chat Builder
   ────────────────────────────────────────────── */
function ChatBuilderMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="rounded-2xl border border-border bg-surface shadow-xl overflow-hidden">
        {/* Mini chat messages */}
        <div className="p-5 md:p-6 space-y-4">
          {/* User message */}
          <div className="flex gap-3 items-start">
            <div className="size-8 rounded-full bg-surface-elevated flex items-center justify-center shrink-0">
              <HiOutlineUser className="size-4 text-muted-foreground" />
            </div>
            <div className="bg-surface-elevated border border-border rounded-xl rounded-tl-none px-4 py-2.5 text-sm text-foreground leading-relaxed">
              Build a customer support agent for an e-commerce store that
              handles returns and order tracking.
            </div>
          </div>

          {/* System logs */}
          <div className="flex gap-3 items-start">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <HiOutlineCpuChip className="size-4 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                System Logs
              </p>
              <div className="flex items-center gap-2.5 text-xs">
                <HiOutlineCheckCircle className="size-4 text-green-500 shrink-0" />
                <span className="text-muted-foreground">
                  Generating voice pipeline...
                </span>
                <span className="ml-auto text-[10px] text-muted-foreground/60">
                  0.6s
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <HiOutlineCheckCircle className="size-4 text-green-500 shrink-0" />
                <span className="text-muted-foreground">
                  Configuring LLM context...
                </span>
                <span className="ml-auto text-[10px] text-muted-foreground/60">
                  1.2s
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <div className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                <span className="text-foreground font-medium">
                  Wiring API integrations...
                </span>
                <span className="ml-auto text-[10px] text-muted-foreground/60">
                  In progress
                </span>
              </div>
            </div>
          </div>

          {/* AI response */}
          <div className="flex gap-3 items-start">
            <div className="size-8 invisible shrink-0" />
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-foreground leading-relaxed">
              Your support agent is ready! It can handle return requests, track
              orders, and escalate to human agents.
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className="px-5 pb-5 md:px-6 md:pb-6">
          <div className="relative">
            <div className="w-full rounded-xl bg-surface-elevated border border-border px-4 py-3 text-sm text-muted-foreground">
              Describe the feature you want to build...
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
                <HiOutlinePaperAirplane className="size-3.5 text-primary-foreground" />
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
      <div className="rounded-2xl border border-border bg-surface shadow-xl overflow-hidden">
        {/* Browser chrome */}
        <div className="h-10 bg-surface-elevated border-b border-border flex items-center px-4 gap-3">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-danger/40" />
            <div className="size-2.5 rounded-full bg-accent/40" />
            <div className="size-2.5 rounded-full bg-secondary/40" />
          </div>
          <div className="flex-1 max-w-[220px] h-5 bg-background rounded-md px-2.5 flex items-center border border-border">
            <span className="text-[9px] text-muted-foreground">
              stridify.app/preview/travel-concierge
            </span>
          </div>
        </div>

        {/* App preview content — Travel Concierge Agent */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-foreground">
              Travel Concierge
            </h4>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="size-1.5 rounded-full bg-green-500" />
              <span className="text-[9px] font-semibold text-green-500">
                Live
              </span>
            </div>
          </div>

          {/* Voice visualizer */}
          <div className="flex items-center justify-center py-6">
            <div className="relative">
              <div className="size-20 rounded-full bg-primary/15 flex items-center justify-center">
                <div className="size-12 rounded-full bg-primary/30 flex items-center justify-center">
                  <div className="size-6 rounded-full bg-primary" />
                </div>
              </div>
              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping" />
            </div>
          </div>

          {/* Conversation preview */}
          <div className="space-y-2.5">
            <div className="bg-surface-elevated rounded-lg px-4 py-2.5 text-xs text-muted-foreground">
              <span className="text-foreground font-medium">User:</span>{" "}
              &ldquo;Find me a flight to Tokyo next week&rdquo;
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-2.5 text-xs text-muted-foreground">
              <span className="text-primary font-medium">Agent:</span> &ldquo;I
              found 3 flights to Tokyo. The best option departs Tuesday at 10:45
              AM for $847 — shall I book it?&rdquo;
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center">
              <p className="text-[11px] text-muted-foreground">Latency</p>
              <p className="text-sm font-bold text-foreground">120ms</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-muted-foreground">Sessions</p>
              <p className="text-sm font-bold text-foreground">2.4k</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-muted-foreground">Accuracy</p>
              <p className="text-sm font-bold text-foreground">98.7%</p>
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
      <div className="rounded-2xl border border-border bg-surface shadow-xl overflow-hidden">
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-foreground">Deployment</h4>
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              Production
            </span>
          </div>

          {/* Deploy options as cards */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-primary bg-primary/5">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <HiOutlineGlobeAlt className="size-4.5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">
                  Web Application
                </p>
                <p className="text-[10px] text-muted-foreground">
                  agent.stridify.app
                </p>
              </div>
              <HiOutlineCheckCircle className="size-5 text-primary" />
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border">
              <div className="size-9 rounded-lg bg-surface-elevated flex items-center justify-center">
                <HiOutlineSignal className="size-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">
                  API Endpoint
                </p>
                <p className="text-[10px] text-muted-foreground">
                  api.stridify.app/v1
                </p>
              </div>
              <div className="size-5 rounded-full border-2 border-border" />
            </div>
          </div>

          {/* Usage bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Scaling • Auto
              </span>
              <span className="text-[11px] font-semibold text-foreground">
                3 / 10 instances
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-elevated">
              <div className="h-full w-[30%] rounded-full bg-primary" />
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
              <p className="text-base font-bold text-foreground">99.99%</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-elevated">
              <div className="flex items-center gap-1.5 mb-1">
                <HiOutlineSignal className="size-3.5 text-primary" />
                <span className="text-[10px] text-muted-foreground">
                  Requests
                </span>
              </div>
              <p className="text-base font-bold text-foreground">1.2M/mo</p>
            </div>
          </div>

          {/* Deploy button */}
          <button className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
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
    icon: HiOutlineChatBubbleBottomCenterText,
    badge: "AI Builder",
    title: "Design with Natural Language",
    subtitle: "Prompt driven development",
    description:
      "Describe your voice agent in plain English. Stridify gets your intent, builds the conversation flow, and connects the logic with no code needed. Refine your agent instantly with follow-up prompts as you go.",
    cta: { label: "Start Building", href: "/beta-access" },
    mockup: ChatBuilderMockup,
    reverse: false,
    bg: "bg-section-alt",
  },
  {
    icon: HiOutlineEye,
    badge: "Live Preview",
    title: "See Changes Instantly",
    subtitle: "Realtime agent preview",
    description:
      "See your changes live as you build. Test voice interactions, conversation flows, and UI components side by side. No waiting, what you describe is what you get.",
    cta: { label: "Explore Templates", href: "/templates" },
    mockup: LivePreviewMockup,
    reverse: true,
    bg: "bg-section-muted",
  },
  {
    icon: HiOutlineCloudArrowUp,
    badge: "Deploy",
    title: "Ship to Production in One Click",
    subtitle: "Global infrastructure, zero config",
    description:
      "Deploy your agent as a web app, mobile PWA, or API endpoint. Stridify takes care of scaling, fast routing, and security, your agent goes from prototype to production in one click.",
    cta: { label: "View Pricing", href: "/pricing" },
    mockup: DeployMockup,
    reverse: false,
    bg: "bg-section-alt",
  },
];

/* ──────────────────────────────────────────────
   Section component
   ────────────────────────────────────────────── */
export function FeaturesSection() {
  return (
    <section id="features">
      {/* Section header */}
      <div className="px-6 py-24 pb-16 bg-background">
        <div data-aos="fade-up" className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-5">
            <HiOutlineSparkles className="size-3.5" />
            Platform
          </span>
          <h2 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
            Everything You Need to Build
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            A complete workspace to design, test, and deploy production ready
            live voice agents powered by AI.
          </p>
        </div>
      </div>

      {/* Feature blocks — each in its own full-width band */}
      {features.map((feature, i) => (
        <div key={feature.title} className={feature.bg}>
          <div
            data-aos="fade-up"
            data-aos-delay={String(i * 80)}
            className={`mx-auto max-w-7xl px-6 py-20 md:py-28 flex flex-col items-center gap-12 lg:gap-20 ${
              feature.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
            }`}
          >
            {/* Text content */}
            <div className="flex-1 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-5">
                <feature.icon className="size-4" />
                {feature.badge}
              </span>
              <h3 className="text-3xl font-black tracking-tight md:text-4xl lg:text-[2.75rem] leading-tight">
                {feature.title}
              </h3>
              <p className="mt-3 text-base md:text-lg font-medium text-primary">
                {feature.subtitle}
              </p>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-8">
                <Link
                  href={feature.cta.href}
                  className="inline-flex items-center justify-center gap-2 rounded-xl transition-all active:scale-[0.98] border border-border bg-surface text-muted-foreground hover:border-muted-foreground hover:text-foreground px-5 py-2.5 text-sm font-bold"
                >
                  {feature.cta.label}
                </Link>
              </div>
            </div>

            {/* Mockup */}
            <div className="flex-1 w-full max-w-lg">
              <feature.mockup />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
