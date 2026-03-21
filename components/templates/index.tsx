"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing-page/navbar";
import { Footer } from "@/components/landing-page/footer";
import {
  HiOutlineBuildingOffice2,
  HiOutlineShoppingBag,
  HiOutlineAcademicCap,
  HiOutlineSpeakerWave,
  HiOutlineChartBarSquare,
  HiOutlineCpuChip,
  HiOutlineBookOpen,
  HiOutlineDocumentText,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPathRoundedSquare,
  HiOutlinePlay,
} from "react-icons/hi2";
import type { ComponentType } from "react";
import { useAccount } from "@/provider/account-provider";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth/auth-modal";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

type Template = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  active: boolean;
};

const categories = [
  "All",
  "Customer Support",
  "Hospitality",
  "Telephony",
  "Creative",
  "Enterprise",
  "Utilities",
] as const;

const allTemplates: Template[] = [
  {
    id: "1a43ds8pqw",
    name: "City Travel Guide",
    slug: "city-travel-guide",
    category: "Hospitality",
    icon: HiOutlineBuildingOffice2,
    description:
      "A conversational voice tour guide for a city. Provides information on landmarks, directions, and local tips to tourists.",
    active: true,
  },
  {
    id: "2b34ds9qwe",
    name: "Restaurant Assistant",
    slug: "restaurant-assistant",
    category: "Telephony",
    icon: HiOutlineCpuChip,
    description:
      "An agent that answers the phone to help customers check reservations and bookings. It can handle inquiries about menu, hours, and location.",
    active: true,
  },
  {
    id: "3c56df7asd",
    name: "Language Practice Coach",
    slug: "language-practice-coach",
    category: "Creative",
    icon: HiOutlineBookOpen,
    description:
      "A voice AI agent that helps users practice speaking a new language through live and interactive conversation.",
    active: true,
  },
  {
    id: "4d78gh6fgh",
    name: "Product Advisor",
    slug: "product-advisor",
    category: "Customer Support",
    icon: HiOutlineShoppingBag,
    description:
      "An assistant that helps users choose the right product, provide recommendations, and guide users through the buying process.",
    active: true,
  },
  {
    id: "5e89jk7hij",
    name: "Business FAQ Phone Agent",
    slug: "business-faq-phone-agent",
    category: "Customer Support",
    icon: HiOutlineChartBarSquare,
    description:
      "Handles common business inquiries, answers FAQs, and provides instant voice support to callers 24/7.",
    active: false,
  },
  {
    id: "6f90lm8nop",
    name: "Knowledge Voice Hub",
    slug: "knowledge-voice-hub",
    category: "Enterprise",
    icon: HiOutlineCpuChip,
    description:
      "Answers employee calls, indexes workspace info, and provides live voice support instantly.",
    active: false,
  },
  {
    id: "7g01no9pqr",
    name: "Report Voice Generator",
    slug: "report-voice-generator",
    category: "Utilities",
    icon: HiOutlineDocumentText,
    description:
      "Calls managers, delivers weekly reports, and summarizes performance via live voice.",
    active: false,
  },
  {
    id: "8h12op0stu",
    name: "Course Voice Advisor",
    slug: "course-voice-advisor",
    category: "Creative",
    icon: HiOutlineAcademicCap,
    description:
      "Advises students by phone, checks prerequisites, and plans academic paths in real time.",
    active: false,
  },
  {
    id: "9i23pq1vwx",
    name: "Voice Coaching Agent",
    slug: "voice-coaching-agent",
    category: "Customer Support",
    icon: HiOutlineSpeakerWave,
    description:
      "Coaches users live, gives feedback on calls, and improves speaking skills in real time.",
    active: false,
  },
  {
    id: "0j34qr2xyz",
    name: "Event Voice Coordinator",
    slug: "event-voice-coordinator",
    category: "Hospitality",
    icon: HiOutlineBuildingOffice2,
    description:
      "Manages event logistics, RSVPs, and vendor calls, updating schedules by voice instantly.",
    active: false,
  },
  {
    id: "1k45rs3abc",
    name: "Voice Survey Conductor",
    slug: "voice-survey-conductor",
    category: "Enterprise",
    icon: HiOutlineChartBarSquare,
    description:
      "Conducts live voice surveys, collects feedback, and provides real-time insights to businesses.",
    active: false,
  },
  {
    id: "2l56st4def",
    name: "Personal Finance Assistant",
    slug: "personal-finance-voice-assistant",
    category: "Utilities",
    icon: HiOutlineDocumentText,
    description:
      "Provides financial advice, tracks expenses, and answers money-related questions via live voice.",
    active: false,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Templates() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const { account, user } = useAccount();
  const [authOpen, setAuthOpen] = useState(false);
  const closeAuth = useCallback(() => setAuthOpen(false), []);
  const router = useRouter();

  const handleRemix = (templateId: string) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    router.push(`/project/${templateId}?remix=true`);
  };

  const filtered = useMemo(() => {
    return allTemplates.filter((t) => {
      const matchesCategory =
        activeCategory === "All" || t.category === activeCategory;
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <>
      <div className="noise-overlay" />
      <Navbar />

      <main className="relative pb-24 pt-16">
        <section className="mx-auto max-w-7xl px-6">
          {/* Header row */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <Link
                href="/home"
                data-aos="fade-right"
                className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
                Back to home
              </Link>
              <h1
                data-aos="fade-up"
                data-aos-delay="100"
                className="text-4xl font-bold tracking-tight md:text-5xl"
              >
                Explore Templates
              </h1>
              <p
                data-aos="fade-up"
                data-aos-delay="200"
                className="mt-4 max-w-lg text-lg text-muted-foreground"
              >
                Deploy high-performance AI agents in seconds with our curated
                library of industry-standard templates.
              </p>
            </div>

            {/* Search */}
            <div
              data-aos="fade-left"
              data-aos-delay="200"
              className="relative w-full md:mt-12 md:w-72 lg:w-80"
            >
              <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Category pills */}
          <div
            data-aos="fade-up"
            data-aos-delay="300"
            className="mt-10 flex flex-wrap gap-2.5"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={[
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                  activeCategory === cat
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground",
                ].join(" ")}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Template grid */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((template, i) => (
              <div
                key={template.name}
                data-aos="fade-up"
                data-aos-delay={String(Math.min(i * 80, 400))}
              >
                <TemplateCard template={template} onRemix={handleRemix} />
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-lg text-muted-foreground">
                No templates found. Try a different search or category.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
      <AuthModal open={authOpen} onClose={closeAuth} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Template Card                                                      */
/* ------------------------------------------------------------------ */

function TemplateCard({
  template,
  onRemix,
}: {
  template: Template;
  onRemix: (id: string) => void;
}) {
  const Icon = template.icon;

  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-surface/40 transition-all hover:border-primary/50 hover:bg-surface/60 hover:shadow-[0_0_30px_rgba(17,82,212,0.10)] hover:ring-1 hover:ring-primary/20">
      {/* Visual header */}
      <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-t-2xl bg-surface-elevated/50">
        <Icon className="h-10 w-10 text-muted-foreground/20 transition-transform group-hover:scale-110" />
        <Waveform
          active={template.active}
          className="absolute bottom-3 right-3"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {template.category}
        </p>
        <h3 className="mb-1.5 text-base font-bold">{template.name}</h3>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
          {template.description}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onRemix(template.id)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface-elevated/30 px-5 py-2 text-xs font-bold whitespace-nowrap transition-all hover:bg-foreground hover:text-background active:scale-[0.98]"
          >
            <HiOutlineArrowPathRoundedSquare className="h-3.5 w-3.5" />
            Remix
          </button>
          <button
            type="button"
            disabled={!template.active}
            onClick={() => {}}
            className={[
              "inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface-elevated/30 px-5 py-2 text-xs font-bold transition-all",
              template.active
                ? "hover:bg-foreground hover:text-background active:scale-[0.98]"
                : "text-muted-foreground/30 cursor-not-allowed",
            ].join(" ")}
          >
            <HiOutlinePlay className="h-3.5 w-3.5" />
            Try Live
          </button>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Waveform                                                           */
/* ------------------------------------------------------------------ */

function Waveform({
  active,
  className = "",
}: {
  active: boolean;
  className?: string;
}) {
  const heights = active
    ? ["h-2", "h-5", "h-3", "h-4", "h-2"]
    : ["h-3", "h-3", "h-3", "h-3", "h-3"];
  return (
    <div className={`waveform text-primary ${className}`} aria-hidden>
      {heights.map((h, i) => (
        <span
          key={i}
          className={`bar ${h} ${active ? "animate-pulse" : "opacity-40"}`}
        />
      ))}
    </div>
  );
}
