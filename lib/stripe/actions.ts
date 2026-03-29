import { stripe } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  PLANS,
  CREDIT_TOPUP_PRICE_ID,
  TOPUP_CREDITS,
  getPlanByPriceId,
} from "./config";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/* ------------------------------------------------------------------ */
/*  Customer                                                           */
/* ------------------------------------------------------------------ */

/** Create a Stripe customer for an organization and persist the ID. */
export async function createStripeCustomer(
  organizationId: string,
  email: string,
  name?: string,
): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { organization_id: organizationId },
  });

  const supabase = createAdminClient();
  await supabase
    .from("organizations")
    .update({
      stripe_customer_id: customer.id,
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId);

  return customer.id;
}

/** Get or create a Stripe customer ID for the org. */
export async function ensureStripeCustomer(
  organizationId: string,
  email: string,
  name?: string,
): Promise<string> {
  const supabase = createAdminClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_customer_id")
    .eq("organization_id", organizationId)
    .single();

  if (org?.stripe_customer_id) return org.stripe_customer_id;

  return createStripeCustomer(organizationId, email, name);
}

/* ------------------------------------------------------------------ */
/*  Checkout Sessions                                                  */
/* ------------------------------------------------------------------ */

/** Create a Stripe Checkout session for a subscription plan. */
export async function createSubscriptionCheckout(
  organizationId: string,
  email: string,
  planName: string,
): Promise<string | null> {
  const plan = PLANS[planName];
  if (!plan || !plan.stripePriceId || plan.isFree) return null;

  const customerId = await ensureStripeCustomer(organizationId, email);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${APP_URL}/settings?tab=billing&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/pricing`,
    subscription_data: {
      metadata: {
        organization_id: organizationId,
        plan_name: planName,
      },
    },
    metadata: {
      organization_id: organizationId,
      plan_name: planName,
    },
  });

  return session.url;
}

/** Create a Stripe Checkout session for a one-time credit top-up. */
export async function createCreditTopupCheckout(
  organizationId: string,
  email: string,
): Promise<string | null> {
  if (!CREDIT_TOPUP_PRICE_ID) return null;

  const customerId = await ensureStripeCustomer(organizationId, email);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: [{ price: CREDIT_TOPUP_PRICE_ID, quantity: 1 }],
    success_url: `${APP_URL}/settings?tab=billing&topup=success`,
    cancel_url: `${APP_URL}/settings?tab=billing`,
    metadata: {
      organization_id: organizationId,
      type: "credit_topup",
      credits: String(TOPUP_CREDITS),
    },
  });

  return session.url;
}

/** Create a Stripe Customer Portal session (manage subscription / invoices). */
export async function createCustomerPortalSession(
  organizationId: string,
  email: string,
): Promise<string | null> {
  const customerId = await ensureStripeCustomer(organizationId, email);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/settings?tab=billing`,
  });

  return session.url;
}

/* ------------------------------------------------------------------ */
/*  Plan Upgrade (swap price on existing subscription)                 */
/* ------------------------------------------------------------------ */

/**
 * Upgrade an existing subscription to a higher plan by swapping the price.
 * If no subscription exists, falls back to creating a new checkout session.
 * Returns a redirect URL (checkout URL for new subs, or null if updated in-place).
 */
