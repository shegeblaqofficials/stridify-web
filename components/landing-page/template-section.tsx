"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "@/provider/account-provider";
import { AuthModal } from "@/components/auth/auth-modal";
import {
  HiOutlineBuildingOffice2,
  HiOutlineShoppingBag,
  HiOutlineArrowRight,
  HiOutlineArrowPathRoundedSquare,
  HiOutlinePlay,
  HiOutlineCpuChip,
  HiOutlineBookOpen,
} from "react-icons/hi2";
import type { ComponentType } from "react";

type Template = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  active: boolean;
};

const templates: Template[] = [
  {
    id: "1a43ds8pqw",
    name: "City Travel Guide",
    slug: "city-travel-guide",
    category: "Travel",
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
];

export function TemplateSection() {
  const { account, user } = useAccount();
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const handleRemix = (templateId: string) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    router.push(`/project/${templateId}?remix=true`);
  };

  return (
    <>
      <section
        id="templates"
        className="mx-auto w-full max-w-6xl px-6 py-24 md:py-32"
      >
        <div
          data-aos="fade-up"
          className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Templates
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Start from a template
            </h2>
            <p className="mt-3 max-w-md text-base text-muted-foreground leading-relaxed">
              Explore agents built by the community. Remix any template to make
              it your own.
            </p>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
          >
            View all
            <HiOutlineArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((t, i) => (
            <div key={t.id} data-aos="fade-up" data-aos-delay={String(i * 80)}>
              <TemplateCard template={t} onRemix={handleRemix} />
            </div>
          ))}
        </div>
      </section>
      <AuthModal open={authOpen} onClose={closeAuth} />
    </>
  );
}

function TemplateCard({
  template,
  onRemix,
}: {
  template: Template;
  onRemix: (id: string) => void;
}) {
  const Icon = template.icon;
  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-surface transition-all hover:border-foreground/20 hover:shadow-sm">
      {/* Visual header */}
      <div className="relative flex h-28 items-center justify-center rounded-t-2xl bg-surface-elevated">
        <Icon className="h-8 w-8 text-muted-foreground/30 transition-transform group-hover:scale-110" />
        {template.active && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10">
            <div className="size-1 rounded-full bg-green-500" />
            <span className="text-[8px] font-medium text-green-600 dark:text-green-400">
              Live
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {template.category}
        </p>
        <h3 className="mb-1.5 text-sm font-semibold">{template.name}</h3>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {template.description}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onRemix(template.id)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium transition-all hover:bg-foreground hover:text-background hover:border-foreground active:scale-[0.98]"
          >
            <HiOutlineArrowPathRoundedSquare className="h-3.5 w-3.5" />
            Remix
          </button>
          {template.active ? (
            <Link
              href={`/discover/${template.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium transition-all hover:bg-foreground hover:text-background hover:border-foreground active:scale-[0.98]"
            >
              <HiOutlinePlay className="h-3.5 w-3.5" />
              Try
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground/40 cursor-not-allowed">
              <HiOutlinePlay className="h-3.5 w-3.5" />
              Try
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
