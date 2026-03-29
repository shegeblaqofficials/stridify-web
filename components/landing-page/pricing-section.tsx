"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/provider/account-provider";

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
    suffix: " per month",
    description:
      "Build your first voice agent for free, perfect for experimenting.",
    features: [
      { label: "1,000 credits per month", included: true },
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
    suffix: " per month",
    description:
      "For builders shipping voice agents to real users, with cloud hosting, and priority support.",
    features: [
      { label: "10,000 credits per month", included: true },
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
    suffix: " per month",
    description:
      "For teams building multiple agents together with shared workspaces and usage insights.",
    features: [
      { label: "100,000 credits per month", included: true },
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
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { account } = useAccount();
  const router = useRouter();

  async function handleCheckout(planName: string) {
    if (planName === "Starter") {
      router.push("/home");
      return;
    }
    if (planName === "Enterprise") {
      window.location.href = "mailto:sales@stridify.com";
      return;
    }
    if (!account) {
      router.push("/?signin=true");
      return;
    }
    setCheckoutLoading(planName);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setCheckoutLoading(null);
    }
  }

  return (
    <section id="pricing" className="px-6 py-24">
      {/* Header */}
      <div data-aos="fade-up" className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium text-muted-foreground mb-4">
          Pricing
        </p>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Pricing that grows with you
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed">
          Start free and scale to production when you're ready. No surprise
          fees.
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
              onCheckout={() => handleCheckout(plan.name)}
              loading={checkoutLoading === plan.name}
            />
          </div>
        ))}
      </div>

      {/* Compare CTA */}
      <div data-aos="fade-up" className="mx-auto mt-14 max-w-xl text-center">
        <p className="text-sm leading-relaxed text-muted-foreground">
          All plans are flexible. Upgrade, downgrade, or cancel anytime.
        </p>
        <Link
          href="/pricing"
          className="mt-4 inline-block text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Compare all features &rarr;
        </Link>
      </div>
    </section>
  );
}

function PricingCard({
  plan,
  isSelected,
  onSelect,
  onCheckout,
  loading,
}: {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
  onCheckout: () => void;
  loading: boolean;
}) {
  return (
    <article
      onClick={onSelect}
      className={[
        "glass-card relative flex cursor-pointer flex-col rounded-xl p-8 transition-all duration-300",
        isSelected
          ? "border-foreground/20 bg-surface-elevated shadow-[0_0_0_1px_var(--foreground)_/_0.08] scale-[1.02]"
          : "hover:border-foreground/15 hover:bg-surface-elevated/50 hover:shadow-sm",
      ].join(" ")}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-foreground/15 bg-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-background">
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
            disabled={loading}
            onClick={(e) => {
              e.stopPropagation();
              onCheckout();
            }}
          >
            {loading ? "Redirecting…" : plan.cta}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="lg"
            className="w-full rounded-lg"
            disabled={loading}
            onClick={(e) => {
              e.stopPropagation();
              onCheckout();
            }}
          >
            {loading ? "Redirecting…" : plan.cta}
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
