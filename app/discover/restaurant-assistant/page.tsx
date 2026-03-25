"use client";

import {
  HiOutlinePhone,
  HiOutlineCalendarDays,
  HiOutlineChatBubbleLeftRight,
  HiOutlineClock,
  HiOutlineMicrophone,
  HiOutlineXMark,
} from "react-icons/hi2";
import {
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineComputerDesktop,
} from "react-icons/hi2";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ui/theme-provider";
import {
  useSession,
  SessionProvider,
  useAgent,
  RoomAudioRenderer,
  BarVisualizer,
} from "@livekit/components-react";
import { TokenSource } from "livekit-client";

/* ------------------------------------------------------------------ */
/*  Color tokens — hardcoded per-template, NOT using app theme vars   */
/* ------------------------------------------------------------------ */

const L = {
  bg: "#f9f9f7",
  surface: "#ffffff",
  surfaceHigh: "#f2f4f2",
  surfaceAlt: "#ecefec",
  primary: "#715a3e",
  primaryMuted: "rgba(113,90,62,0.08)",
  primaryContainer: "#fdddb9",
  text: "#2d3432",
  textSecondary: "#5a605e",
  textTertiary: "#767c79",
  border: "#dee4e0",
  cardShadow: "0 12px 40px rgba(113,90,62,0.10)",
  ctaShadow: "0 12px 40px rgba(113,90,62,0.15)",
  ornamentA: "rgba(253,221,185,0.10)",
  ornamentB: "rgba(244,223,203,0.10)",
};

