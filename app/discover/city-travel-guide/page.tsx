"use client";

import Image from "next/image";
import {
  HiOutlineBars3,
  HiOutlineMicrophone,
  HiOutlineSparkles,
  HiOutlineClock,
  HiOutlineTicket,
  HiOutlineMapPin,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineArrowUpRight,
  HiOutlineArrowRight,
  HiOutlineBuildingOffice2,
  HiOutlineBuildingLibrary,
  HiOutlineShieldCheck,
  HiOutlineWifi,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import {
  MdOutlinePark,
  MdOutlineHotel,
  MdOutlineHistoryEdu,
  MdOutlineRestaurant,
  MdOutlineFlight,
  MdOutlineDirectionsBus,
  MdOutlineTrain,
  MdOutlineLocalTaxi,
  MdOutlineLocalHospital,
} from "react-icons/md";
import { HiOutlineStar } from "react-icons/hi";
import {
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineComputerDesktop,
} from "react-icons/hi2";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ui/theme-provider";

/* ------------------------------------------------------------------ */
/*  Color tokens — hardcoded per-template, NOT using app theme vars   */
/* ------------------------------------------------------------------ */

const L = {
  bg: "#f7f8fc",
  surface: "#ffffff",
  surfaceHigh: "#f0f3fa",
  primary: "#3366FF",
  primaryMuted: "rgba(51,102,255,0.10)",
  secondary: "#0A2239",
  text: "#1a2233",
  textSecondary: "#5a6478",
  border: "#e3e8f0",
  cardShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
  heroOverlay:
    "linear-gradient(to right, rgba(10,15,30,0.85) 0%, rgba(10,15,30,0.55) 50%, transparent 100%)",
  tagBg: "rgba(51,102,255,0.12)",
  tagText: "#3366FF",
  yearHighlight: "#EEF2FF",
};
const D = {
  bg: "#0d0f12",
  surface: "#16181d",
  surfaceHigh: "#1e2128",
  primary: "#5b8aff",
  primaryMuted: "rgba(91,138,255,0.12)",
  secondary: "#b8ccff",
  text: "#e8ecf4",
  textSecondary: "#8a94a8",
  border: "#252830",
  cardShadow: "0 1px 3px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.18)",
  heroOverlay:
    "linear-gradient(to right, rgba(6,8,14,0.92) 0%, rgba(6,8,14,0.6) 50%, transparent 100%)",
  tagBg: "rgba(91,138,255,0.15)",
  tagText: "#5b8aff",
  yearHighlight: "#1a1e2a",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CityTravelGuidePage() {
  return (
    <div className="ctg-page">
      {/* Scoped CSS custom properties for light/dark */}
      <style>{`
        .ctg-page {
          --ctg-bg: ${L.bg};
          --ctg-surface: ${L.surface};
          --ctg-surface-high: ${L.surfaceHigh};
          --ctg-primary: ${L.primary};
          --ctg-primary-muted: ${L.primaryMuted};
          --ctg-secondary: ${L.secondary};
          --ctg-text: ${L.text};
          --ctg-text-secondary: ${L.textSecondary};
          --ctg-border: ${L.border};
          --ctg-card-shadow: ${L.cardShadow};
          --ctg-hero-overlay: ${L.heroOverlay};
          --ctg-tag-bg: ${L.tagBg};
          --ctg-tag-text: ${L.tagText};
          --ctg-year-highlight: ${L.yearHighlight};
          background: var(--ctg-bg);
          color: var(--ctg-text);
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .dark .ctg-page {
          --ctg-bg: ${D.bg};
          --ctg-surface: ${D.surface};
          --ctg-surface-high: ${D.surfaceHigh};
          --ctg-primary: ${D.primary};
          --ctg-primary-muted: ${D.primaryMuted};
          --ctg-secondary: ${D.secondary};
          --ctg-text: ${D.text};
          --ctg-text-secondary: ${D.textSecondary};
          --ctg-border: ${D.border};
          --ctg-card-shadow: ${D.cardShadow};
          --ctg-hero-overlay: ${D.heroOverlay};
          --ctg-tag-bg: ${D.tagBg};
          --ctg-tag-text: ${D.tagText};
          --ctg-year-highlight: ${D.yearHighlight};
        }
        .ctg-page * { box-sizing: border-box; }
        .ctg-glass-nav {
          background: color-mix(in srgb, var(--ctg-surface) 80%, transparent);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .ctg-ambient { box-shadow: var(--ctg-card-shadow); }
        @keyframes ctg-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(51,102,255,0.3)} 50%{box-shadow:0 0 0 16px rgba(51,102,255,0)} }
        .ctg-voice-pulse { animation: ctg-pulse 2s ease-in-out infinite; }
        .ctg-line-clamp-2 { display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden; }
      `}</style>

      {/* ---- Navigation ---- */}
      <nav
        className="ctg-glass-nav fixed top-0 left-0 right-0 z-50 h-20 border-b"
        style={{ borderColor: "var(--ctg-border)" }}
      >
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--ctg-primary)" }}
            >
              CityGuide
            </span>
            <div className="hidden lg:flex items-center gap-6">
              {[
                "Explore",
                "Attractions",
                "Restaurants",
                "Transport",
                "Services",
                "Plan Your Trip",
              ].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: "var(--ctg-text-secondary)" }}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CtgThemeSwitcher />
            <button
              className="lg:hidden p-2 rounded-full"
              style={{ color: "var(--ctg-text-secondary)" }}
            >
              <HiOutlineBars3 className="w-5 h-5" />
            </button>
            <button
              className="hidden lg:flex px-6 py-2.5 rounded-full font-bold text-sm text-white"
              style={{ background: "var(--ctg-primary)" }}
            >
              Book Now
            </button>
          </div>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <header className="relative pt-20 min-h-[700px] h-[90vh] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/city-travel-guide/hero.png"
            alt="Panoramic city skyline"
            fill
            className="object-cover brightness-[0.7]"
            priority
          />
          <div
            className="absolute inset-0"
            style={{ background: "var(--ctg-hero-overlay)" }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.08] mb-6 tracking-tight">
              Explore the City
              <br />
              With Your Personal
              <br />
              AI Tour Guide
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-10 leading-relaxed max-w-lg">
              Discover hidden gems, local favorites, and essential services or
              just ask our AI assistant for real-time recommendations.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                className="px-8 py-4 rounded-full font-bold text-base sm:text-lg text-white flex items-center gap-2"
                style={{ background: "var(--ctg-primary)" }}
              >
                Get Started <HiOutlineArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 rounded-full font-semibold text-base sm:text-lg text-white border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all">
                View Map
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ---- AI Assistant + Explore Grid ---- */}
      <section className="relative z-20 -mt-24 px-4 sm:px-6 mb-20 sm:mb-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* AI Card */}
          <div
            className="lg:col-span-5 ctg-ambient rounded-2xl p-6 sm:p-8 flex flex-col justify-between border"
            style={{
              background: "var(--ctg-surface)",
              borderColor: "var(--ctg-border)",
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ background: "var(--ctg-primary)" }}
                  />
                  <span
                    className="text-sm font-semibold tracking-wide uppercase"
                    style={{ color: "var(--ctg-primary)" }}
                  >
                    AI Assistant Active
                  </span>
                </div>
                <HiOutlineSparkles
                  className="w-5 h-5"
                  style={{ color: "var(--ctg-primary)" }}
                />
              </div>
              <div className="space-y-5 mb-10">
                <div
                  className="p-4 sm:p-5 rounded-xl rounded-tl-none max-w-[85%] border"
                  style={{
                    background: "var(--ctg-surface-high)",
                    borderColor: "var(--ctg-border)",
                  }}
                >
                  <p
                    className="italic text-sm"
                    style={{ color: "var(--ctg-text-secondary)" }}
                  >
                    &ldquo;Where can I find the best museums?&rdquo;
                  </p>
                </div>
                <div
                  className="p-4 sm:p-5 rounded-xl rounded-tr-none ml-auto max-w-[85%] text-right border"
                  style={{
                    background: "var(--ctg-primary-muted)",
                    borderColor:
                      "color-mix(in srgb, var(--ctg-primary) 20%, transparent)",
                  }}
                >
                  <p
                    className="font-medium text-sm"
                    style={{ color: "var(--ctg-text)" }}
                  >
                    I&rsquo;d recommend the Metropolitan Art Center. It&rsquo;s
                    open until 8 PM tonight!
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-5">
              <button
                className="w-20 h-20 rounded-full flex items-center justify-center text-white ctg-voice-pulse"
                style={{
                  background: "var(--ctg-primary)",
                  boxShadow: "0 0 0 8px var(--ctg-primary-muted)",
                }}
              >
                <HiOutlineMicrophone className="w-8 h-8" />
              </button>
              <div className="text-center">
                <h3
                  className="text-lg sm:text-xl font-bold mb-1"
                  style={{ color: "var(--ctg-text)" }}
                >
                  Ask the AI City Guide
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--ctg-text-secondary)" }}
                >
                  Listening for your questions...
                </p>
              </div>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <HiOutlineBuildingOffice2 className="w-6 h-6" />,
                label: "Attractions",
              },
              {
                icon: <HiOutlineBuildingLibrary className="w-6 h-6" />,
                label: "Museums",
              },
              {
                icon: <MdOutlineRestaurant className="w-6 h-6" />,
                label: "Voice Assistant",
              },
              { icon: <MdOutlinePark className="w-6 h-6" />, label: "Parks" },
              { icon: <MdOutlineHotel className="w-6 h-6" />, label: "Hotels" },
              {
                icon: <MdOutlineHistoryEdu className="w-6 h-6" />,
                label: "History & Culture",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="group ctg-ambient p-5 sm:p-6 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:-translate-y-1"
                style={{
                  background: "var(--ctg-surface)",
                  borderColor: "var(--ctg-border)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{
                    background: "var(--ctg-primary-muted)",
                    color: "var(--ctg-primary)",
                  }}
                >
                  {item.icon}
                </div>
                <span
                  className="font-semibold text-sm"
                  style={{ color: "var(--ctg-text)" }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Featured Attractions ---- */}
      <section
        className="py-20 sm:py-32 border-y"
        style={{
          background: "var(--ctg-bg)",
          borderColor: "var(--ctg-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-16 gap-4">
            <div>
              <span
                className="text-sm font-bold tracking-widest uppercase mb-3 block"
                style={{ color: "var(--ctg-primary)" }}
              >
                Hand-picked
              </span>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold"
                style={{ color: "var(--ctg-text)" }}
              >
                Featured Attractions
              </h2>
            </div>
            <a
              href="#"
              className="font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all"
              style={{ color: "var(--ctg-primary)" }}
            >
              Explore all landmarks <HiOutlineArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {[
              {
                img: "/assets/images/city-travel-guide/attraction1.png",
                tag: "OPEN NOW",
                tagType: "green" as const,
                title: "The Grand Plaza",
                desc: "A historic square featuring colonial architecture and the city's famous clock tower.",
                hours: "09:00 - 21:00",
                price: "Free Entry",
              },
              {
                img: "/assets/images/city-travel-guide/attraction2.png",
                tag: "MUST VISIT",
                tagType: "blue" as const,
                title: "Modern Art Gallery",
                desc: "Housing the largest collection of contemporary works in the region with rotating exhibits.",
                hours: "10:00 - 18:00",
                price: "$15 / Ticket",
              },
              {
                img: "/assets/images/city-travel-guide/attraction3.png",
                tag: "ECO-CERTIFIED",
                tagType: "green" as const,
                title: "Skyline Gardens",
                desc: "Elevated urban park offering breathtaking views and over 200 species of native plants.",
                hours: "06:00 - 00:00",
                price: "Free Entry",
              },
            ].map((a) => (
              <div
                key={a.title}
                className="group relative ctg-ambient rounded-2xl overflow-hidden border hover:-translate-y-2 transition-transform"
                style={{ borderColor: "var(--ctg-border)" }}
              >
                <div className="aspect-[4/5] overflow-hidden relative">
                  <Image
                    src={a.img}
                    alt={a.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, var(--ctg-bg) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
                    }}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full inline-block mb-3"
                    style={{
                      background:
                        a.tagType === "green"
                          ? "rgba(34,197,94,0.15)"
                          : "var(--ctg-primary-muted)",
                      color:
                        a.tagType === "green"
                          ? "#22c55e"
                          : "var(--ctg-primary)",
                      border: `1px solid ${a.tagType === "green" ? "rgba(34,197,94,0.25)" : "color-mix(in srgb, var(--ctg-primary) 25%, transparent)"}`,
                    }}
                  >
                    {a.tag}
                  </span>
                  <h3
                    className="text-xl sm:text-2xl font-bold mb-2"
                    style={{ color: "var(--ctg-text)" }}
                  >
                    {a.title}
                  </h3>
                  <p
                    className="text-sm mb-4 ctg-line-clamp-2"
                    style={{ color: "var(--ctg-text-secondary)" }}
                  >
                    {a.desc}
                  </p>
                  <div
                    className="flex items-center gap-4 text-xs font-medium"
                    style={{ color: "var(--ctg-text-secondary)" }}
                  >
                    <span className="flex items-center gap-1">
                      <HiOutlineClock className="w-3.5 h-3.5" /> {a.hours}
                    </span>
                    <span className="flex items-center gap-1">
                      <HiOutlineTicket className="w-3.5 h-3.5" /> {a.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Getting Around ---- */}
      <section
        className="py-20 sm:py-32"
        style={{ background: "var(--ctg-bg)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-10 sm:mb-16 text-center"
            style={{ color: "var(--ctg-text)" }}
          >
            Getting Around
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <MdOutlineFlight className="w-8 h-8" />,
                title: "Airports",
                desc: "International Hub (30m drive). Shuttle buses run every 15 mins from terminal 1 & 2.",
                link: "View Flight Status",
              },
              {
                icon: <MdOutlineDirectionsBus className="w-8 h-8" />,
                title: "Local Buses",
                desc: "24/7 coverage. Use the 'CityPass' card for contactless payment across all lines.",
                link: "Live Map",
              },
              {
                icon: <MdOutlineTrain className="w-8 h-8" />,
                title: "Train Stations",
                desc: "Central Station connects to all major surrounding cities. High-speed rail available.",
                link: "Schedules",
              },
              {
                icon: <MdOutlineLocalTaxi className="w-8 h-8" />,
                title: "Taxis",
                desc: "Hailing apps are widely supported. Official city taxis are silver with blue decals.",
                link: "Booking Apps",
              },
            ].map((t) => (
              <div
                key={t.title}
                className="ctg-ambient p-6 sm:p-8 rounded-2xl border"
                style={{
                  background: "var(--ctg-surface)",
                  borderColor: "var(--ctg-border)",
                }}
              >
                <div className="mb-6" style={{ color: "var(--ctg-primary)" }}>
                  {t.icon}
                </div>
                <h3
                  className="text-lg sm:text-xl font-bold mb-3"
                  style={{ color: "var(--ctg-text)" }}
                >
                  {t.title}
                </h3>
                <p
                  className="text-sm mb-6"
                  style={{ color: "var(--ctg-text-secondary)" }}
                >
                  {t.desc}
                </p>
                <a
                  href="#"
                  className="text-sm font-semibold flex items-center gap-2 hover:translate-x-1 transition-transform"
                  style={{ color: "var(--ctg-primary)" }}
                >
                  {t.link} <HiOutlineArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Taste the City ---- */}
      <section
        className="py-20 sm:py-32 border-y"
        style={{
          background: "var(--ctg-bg)",
          borderColor: "var(--ctg-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-10 sm:mb-16">
            <h2
              className="text-3xl sm:text-4xl font-extrabold"
              style={{ color: "var(--ctg-text)" }}
            >
              Taste the City
            </h2>
            <div className="flex gap-2">
              <button
                className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors"
                style={{
                  background: "var(--ctg-surface-high)",
                  borderColor: "var(--ctg-border)",
                  color: "var(--ctg-text)",
                }}
              >
                <HiOutlineChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors"
                style={{
                  background: "var(--ctg-surface-high)",
                  borderColor: "var(--ctg-border)",
                  color: "var(--ctg-text)",
                }}
              >
                <HiOutlineChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                img: "/assets/images/city-travel-guide/food1.png",
                cat: "Fine Dining",
                title: "Azure Heights",
                desc: "Fusion cuisine with a panoramic 360° view of the urban landscape.",
                location: "Sky Tower, Floor 42",
                rating: "4.9",
              },
              {
                img: "/assets/images/city-travel-guide/food2.png",
                cat: "Cafe & Bakery",
                title: "The Roasted Bean",
                desc: "Artisanal coffee and pastries made fresh every morning by local chefs.",
                location: "15 Baker St",
                rating: "4.8",
              },
              {
                img: "/assets/images/city-travel-guide/food3.png",
                cat: "Japanese",
                title: "Sakura Soul",
                desc: "Traditional sushi and ramen in an authentic, tranquil atmosphere.",
                location: "Downtown East",
                rating: "4.6",
              },
              {
                img: "/assets/images/city-travel-guide/food4.png",
                cat: "Quick Bites",
                title: "Urban Grill",
                desc: "Gourmet burgers and street food classics for travelers on the go.",
                location: "Market Square",
                rating: "4.5",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="ctg-ambient rounded-2xl overflow-hidden border flex flex-col"
                style={{
                  background: "var(--ctg-surface)",
                  borderColor: "var(--ctg-border)",
                }}
              >
                <div className="h-48 overflow-hidden relative">
                  <Image
                    src={f.img}
                    alt={f.title}
                    fill
                    className="object-cover"
                  />
                  <div
                    className="absolute top-3 right-3 px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur-sm"
                    style={{
                      background:
                        "color-mix(in srgb, var(--ctg-bg) 80%, transparent)",
                    }}
                  >
                    <HiOutlineStar className="w-3.5 h-3.5 text-yellow-500" />
                    <span
                      className="text-xs font-bold"
                      style={{ color: "var(--ctg-text)" }}
                    >
                      {f.rating}
                    </span>
                  </div>
                </div>
                <div className="p-5 sm:p-6 flex-grow flex flex-col">
                  <span
                    className="text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: "var(--ctg-primary)" }}
                  >
                    {f.cat}
                  </span>
                  <h4
                    className="font-bold text-lg mb-2"
                    style={{ color: "var(--ctg-text)" }}
                  >
                    {f.title}
                  </h4>
                  <p
                    className="text-sm mb-4"
                    style={{ color: "var(--ctg-text-secondary)" }}
                  >
                    {f.desc}
                  </p>
                  <div
                    className="mt-auto flex items-center gap-2 text-xs"
                    style={{ color: "var(--ctg-text-secondary)" }}
                  >
                    <HiOutlineMapPin className="w-3.5 h-3.5" /> {f.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Journey Through Time ---- */}
      <section
        className="py-20 sm:py-32"
        style={{ background: "var(--ctg-bg)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-4"
            style={{ color: "var(--ctg-text)" }}
          >
            Journey Through Time
          </h2>
          <p
            className="text-sm sm:text-base mb-10 sm:mb-16 max-w-2xl mx-auto"
            style={{ color: "var(--ctg-text-secondary)" }}
          >
            From a small trading outpost to a bustling metropolis—discover the
            stories that shaped us.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                year: "1748",
                title: "Founding",
                desc: "Powered by maritime explorers on the banks of the Silver River as a seasonal trading hub.",
                highlight: false,
              },
              {
                year: "1892",
                title: "The Great Expansion",
                desc: "Arrival of the first locomotive line transformed the city into an industrial powerhouse.",
                highlight: false,
              },
              {
                year: "1955",
                title: "Cultural Renaissance",
                desc: "Modernist architecture swept the downtown area, giving rise to its iconic skylines.",
                highlight: true,
              },
              {
                year: "2024",
                title: "Digital Era",
                desc: "Today, we lead in smart city innovation while preserving our deep historical roots.",
                highlight: false,
              },
            ].map((t) => (
              <div
                key={t.year}
                className="ctg-ambient rounded-2xl p-5 sm:p-8 border text-left"
                style={{
                  background: t.highlight
                    ? "var(--ctg-primary-muted)"
                    : "var(--ctg-surface)",
                  borderColor: t.highlight
                    ? "color-mix(in srgb, var(--ctg-primary) 25%, transparent)"
                    : "var(--ctg-border)",
                }}
              >
                <span
                  className="text-3xl sm:text-4xl font-black block mb-3"
                  style={{ color: "var(--ctg-primary)" }}
                >
                  {t.year}
                </span>
                <h3
                  className="font-bold text-base sm:text-lg mb-2"
                  style={{ color: "var(--ctg-text)" }}
                >
                  {t.title}
                </h3>
                <p
                  className="text-xs sm:text-sm leading-relaxed"
                  style={{ color: "var(--ctg-text-secondary)" }}
                >
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Essential Services ---- */}
      <section
        className="py-20 sm:py-32 border-t"
        style={{
          background: "var(--ctg-bg)",
          borderColor: "var(--ctg-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-10 sm:mb-16"
            style={{ color: "var(--ctg-text)" }}
          >
            Essential Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <HiOutlineShieldCheck className="w-6 h-6" />,
                title: "Police",
                desc: "Dial 911 for emergencies, downtown.",
                color: "#ef4444",
              },
              {
                icon: <MdOutlineLocalHospital className="w-6 h-6" />,
                title: "Hospitals",
                desc: "General Medical, 24h ER.",
                color: "#ef4444",
              },
              {
                icon: <HiOutlineInformationCircle className="w-6 h-6" />,
                title: "Tourist Info",
                desc: "Visitor Center at Central Mall.",
                color: "#22c55e",
              },
              {
                icon: <HiOutlineWifi className="w-6 h-6" />,
                title: "City Wi-Fi",
                desc: "Free public access in hotspots.",
                color: "var(--ctg-primary)",
              },
            ].map((s) => (
              <div
                key={s.title}
                className="ctg-ambient rounded-2xl p-5 sm:p-6 border flex items-start gap-4"
                style={{
                  background: "var(--ctg-surface)",
                  borderColor: "var(--ctg-border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: `color-mix(in srgb, ${s.color} 12%, transparent)`,
                    color: s.color,
                  }}
                >
                  {s.icon}
                </div>
                <div>
                  <h3
                    className="font-bold text-sm mb-1"
                    style={{ color: "var(--ctg-text)" }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: "var(--ctg-text-secondary)" }}
                  >
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer
        className="border-t py-12 sm:py-16"
        style={{
          background: "var(--ctg-surface)",
          borderColor: "var(--ctg-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <span
                className="text-xl font-bold block mb-3"
                style={{ color: "var(--ctg-primary)" }}
              >
                CityGuide
              </span>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--ctg-text-secondary)" }}
              >
                Your ultimate companion for navigating the city&rsquo;s pulse.
                From hidden alleys to skyscraper summits.
              </p>
            </div>
            <div>
              <h4
                className="font-bold text-sm mb-4"
                style={{ color: "var(--ctg-text)" }}
              >
                Quick Links
              </h4>
              <ul className="space-y-2">
                {[
                  "Privacy Policy",
                  "Terms of Service",
                  "Accessibility",
                  "Sitemap",
                ].map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm hover:opacity-80 transition-opacity"
                      style={{ color: "var(--ctg-text-secondary)" }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4
                className="font-bold text-sm mb-4"
                style={{ color: "var(--ctg-text)" }}
              >
                Social Media
              </h4>
              <div className="flex gap-3">
                {["X", "IG", "FB"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold transition-colors"
                    style={{
                      borderColor: "var(--ctg-border)",
                      color: "var(--ctg-text-secondary)",
                    }}
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4
                className="font-bold text-sm mb-4"
                style={{ color: "var(--ctg-text)" }}
              >
                Newsletter
              </h4>
              <p
                className="text-xs mb-3"
                style={{ color: "var(--ctg-text-secondary)" }}
              >
                Stay updated on city events and more.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 rounded-lg px-3 py-2 text-sm border outline-none"
                  style={{
                    background: "var(--ctg-surface-high)",
                    borderColor: "var(--ctg-border)",
                    color: "var(--ctg-text)",
                  }}
                />
                <button
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ background: "var(--ctg-primary)" }}
                >
                  <HiOutlineArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div
            className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4"
            style={{ borderColor: "var(--ctg-border)" }}
          >
            <p
              className="text-xs"
              style={{ color: "var(--ctg-text-secondary)" }}
            >
              &copy; 2026 City Tourism Portal. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-xs hover:opacity-80"
                style={{ color: "var(--ctg-text-secondary)" }}
              >
                Contact Us: support@cityguide.com
              </a>
              <a
                href="#"
                className="text-xs hover:opacity-80"
                style={{ color: "var(--ctg-text-secondary)" }}
              >
                Emergency: 911
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Theme Switcher (scoped to CityGuide colors)                        */
/* ------------------------------------------------------------------ */

const themeOptions = [
  { value: "light" as const, label: "Light", icon: HiOutlineSun },
  { value: "dark" as const, label: "Dark", icon: HiOutlineMoon },
  { value: "system" as const, label: "System", icon: HiOutlineComputerDesktop },
];

function CtgThemeSwitcher() {
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
          borderColor: "var(--ctg-border)",
          color: "var(--ctg-text-secondary)",
        }}
      >
        <ActiveIcon className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-36 overflow-hidden rounded-xl border z-[60]"
          style={{
            borderColor: "var(--ctg-border)",
            background: "var(--ctg-surface)",
            boxShadow: "var(--ctg-card-shadow)",
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
                    ? "var(--ctg-surface-high)"
                    : "transparent",
                  color: isActive
                    ? "var(--ctg-text)"
                    : "var(--ctg-text-secondary)",
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
