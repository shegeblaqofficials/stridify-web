"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Feature = {
  label: string;
  included: boolean;
};

type Plan = {
  name: string;
  price: string;
  suffix?: string;
  description: string;
  features: Feature[];
  cta: string;
  highlighted?: boolean;
};

const plans: Plan[] = [
  {
    name: "Starter",
    price: "$0",
    suffix: "/mo",
    description:
      "Build your first voice agent for free, perfect for experimenting.",
    features: [
      { label: "1,000 credits / month", included: true },
      { label: "Access to standard voice models", included: true },
      { label: "Community support", included: true },
      { label: "Custom voice training", included: false },
      { label: "Priority platform access", included: false },
    ],
    cta: "Start for free",
  },
  {
    name: "Professional",
    price: "$29",
    suffix: "/mo",
    description:
      "For builders shipping voice agents to real users, with cloud hosting, and priority support.",
    features: [
      { label: "10,000 credits / month", included: true },
      { label: "Custom voice models", included: true },
      { label: "Advanced platform features", included: true },
      { label: "Priority support", included: true },
      { label: "Cloud deployment included", included: true },
    ],
    cta: "Get Pro",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$79",
    suffix: "/mo",
    description:
      "For teams building multiple agents together with shared workspaces and usage insights.",
    features: [
      { label: "100,000 credits / month", included: true },
      { label: "Everything in Pro", included: true },
      { label: "Up to 5 team members", included: true },
      { label: "Shared agent workspace", included: true },
      { label: "Team usage analytics", included: true },
    ],
    cta: "Get Team",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description:
      "For organizations running voice agents at scale with dedicated support and custom SLAs.",
    features: [
      { label: "Volume credit discounts", included: true },
      { label: "SLA & uptime guarantee", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "SSO & custom integrations", included: true },
      { label: "Custom voice model support", included: true },
    ],
    cta: "Contact Sales",
  },
];

export function PricingSection() {
  const [selectedPlan, setSelectedPlan] = useState("Professional");

  return (
    <section id="pricing" className="px-6 py-24 bg-section-alt">
      {/* Header */}
      <div data-aos="fade-up" className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
          Pricing that grows with you.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Start free, build your first voice agent today, and scale to
          production when you’re ready. No surprise fees.
        </p>
      </div>

      {/* Cards */}
      <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, i) => (
          <div
            key={plan.name}
            data-aos="fade-up"
            data-aos-delay={String(i * 100)}
          >
            <PricingCard
              plan={plan}
              isSelected={selectedPlan === plan.name}
              onSelect={() => setSelectedPlan(plan.name)}
            />
          </div>
        ))}
      </div>

      {/* Compare CTA */}
      <div data-aos="fade-up" className="mx-auto mt-14 max-w-xl text-center">
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="text-foreground">
            All plans are flexible — upgrade, downgrade, or cancel anytime. No
            lock-in, no hidden fees.
          </span>
        </p>
        <Link
          href="/pricing"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold transition-all hover:border-muted-foreground/50 hover:shadow-sm"
        >
          Compare all features
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
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

function PricingCard({
  plan,
  isSelected,
  onSelect,
}: {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      onClick={onSelect}
      className={[
        "glass-card relative flex cursor-pointer flex-col rounded-xl p-8 transition-all",
        isSelected
          ? "border-primary shadow-[0_0_30px_rgba(17,82,212,0.12)] ring-1 ring-primary/30"
          : "hover:border-muted-foreground/30",
      ].join(" ")}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-accent-foreground">
          Most Popular
        </span>
      )}

      {/* Plan info */}
      <div className="mb-8">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {plan.name}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{plan.price}</span>
          {plan.suffix && (
            <span className="text-muted-foreground">{plan.suffix}</span>
          )}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {plan.description}
        </p>
      </div>

      {/* Features */}
      <ul className="mb-8 grow space-y-4">
        {plan.features.map((f) => (
          <li key={f.label} className="flex items-center gap-3 text-sm">
            {f.included ? (
              <CheckIcon className="h-4 w-4 shrink-0 text-foreground" />
            ) : (
              <XIcon className="h-4 w-4 shrink-0 text-muted-foreground/40" />
            )}
            <span className={f.included ? "" : "text-muted-foreground/50"}>
              {f.label}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <>
        {isSelected ? (
          <Button
            size="lg"
            className="w-full rounded-lg bg-foreground text-background hover:bg-foreground/80"
          >
            {plan.cta}
          </Button>
        ) : (
          <Button variant="outline" size="lg" className="w-full rounded-lg">
            {plan.cta}
          </Button>
        )}
      </>
    </article>
  );
}

/* Inline icons */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