const D = {
  bg: "#111210",
  surface: "#1a1c1b",
  surfaceHigh: "#222524",
  surfaceAlt: "#2a2d2c",
  primary: "#eecfac",
  primaryMuted: "rgba(238,207,172,0.10)",
  primaryContainer: "#644f33",
  text: "#e8eae8",
  textSecondary: "#adb3b0",
  textTertiary: "#8a8f8d",
  border: "#2e3230",
  cardShadow: "0 12px 40px rgba(0,0,0,0.25)",
  ctaShadow: "0 12px 40px rgba(238,207,172,0.12)",
  ornamentA: "rgba(238,207,172,0.04)",
  ornamentB: "rgba(100,79,51,0.06)",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function RestaurantAssistantPage() {
  return (
    <div className="ra-page">
      {/* Scoped CSS custom properties for light/dark */}
      <style>{`
        .ra-page {
          --ra-bg: ${L.bg};
          --ra-surface: ${L.surface};
          --ra-surface-high: ${L.surfaceHigh};
          --ra-surface-alt: ${L.surfaceAlt};
          --ra-primary: ${L.primary};
          --ra-primary-muted: ${L.primaryMuted};
          --ra-primary-container: ${L.primaryContainer};
          --ra-text: ${L.text};
          --ra-text-secondary: ${L.textSecondary};
          --ra-text-tertiary: ${L.textTertiary};
          --ra-border: ${L.border};
          --ra-card-shadow: ${L.cardShadow};
          --ra-cta-shadow: ${L.ctaShadow};
          --ra-ornament-a: ${L.ornamentA};
          --ra-ornament-b: ${L.ornamentB};
          background: var(--ra-bg);
          color: var(--ra-text);
          min-height: 100vh;
          font-family: 'Manrope', 'Inter', system-ui, sans-serif;
        }
        .dark .ra-page {
          --ra-bg: ${D.bg};
          --ra-surface: ${D.surface};
          --ra-surface-high: ${D.surfaceHigh};
          --ra-surface-alt: ${D.surfaceAlt};
          --ra-primary: ${D.primary};
          --ra-primary-muted: ${D.primaryMuted};
          --ra-primary-container: ${D.primaryContainer};
          --ra-text: ${D.text};
          --ra-text-secondary: ${D.textSecondary};
          --ra-text-tertiary: ${D.textTertiary};
          --ra-border: ${D.border};
          --ra-card-shadow: ${D.cardShadow};
          --ra-cta-shadow: ${D.ctaShadow};
          --ra-ornament-a: ${D.ornamentA};
          --ra-ornament-b: ${D.ornamentB};
        }
        .ra-page * { box-sizing: border-box; }
        .ra-serif { font-family: 'Georgia', 'Noto Serif', 'Times New Roman', serif; }
        .ra-cta-btn {
          background: var(--ra-primary);
          color: var(--ra-bg);
          box-shadow: var(--ra-cta-shadow);
        }
        .ra-cta-btn:hover { transform: scale(0.98); }
        .dark .ra-cta-btn {
          background: var(--ra-primary-container);
          color: var(--ra-primary);
        }
        @keyframes ra-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .ra-float { animation: ra-float 6s ease-in-out infinite; }
        @keyframes ra-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ra-fade-up { animation: ra-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .ra-fade-up-delay-1 { animation-delay: 0.15s; opacity: 0; }
        .ra-fade-up-delay-2 { animation-delay: 0.3s; opacity: 0; }
        .ra-fade-up-delay-3 { animation-delay: 0.45s; opacity: 0; }
        .ra-fade-up-delay-4 { animation-delay: 0.6s; opacity: 0; }
        .ra-divider {
          width: 48px;
          height: 1px;
          background: var(--ra-primary);
          opacity: 0.3;
        }
        .ra-feature-card {
          background: var(--ra-surface);
          border: 1px solid var(--ra-border);
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          transition: all 0.3s ease;
        }
        .ra-feature-card:hover {
          box-shadow: var(--ra-card-shadow);
          transform: translateY(-2px);
        }
      `}</style>

      {/* ---- Background Ornaments ---- */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full"
          style={{
            background: "var(--ra-ornament-a)",
            filter: "blur(120px)",
          }}
        />
        <div
          className="absolute -bottom-[5%] -left-[5%] w-[30%] h-[30%] rounded-full"
          style={{
            background: "var(--ra-ornament-b)",
            filter: "blur(100px)",
          }}
        />
      </div>

      {/* ---- Header ---- */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-6">
        <div className="flex items-center justify-between">
          <h2
            className="ra-serif text-xl sm:text-2xl font-bold tracking-tight"
            style={{ color: "var(--ra-text)" }}
          >
            Maison Pure
          </h2>
          <RaThemeSwitcher />
        </div>
      </header>

      {/* ---- Main Canvas ---- */}
      <main className="grow flex items-center justify-center px-6 py-16 sm:py-24 lg:py-32 min-h-[calc(100vh-180px)]">
        <div className="max-w-2xl w-full text-center space-y-12 sm:space-y-14">
          {/* Branding */}
          <div className="space-y-6 ra-fade-up">
            <h1
              className="ra-serif text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-bold tracking-tighter leading-none"
              style={{ color: "var(--ra-text)" }}
            >
              Maison Pure
            </h1>
            <div className="ra-divider mx-auto" />
          </div>

          {/* Description */}
          <div className="space-y-6 ra-fade-up ra-fade-up-delay-1">
            <p
              className="text-lg sm:text-xl md:text-2xl leading-relaxed max-w-xl mx-auto"
              style={{ color: "var(--ra-text-secondary)" }}
            >
              Looking to book a table or ask about our menu? Call the number
              below and our AI assistant will help you instantly.
            </p>
          </div>

          {/* CTA */}
          <div className="pt-2 ra-fade-up ra-fade-up-delay-2">
            <a
              href="tel:+15557821145"
              className="ra-cta-btn inline-flex flex-col items-center justify-center px-10 sm:px-14 py-6 sm:py-7 rounded-2xl transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-1.5">
                <HiOutlinePhone className="w-5 h-5" />
                <span className="text-base sm:text-lg font-bold tracking-wide">
                  Call to Book or Ask
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-semibold tracking-widest opacity-80">
                +1 (555) 782-1145
              </span>
            </a>
          </div>

          {/* Voice Agent */}
          <RaVoiceCard />

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 ra-fade-up ra-fade-up-delay-3">
            {[
              {
                icon: HiOutlineCalendarDays,
                title: "Instant Booking",
                desc: "Reserve your table in seconds",
              },
              {
                icon: HiOutlineChatBubbleLeftRight,
                title: "Menu Guidance",
                desc: "Ask about dishes & pairings",
              },
              {
                icon: HiOutlineClock,
                title: "24/7 Available",
                desc: "Our AI host never sleeps",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="ra-feature-card rounded-2xl p-5 sm:p-6 text-center"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{
                    background: "var(--ra-primary-muted)",
                    color: "var(--ra-primary)",
                  }}
                >
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3
                  className="text-sm font-bold mb-1"
                  style={{ color: "var(--ra-text)" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-xs"
                  style={{ color: "var(--ra-text-tertiary)" }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ---- Footer ---- */}
      <footer className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p
            className="text-sm tracking-wide"
            style={{
              color:
                "color-mix(in srgb, var(--ra-text-tertiary) 70%, transparent)",
            }}
          >
            &copy; 2024 Mia Editorial Dining AI. Built for the composed table.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm transition-colors duration-200 hover:opacity-70"
                style={{
                  color:
                    "color-mix(in srgb, var(--ra-text-tertiary) 70%, transparent)",
                }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LiveKit Voice Card                                                 */
/* ------------------------------------------------------------------ */

const raTokenSource = TokenSource.endpoint(
  "/api/livekit/token?template=restaurant-assistant",
);

function RaVoiceCard() {
  const [isActive, setIsActive] = useState(false);

  if (!isActive) {
    return <RaIdleVoiceCard onStart={() => setIsActive(true)} />;
  }

  return <RaActiveVoiceSession onEnd={() => setIsActive(false)} />;
}

function RaIdleVoiceCard({ onStart }: { onStart: () => void }) {
  return (
    <div className="pt-4 ra-fade-up ra-fade-up-delay-2">
      <button
        onClick={onStart}
        className="inline-flex flex-col items-center justify-center gap-3 px-10 sm:px-14 py-6 sm:py-7 rounded-2xl border transition-all duration-300 hover:scale-[1.02]"
        style={{
          background: "var(--ra-surface)",
          borderColor: "var(--ra-border)",
          boxShadow: "var(--ra-card-shadow)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "var(--ra-primary-muted)",
              color: "var(--ra-primary)",
            }}
          >
            <HiOutlineMicrophone className="w-5 h-5" />
          </div>
          <span
            className="text-base sm:text-lg font-bold tracking-wide"
            style={{ color: "var(--ra-text)" }}
          >
            Talk to AI Assistant
          </span>
        </div>
        <span className="text-sm" style={{ color: "var(--ra-text-tertiary)" }}>
          Tap to start a voice conversation with Sofia
        </span>
      </button>
    </div>
  );
}

function RaActiveVoiceSession({ onEnd }: { onEnd: () => void }) {
  const session = useSession(raTokenSource);
  const started = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    session.start();
    return () => {
      session.end();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SessionProvider session={session}>
      <RaActiveVoiceInner onEnd={onEnd} secondsLeft={secondsLeft} />
      <RoomAudioRenderer />
    </SessionProvider>
  );
}

function RaActiveVoiceInner({
  onEnd,
  secondsLeft,
}: {
  onEnd: () => void;
  secondsLeft: number;
}) {
  const agent = useAgent();

  const statusText =
    agent.state === "listening"
      ? "Listening..."
      : agent.state === "thinking"
        ? "Thinking..."
        : agent.state === "speaking"
          ? "Sofia is speaking..."
          : "Connecting to Sofia...";

  return (
    <div className="pt-4 ra-fade-up">
      <div
        className="inline-flex flex-col items-center gap-4 px-10 sm:px-14 py-6 sm:py-7 rounded-2xl border"
        style={{
          background: "var(--ra-surface)",
          borderColor: "var(--ra-border)",
          boxShadow: "var(--ra-card-shadow)",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: "#22c55e",
              animation: "ra-glow 2s ease-in-out infinite",
            }}
          />
          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--ra-primary)" }}
          >
            Sofia Connected
          </span>
        </div>

        <div
          className="flex items-center justify-center w-full"
          style={{ minHeight: 80 }}
        >
          {agent.microphoneTrack ? (
            <BarVisualizer
              track={agent.microphoneTrack}
              state={agent.state}
              barCount={5}
              style={{ height: 80, width: "100%" }}
            />
          ) : (
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    background: "var(--ra-primary)",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onEnd}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300"
          style={{
            background: "#ef4444",
            boxShadow: "0 0 0 6px rgba(239,68,68,0.15)",
          }}
        >
          <HiOutlineXMark className="w-6 h-6" />
        </button>
        <p className="text-sm" style={{ color: "var(--ra-text-secondary)" }}>
          {statusText}
        </p>
        <p
          className="text-xs font-mono"
          style={{
            color: secondsLeft <= 10 ? "#ef4444" : "var(--ra-text-tertiary)",
          }}
        >
          {Math.floor(secondsLeft / 60)}:
          {String(secondsLeft % 60).padStart(2, "0")} remaining
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Theme Switcher (scoped to Restaurant Assistant colors)             */
/* ------------------------------------------------------------------ */

const themeOptions = [
  { value: "light" as const, label: "Light", icon: HiOutlineSun },
  { value: "dark" as const, label: "Dark", icon: HiOutlineMoon },
  { value: "system" as const, label: "System", icon: HiOutlineComputerDesktop },
];

function RaThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const ActiveIcon =
    themeOptions.find((o) => o.value === theme)?.icon ?? HiOutlineSun;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Toggle theme"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
        style={{
          borderColor: "var(--ra-border)",
          color: "var(--ra-text-secondary)",
        }}
      >
        <ActiveIcon className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-36 overflow-hidden rounded-xl border z-60"
          style={{
            borderColor: "var(--ra-border)",
            background: "var(--ra-surface)",
            boxShadow: "var(--ra-card-shadow)",
          }}
        >
          {themeOptions.map((opt) => {
            const isActive = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTheme(opt.value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors"
                style={{
                  background: isActive
                    ? "var(--ra-surface-high)"
                    : "transparent",
                  color: isActive
                    ? "var(--ra-text)"
                    : "var(--ra-text-secondary)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <opt.icon className="h-4 w-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
