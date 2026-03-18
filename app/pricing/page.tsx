"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/landing-page/navbar";
import { Footer } from "@/components/landing-page/footer";
import { Button } from "@/components/ui/button";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

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
      "Get started with vibe coding and create your first live voice agents.",
    features: [
      { label: "1,000 credits / month", included: true },
      { label: "Access to standard voice models", included: true },
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
      "For creators building and deploying live voice apps at scale.",
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
      "For teams collaborating on voice agents and sharing resources.",
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
      "Custom solutions for organizations with high-volume or specialized needs.",
    features: [
      { label: "Volume credit discounts", included: true },
      { label: "SLA & uptime guarantee", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "SSO & custom integrations", included: true },
    ],
    cta: "Contact Sales",
  },
];

type FeatureRow = {
  label: string;
  values: (boolean | string)[];
};

type FeatureGroup = {
  category: string;
  rows: FeatureRow[];
};

type FaqItem = {
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    question: "What is vibe coding?",
    answer:
      "Vibe coding is a developer-centric approach to building AI agents using intuitive prompting and real-time feedback loops. It focuses on the 'feel' and 'personality' of the interaction rather than just rigid logic, allowing for more natural human-AI synergy.",
  },
  {
    question: "Can I export my voice agents?",
    answer:
      "Yes, all agents built on Stridify can be exported as a zip file containing the agent code and clear instructions for deployment and integration. Pro users also get access to raw model weights for custom-trained voices.",
  },
  {
    question: "How does pricing work for high-volume apps?",
    answer:
      "For applications scaling beyond the Pro tier, we offer usage-based billing at wholesale rates. Our Enterprise plan includes volume tiers that lower your cost-per-prompt as your traffic increases. Contact our sales team for a custom quote.",
  },
  {
    question: "Is there a discount for open-source projects?",
    answer:
      "Absolutely. We believe in the power of the open community. Verified open-source contributors and non-profits can apply for a 50% discount on the Pro plan or free Enterprise credits.",
  },
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes — all plans are flexible. You can upgrade, downgrade, or cancel at any time. Changes take effect immediately and billing is prorated automatically.",
  },
];

