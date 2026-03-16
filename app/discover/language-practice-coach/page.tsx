"use client";

import Image from "next/image";
import {
  HiOutlineBars3,
  HiOutlineMicrophone,
  HiOutlineArrowRight,
  HiOutlineChatBubbleLeftRight,
  HiOutlineSpeakerWave,
  HiOutlineLightBulb,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineComputerDesktop,
} from "react-icons/hi2";
import {
  MdOutlineRestaurant,
  MdOutlineHotel,
  MdOutlineFlight,
  MdOutlineShoppingBag,
  MdOutlineMap,
} from "react-icons/md";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ui/theme-provider";

/* ------------------------------------------------------------------ */
/*  Hardcoded color tokens for this template                           */
/* ------------------------------------------------------------------ */

const L = {
  bg: "#f5f7f2",
  surface: "#ffffff",
  surfaceHigh: "#eef1ea",
  surfaceDim: "#e8ebe4",
  primary: "#0d7377",
  primaryMuted: "rgba(13,115,119,0.10)",
  primaryGradient: "linear-gradient(135deg, #0d7377 0%, #0a5c5f 100%)",
  text: "#1a2420",
  textSecondary: "#5a6b62",
  border: "#dce3d8",
  cardShadow: "0 1px 3px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.04)",
  heroGradient:
    "linear-gradient(to bottom, rgba(13,115,119,0.06) 0%, transparent 60%)",
};
const D = {
  bg: "#0c1210",
  surface: "#141c19",
  surfaceHigh: "#1c2723",
  surfaceDim: "#111a17",
  primary: "#4da1a9",
  primaryMuted: "rgba(77,161,169,0.12)",
  primaryGradient: "linear-gradient(135deg, #4da1a9 0%, #3a8a91 100%)",
  text: "#e0eae5",
  textSecondary: "#8fa69a",
  border: "#243430",
  cardShadow: "0 1px 3px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.18)",
  heroGradient:
    "linear-gradient(to bottom, rgba(77,161,169,0.08) 0%, transparent 60%)",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LanguagePracticeCoachPage() {
  return (
    <div className="lpc-page">
      <style>{`
        .lpc-page {
          --lpc-bg: ${L.bg};
          --lpc-surface: ${L.surface};
          --lpc-surface-high: ${L.surfaceHigh};
          --lpc-surface-dim: ${L.surfaceDim};
          --lpc-primary: ${L.primary};
          --lpc-primary-muted: ${L.primaryMuted};
          --lpc-primary-gradient: ${L.primaryGradient};
          --lpc-text: ${L.text};
          --lpc-text-secondary: ${L.textSecondary};
          --lpc-border: ${L.border};
          --lpc-card-shadow: ${L.cardShadow};
          --lpc-hero-gradient: ${L.heroGradient};
          background: var(--lpc-bg);
          color: var(--lpc-text);
          min-height: 100vh;
        }
        .dark .lpc-page {
          --lpc-bg: ${D.bg};
          --lpc-surface: ${D.surface};
          --lpc-surface-high: ${D.surfaceHigh};
          --lpc-surface-dim: ${D.surfaceDim};
          --lpc-primary: ${D.primary};
          --lpc-primary-muted: ${D.primaryMuted};
          --lpc-primary-gradient: ${D.primaryGradient};
          --lpc-text: ${D.text};
          --lpc-text-secondary: ${D.textSecondary};
          --lpc-border: ${D.border};
          --lpc-card-shadow: ${D.cardShadow};
          --lpc-hero-gradient: ${D.heroGradient};
        }
        .lpc-page * { box-sizing: border-box; }
        .lpc-glass-nav {
          background: color-mix(in srgb, var(--lpc-surface) 80%, transparent);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .lpc-ambient { box-shadow: var(--lpc-card-shadow); }
        @keyframes lpc-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(13,115,119,0.3)} 50%{box-shadow:0 0 0 18px rgba(13,115,119,0)} }
        .dark .lpc-page { --lpc-pulse-color: rgba(77,161,169,0.3); }
        .lpc-voice-pulse { animation: lpc-pulse 2s ease-in-out infinite; }
        .lpc-glass-panel {
          background: color-mix(in srgb, var(--lpc-surface) 70%, transparent);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
      `}</style>

      {/* ---- Navigation ---- */}
      <nav
        className="lpc-glass-nav sticky top-0 z-50 h-20 border-b"
        style={{ borderColor: "var(--lpc-border)" }}
      >
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ background: "var(--lpc-primary)" }}
            >
              <HiOutlineMicrophone className="w-5 h-5" />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: "var(--lpc-text)" }}
            >
              Voice Coach
            </span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            {["How It Works", "Languages", "Practice Scenarios", "About"].map(
              (l) => (
                <a
                  key={l}
                  href="#"
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: "var(--lpc-text-secondary)" }}
                >
                  {l}
                </a>
              ),
            )}
          </div>
          <div className="flex items-center gap-3">
            <LpcThemeSwitcher />
            <button
              className="px-6 py-3 rounded-full font-semibold text-sm text-white transition-transform hover:scale-105"
              style={{ background: "var(--lpc-primary-gradient)" }}
            >
              Start Speaking
            </button>
            <button
              className="p-2 rounded-full md:hidden"
              style={{ color: "var(--lpc-text-secondary)" }}
            >
              <HiOutlineBars3 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <header className="relative overflow-hidden pt-16 sm:pt-20 pb-24 sm:pb-32">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--lpc-hero-gradient)" }}
        />
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[120px] -z-10"
          style={{ background: "var(--lpc-primary-muted)" }}
        />
        <div
          className="absolute top-1/2 -right-24 w-80 h-80 rounded-full blur-[100px] -z-10"
          style={{ background: "var(--lpc-primary-muted)" }}
        />

        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <span
            className="px-4 py-1.5 rounded-full text-sm font-bold mb-6 border"
            style={{
              background: "var(--lpc-primary-muted)",
              color: "var(--lpc-primary)",
              borderColor:
                "color-mix(in srgb, var(--lpc-primary) 20%, transparent)",
            }}
          >
            THE CONVERSATIONAL SANCTUARY
          </span>
          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.08] mb-6 sm:mb-8 tracking-tight max-w-4xl"
            style={{ color: "var(--lpc-text)" }}
          >
            Practice Any Language
            <br />
            With Your{" "}
            <span style={{ color: "var(--lpc-primary)", fontStyle: "italic" }}>
              AI Voice Coach
            </span>
          </h1>
          <p
            className="text-base sm:text-lg lg:text-xl mb-10 sm:mb-12 leading-relaxed max-w-2xl"
            style={{ color: "var(--lpc-text-secondary)" }}
          >
            Speak naturally with an AI tutor to improve pronunciation,
            vocabulary, and real-world conversation skills in a judgment-free
            space.
          </p>

          {/* Voice Interface Card */}
          <div
            className="w-full max-w-2xl lpc-ambient rounded-xl p-6 sm:p-8 md:p-12 border relative overflow-hidden"
            style={{
              background:
                "color-mix(in srgb, var(--lpc-surface) 50%, transparent)",
              borderColor: "var(--lpc-border)",
            }}
          >
            <div className="flex flex-col items-center">
              {/* Waveform bars */}
              <div className="mb-6 sm:mb-8 flex items-end gap-1 h-12">
                {[4, 8, 12, 6, 10, 4, 9].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full animate-pulse"
                    style={{
                      height: `${h * 4}px`,
                      background: "var(--lpc-primary)",
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <button
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white mb-5 sm:mb-6 lpc-voice-pulse transition-transform hover:scale-110"
                style={{
                  background: "var(--lpc-primary-gradient)",
                  boxShadow:
                    "0 0 30px color-mix(in srgb, var(--lpc-primary) 40%, transparent)",
                }}
              >
                <HiOutlineMicrophone className="w-8 h-8 sm:w-10 sm:h-10" />
              </button>
              <p
                className="font-bold text-base sm:text-lg mb-6 sm:mb-8 tracking-wide"
                style={{ color: "var(--lpc-primary)" }}
              >
                TAP TO START SPEAKING
              </p>
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                {[
                  '"I want to practice Spanish for travel"',
                  '"Help me practice ordering food in French"',
                  '"I want to learn basic Japanese conversation"',
                ].map((prompt, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg text-sm cursor-pointer border transition-colors ${i === 2 ? "md:col-span-2" : ""}`}
                    style={{
                      background: "var(--lpc-surface-high)",
                      color: "var(--lpc-text-secondary)",
                      borderColor: "var(--lpc-border)",
                    }}
                  >
                    {prompt}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ---- How It Works ---- */}
      <section
        className="py-20 sm:py-24"
        style={{ background: "var(--lpc-surface-dim)" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 sm:mb-16">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "var(--lpc-text)" }}
            >
              How It Works
            </h2>
            <div
              className="w-20 h-1.5 rounded-full"
              style={{ background: "var(--lpc-primary)" }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                num: "01",
                title: "Choose your language",
                desc: "Select from our wide range of supported languages to start your personalized journey.",
              },
              {
                num: "02",
                title: "Speak naturally",
                desc: "Engage in organic conversations. No rigid scripts—just you and your AI coach.",
              },
              {
                num: "03",
                title: "Get real-time feedback",
                desc: "Receive instant corrections on pronunciation and helpful vocabulary suggestions.",
              },
            ].map((s) => (
              <div key={s.num} className="group">
                <div
                  className="text-5xl sm:text-6xl font-black mb-4 transition-colors duration-500"
                  style={{
                    color:
                      "color-mix(in srgb, var(--lpc-primary) 15%, transparent)",
                  }}
                >
                  {s.num}
                </div>
                <h3
                  className="text-lg sm:text-xl font-bold mb-3"
                  style={{ color: "var(--lpc-text)" }}
                >
                  {s.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: "var(--lpc-text-secondary)" }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Supported Languages ---- */}
      <section
        className="py-20 sm:py-24 overflow-hidden"
        style={{ background: "var(--lpc-bg)" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div className="max-w-xl">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: "var(--lpc-text)" }}
              >
                Supported Languages
              </h2>
              <p
                className="text-lg"
                style={{ color: "var(--lpc-text-secondary)" }}
              >
                Master languages from around the globe with specialized tutors
                for every dialect.
              </p>
            </div>
            <a
              href="#"
              className="font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all"
              style={{ color: "var(--lpc-primary)" }}
            >
              View all 40+ languages <HiOutlineArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {[
              { flag: "🇪🇸", name: "Spanish" },
              { flag: "🇫🇷", name: "French" },
              { flag: "🇩🇪", name: "German" },
              { flag: "🇯🇵", name: "Japanese" },
              { flag: "🇨🇳", name: "Mandarin" },
              { flag: "🇮🇹", name: "Italian" },
            ].map((lang) => (
              <div
                key={lang.name}
                className="group aspect-square lpc-ambient rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center text-center cursor-pointer border transition-all hover:-translate-y-1"
                style={{
                  background: "var(--lpc-surface-high)",
                  borderColor: "var(--lpc-border)",
                }}
              >
                <div
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform"
                  style={{ background: "var(--lpc-surface)" }}
                >
                  <span className="text-2xl sm:text-3xl">{lang.flag}</span>
                </div>
                <span
                  className="font-bold text-sm"
                  style={{ color: "var(--lpc-text)" }}
                >
                  {lang.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Practice Scenarios ---- */}
      <section
        className="py-20 sm:py-24"
        style={{ background: "var(--lpc-surface)" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-10 sm:mb-12 text-center"
            style={{ color: "var(--lpc-text)" }}
          >
            Practice Scenarios
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                img: "/assets/images/language-practice-coach/practice1.png",
                icon: <MdOutlineRestaurant className="w-5 h-5" />,
                title: "Restaurant Ordering",
              },
              {
                img: "/assets/images/language-practice-coach/practice2.png",
                icon: <MdOutlineHotel className="w-5 h-5" />,
                title: "Hotel Check-in",
              },
              {
                img: "/assets/images/language-practice-coach/practice3.png",
                icon: <MdOutlineFlight className="w-5 h-5" />,
                title: "Airport Conversations",
              },
              {
                img: "/assets/images/language-practice-coach/practice4.png",
                icon: <HiOutlineUserGroup className="w-5 h-5" />,
                title: "Meeting New People",
              },
              {
                img: "/assets/images/language-practice-coach/practice5.png",
                icon: <MdOutlineShoppingBag className="w-5 h-5" />,
                title: "Shopping",
              },
              {
                img: "/assets/images/language-practice-coach/practice6.png",
                icon: <MdOutlineMap className="w-5 h-5" />,
                title: "Asking for Directions",
              },
            ].map((s) => (
              <div
                key={s.title}
                className="relative h-56 sm:h-64 rounded-xl overflow-hidden group cursor-pointer lpc-ambient"
              >
                <Image
                  src={s.img}
                  alt={s.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, var(--lpc-bg) 0%, color-mix(in srgb, var(--lpc-bg) 40%, transparent) 40%, transparent 100%)",
                  }}
                />
                <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6">
                  <span
                    className="mb-2 block"
                    style={{ color: "var(--lpc-primary)" }}
                  >
                    {s.icon}
                  </span>
                  <h3
                    className="text-lg sm:text-xl font-bold"
                    style={{ color: "var(--lpc-text)" }}
                  >
                    {s.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Master Language with Confidence ---- */}
      <section
        className="py-20 sm:py-24"
        style={{ background: "var(--lpc-surface-dim)" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: benefits */}
            <div className="w-full lg:w-1/2">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-8 leading-tight"
                style={{ color: "var(--lpc-text)" }}
              >
                Master language with confidence, not just textbooks.
              </h2>
              <div className="space-y-4 sm:space-y-6">
                {[
                  {
                    icon: <HiOutlineChatBubbleLeftRight className="w-6 h-6" />,
                    title: "Real-time conversation",
                    desc: "Instant AI processing allows for seamless, back-and-forth verbal communication.",
                  },
                  {
                    icon: <HiOutlineSpeakerWave className="w-6 h-6" />,
                    title: "Pronunciation feedback",
                    desc: "Get specific audio-visual analysis of how you sound compared to native speakers.",
                  },
                  {
                    icon: <HiOutlineLightBulb className="w-6 h-6" />,
                    title: "Natural dialogue",
                    desc: "Learn colloquialisms and modern phrasing that traditional courses often miss.",
                  },
                  {
                    icon: <HiOutlineUserGroup className="w-6 h-6" />,
                    title: "Roleplay scenarios",
                    desc: "Step into immersive characters to practice practical life situations.",
                  },
                ].map((b) => (
                  <div
                    key={b.title}
                    className="flex gap-4 p-5 sm:p-6 rounded-lg border"
                    style={{
                      background: "var(--lpc-surface-high)",
                      borderColor: "var(--lpc-border)",
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: "var(--lpc-primary-muted)",
                        color: "var(--lpc-primary)",
                      }}
                    >
                      {b.icon}
                    </div>
                    <div>
                      <h4
                        className="font-bold text-base sm:text-lg mb-1"
                        style={{ color: "var(--lpc-text)" }}
                      >
                        {b.title}
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: "var(--lpc-text-secondary)" }}
                      >
                        {b.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: image + correction card */}
            <div className="w-full lg:w-1/2 relative">
              <div
                className="aspect-[4/5] rounded-xl overflow-hidden p-1"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--lpc-primary) 30%, transparent), color-mix(in srgb, var(--lpc-primary) 10%, transparent))",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                }}
              >
                <Image
                  src="/assets/images/language-practice-coach/master1.png"
                  alt="People having a conversation"
                  fill
                  className="object-cover rounded-lg opacity-90"
                />
              </div>
              {/* Correction floating card */}
              <div
                className="absolute -bottom-6 -left-4 sm:-bottom-10 sm:-left-10 p-6 sm:p-8 lpc-glass-panel rounded-xl max-w-xs border"
                style={{
                  borderColor: "var(--lpc-border)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                }}
              >
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <HiOutlineCheckCircle className="w-5 h-5" />
                  </div>
                  <span
                    className="font-bold text-sm"
                    style={{ color: "var(--lpc-text)" }}
                  >
                    Correction Applied
                  </span>
                </div>
                <p
                  className="italic text-sm"
                  style={{ color: "var(--lpc-text-secondary)" }}
                >
                  &ldquo;You said &lsquo;Je veux un pain&rsquo;, but in a
                  bakery, try &lsquo;Je voudrais une baguette, s&rsquo;il vous
                  plaît&rsquo;.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Final CTA ---- */}
      <section
        className="py-20 sm:py-24"
        style={{ background: "var(--lpc-bg)" }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div
            className="rounded-xl p-10 sm:p-12 md:p-20 border relative overflow-hidden"
            style={{
              background:
                "color-mix(in srgb, var(--lpc-primary) 6%, var(--lpc-surface))",
              borderColor: "var(--lpc-border)",
            }}
          >
            <div
              className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] -z-10"
              style={{ background: "var(--lpc-primary-muted)" }}
            />
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 sm:mb-6"
              style={{ color: "var(--lpc-text)" }}
            >
              Ready to find your voice?
            </h2>
            <p
              className="text-base sm:text-lg mb-10 sm:mb-12"
              style={{ color: "var(--lpc-text-secondary)" }}
            >
              Try practicing a conversation right now.
            </p>
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <button
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white lpc-voice-pulse transition-transform hover:scale-110"
                style={{
                  background: "var(--lpc-primary-gradient)",
                  boxShadow:
                    "0 0 30px color-mix(in srgb, var(--lpc-primary) 40%, transparent)",
                }}
              >
                <HiOutlineMicrophone className="w-8 h-8 sm:w-10 sm:h-10" />
              </button>
              <p
                className="font-bold tracking-wider text-sm"
                style={{ color: "var(--lpc-primary)" }}
              >
                LISTENING...
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer
        className="border-t py-10 sm:py-12"
        style={{
          background: "var(--lpc-surface)",
          borderColor: "var(--lpc-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ background: "var(--lpc-primary)" }}
              >
                <HiOutlineMicrophone className="w-5 h-5" />
              </div>
              <span
                className="text-xl font-bold"
                style={{ color: "var(--lpc-text)" }}
              >
                Voice Coach
              </span>
            </div>
            <div className="flex items-center gap-6 sm:gap-8">
              {["Terms of Service", "Privacy Policy", "Contact Us"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ color: "var(--lpc-text-secondary)" }}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
          <div
            className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4"
            style={{ borderColor: "var(--lpc-border)" }}
          >
            <p
              className="text-xs"
              style={{ color: "var(--lpc-text-secondary)" }}
            >
              &copy; 2026 Voice Coach. All rights reserved.
            </p>
            <div className="flex gap-3">
              {["G", "X", "IG"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold"
                  style={{
                    borderColor: "var(--lpc-border)",
                    color: "var(--lpc-text-secondary)",
                  }}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Theme Switcher (scoped to Voice Coach colors)                      */
/* ------------------------------------------------------------------ */

const lpcThemeOptions = [
  { value: "light" as const, label: "Light", icon: HiOutlineSun },
  { value: "dark" as const, label: "Dark", icon: HiOutlineMoon },
  { value: "system" as const, label: "System", icon: HiOutlineComputerDesktop },
];

function LpcThemeSwitcher() {
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
    lpcThemeOptions.find((o) => o.value === theme)?.icon ?? HiOutlineSun;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Toggle theme"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
        style={{
          borderColor: "var(--lpc-border)",
          color: "var(--lpc-text-secondary)",
        }}
      >
        <ActiveIcon className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-36 overflow-hidden rounded-xl border z-[60]"
          style={{
            borderColor: "var(--lpc-border)",
            background: "var(--lpc-surface)",
            boxShadow: "var(--lpc-card-shadow)",
          }}
        >
          {lpcThemeOptions.map((opt) => {
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
                    ? "var(--lpc-surface-high)"
                    : "transparent",
                  color: isActive
                    ? "var(--lpc-text)"
                    : "var(--lpc-text-secondary)",
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
