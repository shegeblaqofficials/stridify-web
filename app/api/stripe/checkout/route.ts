import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccount, getOrganization } from "@/lib/account/actions";
import {
  createSubscriptionCheckout,
  createCreditTopupCheckout,
  upgradeSubscription,
} from "@/lib/stripe/actions";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await getAccount(user.id);
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const org = await getOrganization(account.organization_id);
  if (!org?.is_active) {
    return NextResponse.json(
      { error: "Organization is not active. Please wait for beta access." },
      { status: 403 },
    );
  }

  const { plan, type } = await req.json();

  let url: string | null;

  if (type === "topup") {
    url = await createCreditTopupCheckout(account.organization_id, user.email);
  } else if (type === "upgrade" && plan) {
    // Upgrade existing subscription to a new plan (swap price, no duplicate sub)
    const result = await upgradeSubscription(
      account.organization_id,
      user.email,
      plan,
    );
    if (result.type === "updated") {
      // In-place upgrade — no redirect needed
      return NextResponse.json({ upgraded: true });
    }
    url = result.url ?? null;
  } else if (plan) {
    // New subscription (first time subscribing from free plan)
    // Check if org already has a subscription to avoid duplicates
    if (org.stripe_subscription_id) {
      const result = await upgradeSubscription(
        account.organization_id,
        user.email,
        plan,
      );
      if (result.type === "updated") {
        return NextResponse.json({ upgraded: true });
      }
      url = result.url ?? null;
    } else {
      url = await createSubscriptionCheckout(
        account.organization_id,
        user.email,
        plan,
      );
    }
  } else {
    return NextResponse.json(
      { error: "Missing plan or type" },
      { status: 400 },
    );
  }

  if (!url) {
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url });
}
