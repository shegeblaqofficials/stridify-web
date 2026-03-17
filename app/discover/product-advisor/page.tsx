"use client";

import Image from "next/image";
import {
  HiOutlineBars3,
  HiOutlineMicrophone,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineShoppingCart,
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineXMark,
  HiOutlineStar,
  HiOutlineDocumentText,
  HiOutlineLightBulb,
} from "react-icons/hi2";
import {
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineComputerDesktop,
} from "react-icons/hi2";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ui/theme-provider";

/* ------------------------------------------------------------------ */
/*  Color tokens — hardcoded per-template, NOT using app theme vars   */
/* ------------------------------------------------------------------ */

const L = {
  bg: "#f5f0eb",
  surface: "#ffffff",
  surfaceHigh: "#f0ebe5",
  surfaceAlt: "#eae4dd",
  primary: "#1a56db",
  primaryMuted: "rgba(26,86,219,0.08)",
  text: "#111111",
  textSecondary: "#6b7280",
  border: "#e5ddd4",
  cardShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03)",
  heroGradient:
    "linear-gradient(to bottom, rgba(245,240,235,0) 0%, rgba(245,240,235,0.6) 100%)",
  tagBg: "rgba(26,86,219,0.10)",
  tagText: "#1a56db",
  electronicsCard: "#1a1a1a",
  smartHomeCard: "#5ba89d",
  footerBg: "#e8e2db",
};