export async function upgradeSubscription(
  organizationId: string,
  email: string,
  targetPlanName: string,
): Promise<{ type: "updated" | "checkout"; url?: string }> {
  const targetPlan = PLANS[targetPlanName];
  if (!targetPlan || !targetPlan.stripePriceId || targetPlan.isFree) {
    throw new Error(`Invalid target plan: ${targetPlanName}`);
  }

  const supabase = createAdminClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_subscription_id, stripe_customer_id, plan")
    .eq("organization_id", organizationId)
    .single();

  // No existing subscription — create a new checkout session
  if (!org?.stripe_subscription_id) {
    const url = await createSubscriptionCheckout(
      organizationId,
      email,
      targetPlanName,
    );
    return { type: "checkout", url: url ?? undefined };
  }

  // Retrieve the current subscription to get the item ID
  const subscription = await stripe.subscriptions.retrieve(
    org.stripe_subscription_id,
  );
  const itemId = subscription.items.data[0]?.id;
  if (!itemId) {
    throw new Error("No subscription item found on current subscription");
  }

  // Swap the price on the existing subscription (prorate by default)
  await stripe.subscriptions.update(org.stripe_subscription_id, {
    items: [{ id: itemId, price: targetPlan.stripePriceId }],
    proration_behavior: "create_prorations",
    metadata: {
      organization_id: organizationId,
      plan_name: targetPlanName,
    },
  });

  // Update org immediately (webhook will also fire, but this is faster for UX)
  const { error } = await supabase
    .from("organizations")
    .update({
      plan: targetPlanName,
      is_free_plan: false,
      token_balance: targetPlan.creditsPerMonth,
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId);

  if (error) console.error("[stripe] upgrade org update error:", error.message);
  else
    console.log(
      "[stripe] upgraded org %s to %s",
      organizationId,
      targetPlanName,
    );

  return { type: "updated" };
}

/* ------------------------------------------------------------------ */
/*  Webhook Handlers (called by /api/stripe/webhook)                   */
/* ------------------------------------------------------------------ */

/** Handle a completed checkout session. */
export async function handleCheckoutCompleted(session: {
  metadata: Record<string, string> | null;
  subscription?: string | null;
}) {
  const meta = session.metadata;
  if (!meta?.organization_id) {
    console.error(
      "[stripe] handleCheckoutCompleted: no organization_id in metadata",
      meta,
    );
    return;
  }

  console.log(
    "[stripe] handleCheckoutCompleted org=%s meta=%o",
    meta.organization_id,
    meta,
  );
  const supabase = createAdminClient();

  // Credit top-up (one-time payment)
  if (meta.type === "credit_topup" && meta.credits) {
    const credits = parseInt(meta.credits, 10);
    const { data: org, error: fetchErr } = await supabase
      .from("organizations")
      .select("token_balance")
      .eq("organization_id", meta.organization_id)
      .single();

    if (fetchErr) {
      console.error("[stripe] topup fetch org error:", fetchErr.message);
      return;
    }

    if (org) {
      const { error } = await supabase
        .from("organizations")
        .update({
          token_balance: org.token_balance + credits,
          updated_at: new Date().toISOString(),
        })
        .eq("organization_id", meta.organization_id);

      if (error) console.error("[stripe] topup update error:", error.message);
      else
        console.log(
          "[stripe] topup granted %d credits to org %s",
          credits,
          meta.organization_id,
        );
    }
    return;
  }

  // Subscription checkout — update org with subscription info
  if (session.subscription && meta.plan_name) {
    const plan = PLANS[meta.plan_name];
    if (!plan) {
      console.error("[stripe] unknown plan_name in metadata:", meta.plan_name);
      return;
    }

    const { error } = await supabase
      .from("organizations")
      .update({
        stripe_subscription_id: session.subscription,
        subscription_status: "active",
        is_subscribed: true,
        is_free_plan: false,
        plan: meta.plan_name,
        token_balance: plan.creditsPerMonth,
        updated_at: new Date().toISOString(),
      })
      .eq("organization_id", meta.organization_id);

    if (error)
      console.error(
        "[stripe] subscription checkout update error:",
        error.message,
      );
    else
      console.log(
        "[stripe] subscription activated for org %s plan=%s",
        meta.organization_id,
        meta.plan_name,
      );
  } else {
    console.warn(
      "[stripe] checkout completed but no subscription or plan_name — subscription=%s plan_name=%s",
      session.subscription,
      meta.plan_name,
    );
  }
}

/** Handle subscription updated (plan change, renewal). */
export async function handleSubscriptionUpdated(subscription: {
  id: string;
  status: string;
  metadata: Record<string, string> | null;
  items: { data: Array<{ price: { id: string } }> };
}) {
  const orgId = subscription.metadata?.organization_id;
  if (!orgId) {
    console.error(
      "[stripe] handleSubscriptionUpdated: no organization_id in metadata",
      subscription.metadata,
    );
    return;
  }

  console.log(
    "[stripe] handleSubscriptionUpdated org=%s status=%s",
    orgId,
    subscription.status,
  );
  const supabase = createAdminClient();
  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceId ? getPlanByPriceId(priceId) : undefined;

  const isActive = ["active", "trialing"].includes(subscription.status);

  const { error } = await supabase
    .from("organizations")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      is_subscribed: isActive,
      is_free_plan: false,
      ...(plan ? { plan: plan.name } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", orgId);

  if (error)
    console.error("[stripe] subscription update error:", error.message);
  else console.log("[stripe] subscription updated for org %s", orgId);
}

/** Handle subscription deleted (cancellation). */
export async function handleSubscriptionDeleted(subscription: {
  id: string;
  metadata: Record<string, string> | null;
}) {
  const orgId = subscription.metadata?.organization_id;
  if (!orgId) {
    console.error(
      "[stripe] handleSubscriptionDeleted: no organization_id in metadata",
      subscription.metadata,
    );
    return;
  }

  console.log("[stripe] handleSubscriptionDeleted org=%s", orgId);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("organizations")
    .update({
      stripe_subscription_id: null,
      subscription_status: "canceled",
      is_subscribed: false,
      is_free_plan: true,
      plan: "Starter",
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", orgId);

  if (error)
    console.error("[stripe] subscription delete update error:", error.message);
  else console.log("[stripe] subscription canceled for org %s", orgId);
}

/** Handle invoice.paid for subscription renewals — grant monthly credits. */
export async function handleInvoicePaid(invoice: {
  subscription?: string | null;
  billing_reason?: string | null;
}) {
  // Only grant credits on recurring payments, not the first checkout
  if (
    invoice.billing_reason !== "subscription_cycle" ||
    !invoice.subscription
  ) {
    return;
  }

  const supabase = createAdminClient();

  // Find the org by subscription ID
  const { data: org } = await supabase
    .from("organizations")
    .select("organization_id, plan")
    .eq("stripe_subscription_id", invoice.subscription)
    .single();

  if (!org?.plan) return;

  const plan = PLANS[org.plan];
  if (!plan) return;

  // Reset credits to the plan's monthly allotment
  await supabase
    .from("organizations")
    .update({
      token_balance: plan.creditsPerMonth,
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", org.organization_id);
}