const featureGroups: FeatureGroup[] = [
  {
    category: "Usage",
    rows: [
      {
        label: "Credits per month",
        values: ["1,000", "10,000", "100,000", "Custom"],
      },
      { label: "Concurrent agents", values: ["1", "10", "25", "Unlimited"] },
      {
        label: "Current agent user limit",
        values: ["1", "1", "5", "Unlimited"],
      },
      {
        label: "Cloud deployment included",
        values: [false, true, true, true],
      },
      { label: "Storage", values: ["500 MB", "10 GB", "50 GB", "Custom"] },
    ],
  },
  {
    category: "Voice & Models",
    rows: [
      {
        label: "Access to standard voice models",
        values: [true, true, true, true],
      },
      { label: "Custom voice models", values: [false, true, true, true] },
      { label: "Custom voice training", values: [false, true, true, true] },
      { label: "Multilingual support", values: [false, true, true, true] },
    ],
  },
  {
    category: "Collaboration",
    rows: [
      { label: "Up to 5 team members", values: [false, false, true, true] },
      { label: "Everything in Pro", values: [false, true, true, true] },
      { label: "Shared agent workspace", values: [false, false, true, true] },
      { label: "Team usage analytics", values: [false, false, true, true] },
    ],
  },
  {
    category: "Platform",
    rows: [
      {
        label: "Advanced platform features",
        values: [false, true, true, true],
      },
      { label: "Priority platform access", values: [false, false, true, true] },
      { label: "Custom integrations", values: [false, false, true, true] },
      {
        label: "SSO & custom integrations",
        values: [false, false, false, true],
      },
      { label: "Audit logs", values: [false, false, true, true] },
    ],
  },
  {
    category: "Support",
    rows: [
      { label: "Community support", values: [true, true, true, true] },
      { label: "Priority support", values: [false, true, true, true] },
      { label: "Volume credit discounts", values: [false, false, false, true] },
      { label: "SLA & uptime guarantee", values: [false, false, false, true] },
      {
        label: "Dedicated account manager",
        values: [false, false, false, true],
      },
      { label: "Onboarding assistance", values: [false, false, true, true] },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState("Professional");

  return (
    <>
      <div className="noise-overlay" />
      <Navbar />

      <main className="relative pb-24 pt-16">
        {/* Header */}
        <section className="mx-auto max-w-3xl px-6 text-center">
          <Link
            href="/"
            data-aos="fade-right"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
            Compare plans
          </h1>
          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground"
          >
            All plans include core platform access. Pick the one that matches
            your scale and unlock more as you grow.
          </p>
        </section>

        {/* Plan cards */}
        <section className="mx-auto mt-16 max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, i) => {
              const isSelected = selectedPlan === plan.name;
              return (
                <div
                  key={plan.name}
                  role="button"
                  tabIndex={0}
                  data-aos="fade-up"
                  data-aos-delay={String(i * 100)}
                  onClick={() => setSelectedPlan(plan.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPlan(plan.name);
                    }
                  }}
                  className={[
                    "glass-card relative flex flex-col items-center rounded-xl p-8 text-center transition-all cursor-pointer",
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
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.suffix && (
                      <span className="text-muted-foreground">
                        {plan.suffix}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {plan.description}
                  </p>

                  {/* Features */}
                  <ul className="mt-6 w-full space-y-3 text-left">
                    {plan.features.map((f) => (
                      <li
                        key={f.label}
                        className="flex items-center gap-2.5 text-sm"
                      >
                        {f.included ? (
                          <CheckIcon className="h-4 w-4 shrink-0 text-foreground" />
                        ) : (
                          <XIcon className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                        )}
                        <span
                          className={
                            f.included ? "" : "text-muted-foreground/50"
                          }
                        >
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 w-full">
                    {isSelected ? (
                      <Button
                        size="lg"
                        className="w-full rounded-lg bg-foreground text-background hover:bg-foreground/80"
                      >
                        {plan.cta}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full rounded-lg"
                      >
                        {plan.cta}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Comparison table */}
        <section className="mx-auto mt-24 max-w-7xl px-6">
          <h2
            data-aos="fade-up"
            className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl"
          >
            Feature comparison
          </h2>

          {/* Desktop table */}
          <div
            data-aos="fade-up"
            data-aos-delay="150"
            className="hidden md:block overflow-x-auto"
          >
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-4 text-left font-medium text-muted-foreground" />
                  {plans.map((plan) => (
                    <th
                      key={plan.name}
                      className={[
                        "pb-4 text-center font-semibold",
                        selectedPlan === plan.name ? "text-primary" : "",
                      ].join(" ")}
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>

              {featureGroups.map((group) => (
                <tbody key={group.category}>
                  <tr>
                    <td
                      colSpan={5}
                      className="pb-3 pt-8 text-xs font-bold uppercase tracking-widest text-muted-foreground"
                    >
                      {group.category}
                    </td>
                  </tr>
                  {group.rows.map((row) => (
                    <tr
                      key={row.label}
                      className="border-b border-border/50 last:border-b-0"
                    >
                      <td className="py-3.5 pr-4 text-muted-foreground">
                        {row.label}
                      </td>
                      {row.values.map((val, i) => (
                        <td key={i} className="py-3.5 text-center">
                          <CellValue value={val} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>

          {/* Mobile stacked view */}
          <div className="space-y-10 md:hidden">
            {plans.map((plan, planIdx) => (
              <div key={plan.name} className="glass-card rounded-xl p-6">
                <h3 className="mb-6 text-center text-lg font-bold">
                  {plan.name}
                </h3>
                {featureGroups.map((group) => (
                  <div key={group.category} className="mb-6 last:mb-0">
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {group.category}
                    </p>
                    <ul className="space-y-3">
                      {group.rows.map((row) => (
                        <li
                          key={row.label}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {row.label}
                          </span>
                          <CellValue value={row.values[planIdx]} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
        {/* FAQ */}
        <section className="mx-auto mt-24 max-w-3xl px-6">
          <h2
            data-aos="fade-up"
            className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl"
          >
            Frequently Asked Questions
          </h2>
          <div
            data-aos="fade-up"
            data-aos-delay="150"
            className="divide-y divide-border"
          >
            {faqs.map((faq) => (
              <FaqRow key={faq.question} faq={faq} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="font-medium">{value}</span>;
  }
  return value ? (
    <CheckIcon className="mx-auto h-4 w-4 text-foreground" />
  ) : (
    <MinusIcon className="mx-auto h-4 w-4 text-muted-foreground/30" />
  );
}

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

function FaqRow({ faq }: { faq: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="py-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left text-lg font-medium transition-colors hover:text-foreground"
      >
        <span>{faq.question}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className={`accordion-body ${open ? "open" : ""}`}>
        <div>
          <p className="pt-4 leading-relaxed text-muted-foreground">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

function MinusIcon({ className }: { className?: string }) {
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
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