const D = {
  bg: "#0f0f10",
  surface: "#18181b",
  surfaceHigh: "#222225",
  surfaceAlt: "#2a2a2e",
  primary: "#608fff",
  primaryMuted: "rgba(96,143,255,0.10)",
  text: "#f0f0f2",
  textSecondary: "#b0b0ba",
  border: "#2a2a2e",
  cardShadow: "0 1px 3px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.18)",
  heroGradient:
    "linear-gradient(to bottom, rgba(15,15,16,0) 0%, rgba(15,15,16,0.6) 100%)",
  tagBg: "rgba(96,143,255,0.12)",
  tagText: "#608fff",
  electronicsCard: "#111113",
  smartHomeCard: "#2d5f57",
  footerBg: "#141416",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ProductAdvisorPage() {
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <div className="pa-page">
      {/* Scoped CSS custom properties for light/dark */}
      <style>{`
        .pa-page {
          --pa-bg: ${L.bg};
          --pa-surface: ${L.surface};
          --pa-surface-high: ${L.surfaceHigh};
          --pa-surface-alt: ${L.surfaceAlt};
          --pa-primary: ${L.primary};
          --pa-primary-muted: ${L.primaryMuted};
          --pa-text: ${L.text};
          --pa-text-secondary: ${L.textSecondary};
          --pa-border: ${L.border};
          --pa-card-shadow: ${L.cardShadow};
          --pa-hero-gradient: ${L.heroGradient};
          --pa-tag-bg: ${L.tagBg};
          --pa-tag-text: ${L.tagText};
          --pa-electronics-card: ${L.electronicsCard};
          --pa-smart-home-card: ${L.smartHomeCard};
          --pa-footer-bg: ${L.footerBg};
          background: var(--pa-bg);
          color: var(--pa-text);
          min-height: 100vh;
          font-family: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif;
        }
        .dark .pa-page {
          --pa-bg: ${D.bg};
          --pa-surface: ${D.surface};
          --pa-surface-high: ${D.surfaceHigh};
          --pa-surface-alt: ${D.surfaceAlt};
          --pa-primary: ${D.primary};
          --pa-primary-muted: ${D.primaryMuted};
          --pa-text: ${D.text};
          --pa-text-secondary: ${D.textSecondary};
          --pa-border: ${D.border};
          --pa-card-shadow: ${D.cardShadow};
          --pa-hero-gradient: ${D.heroGradient};
          --pa-tag-bg: ${D.tagBg};
          --pa-tag-text: ${D.tagText};
          --pa-electronics-card: ${D.electronicsCard};
          --pa-smart-home-card: ${D.smartHomeCard};
          --pa-footer-bg: ${D.footerBg};
        }
        .pa-page * { box-sizing: border-box; }
        .pa-glass-nav {
          background: color-mix(in srgb, var(--pa-surface) 85%, transparent);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .pa-ambient { box-shadow: var(--pa-card-shadow); }
        @keyframes pa-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(26,86,219,0.25)} 50%{box-shadow:0 0 0 12px rgba(26,86,219,0)} }
        .pa-voice-pulse { animation: pa-pulse 2s ease-in-out infinite; }
        .pa-line-clamp-2 { display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden; }
        @keyframes pa-chat-in { from { opacity: 0; transform: translateY(16px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .pa-chat-enter { animation: pa-chat-in 0.35s cubic-bezier(0.16,1,0.3,1); }
        .pa-listen-btn { background: var(--pa-text); }
        .dark .pa-listen-btn { background: var(--pa-primary); }
        .pa-glass-widget {
          background: color-mix(in srgb, var(--pa-surface) 72%, transparent);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          box-shadow: 0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.12);
          border: 1px solid color-mix(in srgb, var(--pa-border) 60%, transparent);
        }
        .dark .pa-glass-widget {
          background: color-mix(in srgb, var(--pa-surface) 65%, transparent);
          box-shadow: 0 8px 40px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
          border-color: color-mix(in srgb, var(--pa-border) 50%, transparent);
        }
      `}</style>

      {/* ---- Navigation ---- */}
      <nav
        className="pa-glass-nav fixed top-0 left-0 right-0 z-50 h-16 sm:h-20 border-b"
        style={{ borderColor: "var(--pa-border)" }}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-6 lg:gap-10">
            <span
              className="text-xl sm:text-2xl font-bold tracking-[0.15em] uppercase"
              style={{ color: "var(--pa-text)" }}
            >
              Curator
            </span>
            <div className="hidden lg:flex items-center gap-6">
              {["Shop", "Categories", "New Arrivals", "Deals", "Support"].map(
                (l) => (
                  <a
                    key={l}
                    href="#"
                    className="text-sm font-medium transition-colors hover:opacity-70"
                    style={{ color: "var(--pa-text-secondary)" }}
                  >
                    {l}
                  </a>
                ),
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <PaThemeSwitcher />
            <button
              className="p-2 rounded-lg transition-colors hover:opacity-70"
              style={{ color: "var(--pa-text)" }}
              aria-label="Account"
            >
              <HiOutlineUser className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-lg transition-colors hover:opacity-70"
              style={{ color: "var(--pa-text)" }}
              aria-label="Wishlist"
            >
              <HiOutlineHeart className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-lg transition-colors hover:opacity-70"
              style={{ color: "var(--pa-text)" }}
              aria-label="Cart"
            >
              <HiOutlineShoppingCart className="w-5 h-5" />
            </button>
            <button
              className="lg:hidden p-2 rounded-lg"
              style={{ color: "var(--pa-text)" }}
              aria-label="Menu"
            >
              <HiOutlineBars3 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ---- Hero Section ---- */}
      <header className="relative pt-16 sm:pt-20 mb-12 sm:mb-16 lg:mb-20">
        <div className="relative min-h-150 sm:min-h-175 lg:min-h-[90vh] overflow-visible">
          {/* Hero background image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/images/product-advisor/hero1.png"
              alt="Curated product collection"
              fill
              className="object-cover"
              priority
            />
            <div
              className="absolute inset-0"
              style={{ background: "var(--pa-hero-gradient)" }}
            />
          </div>

          {/* Hero content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 flex items-center min-h-150 sm:min-h-175 lg:min-h-[90vh]">
            <div className="flex-1 pt-16 sm:pt-20 lg:pt-0 max-w-3xl">
              <p
                className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase mb-4 sm:mb-6"
                style={{ color: "var(--pa-primary)" }}
              >
                The Editorial Collection
              </p>
              <h1
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem] font-extrabold leading-[1.02] mb-6 sm:mb-8 tracking-tight"
                style={{ color: "var(--pa-text)" }}
              >
                Discover
                <br />
                Products You&rsquo;ll{" "}
                <span className="italic font-serif font-normal">Love</span>
              </h1>
              <p
                className="text-base sm:text-lg lg:text-xl leading-relaxed mb-8 sm:mb-10 max-w-xl"
                style={{ color: "var(--pa-text-secondary)" }}
              >
                A thoughtfully curated selection of premium electronics and
                lifestyle essentials, designed for the modern connoisseur.
              </p>
              <button
                className="px-10 sm:px-12 py-4 sm:py-5 rounded-full font-bold text-sm sm:text-base text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                style={{ background: "var(--pa-primary)" }}
              >
                Shop Now
              </button>
            </div>
          </div>
        </div>

        {/* ---- Floating AI Chat Widget (absolute bottom-right of hero, overlapping next section) ---- */}
        {chatOpen && (
          <div className="pa-chat-enter pa-glass-widget fixed bottom-4 right-4 sm:bottom-6 sm:right-6 xl:right-10 z-40 w-[calc(100%-2rem)] sm:w-80 lg:w-[368px] rounded-2xl overflow-hidden">
            {/* Chat header */}
            <div
              className="px-6 py-5 flex items-center justify-between border-b"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--pa-border) 60%, transparent)",
              }}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: "var(--pa-primary)",
                    color: "white",
                  }}
                >
                  <HiOutlineSparkles className="w-5 h-5" />
                </div>
                <div>
                  <p
                    className="text-base font-bold leading-tight"
                    style={{ color: "var(--pa-text)" }}
                  >
                    Digital Curator
                  </p>
                  <p
                    className="text-xs uppercase tracking-wider font-medium"
                    style={{ color: "var(--pa-text-secondary)" }}
                  >
                    Your Personal Stylist
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-2 rounded-lg transition-colors hover:opacity-70"
                style={{ color: "var(--pa-text-secondary)" }}
                aria-label="Close chat"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Chat body */}
            <div className="px-6 py-5">
              <div
                className="p-4 rounded-xl rounded-tl-sm mb-5"
                style={{
                  background:
                    "color-mix(in srgb, var(--pa-surface-high) 70%, transparent)",
                }}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--pa-text-secondary)" }}
                >
                  &ldquo;Hello! I&rsquo;m your Digital Curator. Looking for
                  something specific in our new arrivals?&rdquo;
                </p>
              </div>

              {/* Action buttons */}
              <div className="space-y-2.5">
                <button
                  className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-left transition-all hover:opacity-80"
                  style={{
                    background: "var(--pa-primary)",
                    color: "white",
                  }}
                >
                  <HiOutlineMicrophone className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-semibold tracking-wide uppercase">
                    Ask AI
                  </span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-left transition-all hover:opacity-80"
                  style={{
                    background:
                      "color-mix(in srgb, var(--pa-surface-high) 50%, transparent)",
                    color: "var(--pa-text-secondary)",
                  }}
                >
                  <HiOutlineDocumentText className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium tracking-wide uppercase">
                    Transcript
                  </span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-left transition-all hover:opacity-80"
                  style={{
                    background:
                      "color-mix(in srgb, var(--pa-surface-high) 50%, transparent)",
                    color: "var(--pa-text-secondary)",
                  }}
                >
                  <HiOutlineLightBulb className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium tracking-wide uppercase">
                    Prompts
                  </span>
                </button>
              </div>
            </div>

            {/* Listen button */}
            <div className="px-6 pb-6">
              <button className="pa-listen-btn w-full py-4 rounded-full font-bold text-base text-white transition-all hover:opacity-90 flex items-center justify-center gap-2">
                Start Listening
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ---- Category Showcase ---- */}
      <section
        className="py-16 sm:py-24 lg:py-32"
        style={{ background: "var(--pa-bg)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Electronics - large card */}
            <div className="col-span-2 lg:col-span-5 relative rounded-2xl overflow-hidden group cursor-pointer aspect-4/5 sm:aspect-auto sm:min-h-120 lg:min-h-140">
              <Image
                src="/assets/images/product-advisor/electronics.png"
                alt="Electronics"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  Electronics
                </h3>
                <p className="text-white/70 text-sm">Elevate your workspace</p>
              </div>
            </div>

            {/* Right column: Laptops + Smart Home */}
            <div className="col-span-2 lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6">
              {/* Laptops */}
              <div className="relative rounded-2xl overflow-hidden group cursor-pointer aspect-4/3 sm:aspect-auto sm:min-h-55 lg:min-h-67">
                <Image
                  src="/assets/images/product-advisor/laptop.png"
                  alt="Laptops"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-2xl font-bold text-white/80">
                    Laptops
                  </h3>
                </div>
              </div>

              {/* Smart Home */}
              <div
                className="relative rounded-2xl overflow-hidden group cursor-pointer aspect-4/3 sm:aspect-auto sm:min-h-55 lg:min-h-67"
                style={{ background: "var(--pa-smart-home-card)" }}
              >
                <Image
                  src="/assets/images/product-advisor/electronic2.png"
                  alt="Smart Home"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)",
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-2xl font-bold text-white">
                    Smart Home
                  </h3>
                </div>
              </div>

              {/* Third row — spans full width of the right column */}
              <div className="col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer aspect-16/7 sm:aspect-auto sm:min-h-55 lg:min-h-67">
                <Image
                  src="/assets/images/product-advisor/hero1.png"
                  alt="New Arrivals"
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-2xl font-bold text-white">
                    New Arrivals
                  </h3>
                  <p className="text-white/70 text-sm mt-1">
                    Fresh picks, just for you
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Curated Picks ---- */}
      <section
        className="py-16 sm:py-24 lg:py-32"
        style={{ background: "var(--pa-surface-high)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4">
            <div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
                style={{ color: "var(--pa-text)" }}
              >
                Curated Picks
              </h2>
              <p
                className="text-sm sm:text-base mt-2"
                style={{ color: "var(--pa-text-secondary)" }}
              >
                Essential pieces selected for you.
              </p>
            </div>
            <a
              href="#"
              className="font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all"
              style={{ color: "var(--pa-primary)" }}
            >
              View All Collections <HiOutlineArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                img: "/assets/images/product-advisor/curator1.png",
                name: "Linear Watch",
                desc: "Timeless silver and leather",
                price: "$240",
                rating: 4.0,
              },
              {
                img: "/assets/images/product-advisor/curator2.png",
                name: "Vantage Lens",
                desc: "Precision 35mm optical",
                price: "$1,150",
                rating: 5.0,
              },
              {
                img: "/assets/images/product-advisor/curator3.png",
                name: "Aero Frames",
                desc: "Polarized titanium series",
                price: "$310",
                rating: 4.8,
              },
              {
                img: "/assets/images/product-advisor/curator4.png",
                name: "Sonic Core",
                desc: "360 hi-fi immersive sound",
                price: "$890",
                rating: 4.9,
              },
            ].map((product) => (
              <div
                key={product.name}
                className="group pa-ambient rounded-2xl overflow-hidden border transition-all hover:-translate-y-1"
                style={{
                  background: "var(--pa-surface)",
                  borderColor: "var(--pa-border)",
                }}
              >
                {/* Product image */}
                <div className="aspect-square overflow-hidden relative">
                  <Image
                    src={product.img}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Product info */}
                <div className="p-3.5 sm:p-5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3
                      className="font-bold text-sm sm:text-base leading-tight"
                      style={{ color: "var(--pa-text)" }}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <HiOutlineStar
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                        style={{ color: "#ef4444" }}
                      />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "#ef4444" }}
                      >
                        {product.rating}
                      </span>
                    </div>
                  </div>
                  <p
                    className="text-xs sm:text-sm mb-3 pa-line-clamp-2"
                    style={{ color: "var(--pa-text-secondary)" }}
                  >
                    {product.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className="font-bold text-base sm:text-lg"
                      style={{ color: "var(--pa-text)" }}
                    >
                      {product.price}
                    </span>
                    <button
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-colors hover:opacity-80 border"
                      style={{
                        borderColor: "var(--pa-border)",
                        color: "var(--pa-text-secondary)",
                      }}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <HiOutlineShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- AI Product Advisor Spotlight ---- */}
      <section
        className="py-16 sm:py-24 lg:py-32"
        style={{ background: "var(--pa-bg)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left: text */}
            <div>
              <span
                className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase mb-4 block"
                style={{ color: "var(--pa-primary)" }}
              >
                AI-Powered
              </span>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
                style={{ color: "var(--pa-text)" }}
              >
                Your Personal
                <br />
                Shopping Assistant
              </h2>
              <p
                className="text-sm sm:text-base leading-relaxed mb-8 max-w-lg"
                style={{ color: "var(--pa-text-secondary)" }}
              >
                Our AI-powered Digital Curator learns your style preferences and
                delivers hyper-personalized recommendations. Simply ask about
                any product, and get instant expert advice.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { stat: "50K+", label: "Products curated" },
                  { stat: "98%", label: "Match accuracy" },
                  { stat: "24/7", label: "Always available" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="p-4 rounded-xl border"
                    style={{
                      background: "var(--pa-surface)",
                      borderColor: "var(--pa-border)",
                    }}
                  >
                    <p
                      className="text-2xl sm:text-3xl font-bold"
                      style={{ color: "var(--pa-primary)" }}
                    >
                      {s.stat}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--pa-text-secondary)" }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: demo chat */}
            <div
              className="pa-ambient rounded-2xl p-6 sm:p-8 border"
              style={{
                background: "var(--pa-surface)",
                borderColor: "var(--pa-border)",
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ background: "var(--pa-primary)" }}
                />
                <span
                  className="text-sm font-semibold tracking-wide uppercase"
                  style={{ color: "var(--pa-primary)" }}
                >
                  AI Advisor Active
                </span>
              </div>
              <div className="space-y-4 mb-8">
                <div
                  className="p-4 rounded-xl rounded-tl-sm max-w-[85%] border"
                  style={{
                    background: "var(--pa-surface-high)",
                    borderColor: "var(--pa-border)",
                  }}
                >
                  <p
                    className="text-sm"
                    style={{ color: "var(--pa-text-secondary)" }}
                  >
                    &ldquo;I need noise-cancelling headphones under $500&rdquo;
                  </p>
                </div>
                <div
                  className="p-4 rounded-xl rounded-tr-sm ml-auto max-w-[85%] border"
                  style={{
                    background: "var(--pa-primary-muted)",
                    borderColor:
                      "color-mix(in srgb, var(--pa-primary) 20%, transparent)",
                  }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--pa-text)" }}
                  >
                    Based on your preferences, I&rsquo;d recommend the Sonic
                    Core Pro — exceptional noise cancellation with 40-hour
                    battery life at $449.
                  </p>
                </div>
                <div
                  className="p-4 rounded-xl rounded-tl-sm max-w-[85%] border"
                  style={{
                    background: "var(--pa-surface-high)",
                    borderColor: "var(--pa-border)",
                  }}
                >
                  <p
                    className="text-sm"
                    style={{ color: "var(--pa-text-secondary)" }}
                  >
                    &ldquo;How does it compare to the Studio Max?&rdquo;
                  </p>
                </div>
                <div
                  className="p-4 rounded-xl rounded-tr-sm ml-auto max-w-[85%] border"
                  style={{
                    background: "var(--pa-primary-muted)",
                    borderColor:
                      "color-mix(in srgb, var(--pa-primary) 20%, transparent)",
                  }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--pa-text)" }}
                  >
                    The Sonic Core Pro offers 15% better ANC and weighs 30g
                    less. The Studio Max has wider soundstage. Both are
                    excellent picks!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white pa-voice-pulse shrink-0"
                  style={{
                    background: "var(--pa-primary)",
                    boxShadow: "0 0 0 6px var(--pa-primary-muted)",
                  }}
                >
                  <HiOutlineMicrophone className="w-6 h-6" />
                </button>
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: "var(--pa-text)" }}
                  >
                    Ask anything about our products
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--pa-text-secondary)" }}
                  >
                    Voice or text — your choice
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer style={{ background: "var(--pa-footer-bg)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col items-center text-center gap-6">
            <span
              className="text-xl sm:text-2xl font-bold tracking-[0.15em] uppercase"
              style={{ color: "var(--pa-text)" }}
            >
              Curator
            </span>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
              {["Company", "Help", "Newsletter", "Terms"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-sm transition-colors hover:opacity-70"
                  style={{ color: "var(--pa-text-secondary)" }}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t" style={{ borderColor: "var(--pa-border)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex justify-center">
            <p
              className="text-xs tracking-wide uppercase"
              style={{ color: "var(--pa-text-secondary)" }}
            >
              &copy; 2024 Curator E-Commerce. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating chat re-open button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white pa-glass-widget transition-all hover:scale-105"
          style={{
            background: "var(--pa-primary)",
            boxShadow:
              "0 4px 20px rgba(26,86,219,0.3), 0 0 0 4px var(--pa-primary-muted)",
          }}
          aria-label="Open AI assistant"
        >
          <HiOutlineSparkles className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Theme Switcher (scoped to Product Advisor colors)                  */
/* ------------------------------------------------------------------ */

const themeOptions = [
  { value: "light" as const, label: "Light", icon: HiOutlineSun },
  { value: "dark" as const, label: "Dark", icon: HiOutlineMoon },
  { value: "system" as const, label: "System", icon: HiOutlineComputerDesktop },
];

function PaThemeSwitcher() {
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
          borderColor: "var(--pa-border)",
          color: "var(--pa-text-secondary)",
        }}
      >
        <ActiveIcon className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-36 overflow-hidden rounded-xl border z-60"
          style={{
            borderColor: "var(--pa-border)",
            background: "var(--pa-surface)",
            boxShadow: "var(--pa-card-shadow)",
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
                    ? "var(--pa-surface-high)"
                    : "transparent",
                  color: isActive
                    ? "var(--pa-text)"
                    : "var(--pa-text-secondary)",
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
