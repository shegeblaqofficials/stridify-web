/**
 * Stripe plans and credit configuration.
 *
 * To adjust pricing: update COST_PER_1K_CREDITS, TOPUP_CREDITS/TOPUP_PRICE_DOLLARS, and plan priceIds.
 * No other files need to change — the webhook uses plan metadata
 * to determine credit grants.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY          — Stripe secret key (sk_live_… or sk_test_…)
 *   STRIPE_WEBHOOK_SECRET      — Webhook signing secret (whsec_…)
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — Publishable key for client-side
 *   NEXT_PUBLIC_APP_URL        — Base URL for redirect (e.g. https://stridify.com)
 *
 * Required Stripe products (create in Stripe Dashboard):
 *   - Professional plan: recurring $29/mo  → set price ID below
 *   - Team plan:         recurring $79/mo  → set price ID below
 *   - Credit top-up:     one-time per unit → set price ID below
 */

/**
 * Credit pricing: $0.55 per 1,000 credits.
 * 1 top-up unit = 50,000 credits @ $27.
 */
export const COST_PER_1K_CREDITS = 0.55;

export interface PlanConfig {
  name: string;
  stripePriceId: string | null;
  priceMonthly: number;
  creditsPerMonth: number;
  isFree: boolean;
}

/**
 * All subscription plans. The key is stored as `organization.plan`.
 * `stripePriceId` must match Stripe Dashboard recurring price IDs.
 */
export const PLANS: Record<string, PlanConfig> = {
  Starter: {
    name: "Starter",
    stripePriceId: null, // free — no Stripe subscription
    priceMonthly: 0,
    creditsPerMonth: 1_000,
    isFree: true,
  },
  Professional: {
    name: "Professional",
    stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL ?? "",
    priceMonthly: 29,
    creditsPerMonth: 10_000,
    isFree: false,
  },
  Team: {
    name: "Team",
    stripePriceId: process.env.STRIPE_PRICE_TEAM ?? "",
    priceMonthly: 79,
    creditsPerMonth: 100_000,
    isFree: false,
  },
};

/** Credit top-up one-time price ID from Stripe Dashboard. */
export const CREDIT_TOPUP_PRICE_ID =
  process.env.STRIPE_PRICE_CREDIT_TOPUP ?? "";

/**
 * How many credits a single top-up unit grants.
 * Stripe price for 1 unit should be set to $27.50.
 */
export const TOPUP_CREDITS = 50_000;
export const TOPUP_PRICE_DOLLARS = 27.5;

/** Look up plan config by Stripe price ID (used in webhook). */
export function getPlanByPriceId(priceId: string): PlanConfig | undefined {
  return Object.values(PLANS).find((p) => p.stripePriceId === priceId);
}
