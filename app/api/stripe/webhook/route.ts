import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import {
  handleCheckoutCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaid,
} from "@/lib/stripe/actions";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(
      "[stripe-webhook] signature verification failed:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[stripe-webhook] ${event.type} id=${event.id}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutCompleted({
          metadata: session.metadata,
          subscription:
            typeof session.subscription === "string"
              ? session.subscription
              : (session.subscription?.id ?? null),
        });
        break;
      }
      case "customer.subscription.created": {
        const sub = event.data.object;
        await handleSubscriptionUpdated({
          id: sub.id,
          status: sub.status,
          metadata: sub.metadata,
          items: sub.items,
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        await handleSubscriptionUpdated({
          id: sub.id,
          status: sub.status,
          metadata: sub.metadata,
          items: sub.items,
        });
        break;
      }

      case "customer.subscription.resumed": {
        const sub = event.data.object;
        await handleSubscriptionUpdated({
          id: sub.id,
          status: sub.status,
          metadata: sub.metadata,
          items: sub.items,
        });
        break;
      }

      case "customer.subscription.paused": {
        const sub = event.data.object;
        await handleSubscriptionUpdated({
          id: sub.id,
          status: sub.status,
          metadata: sub.metadata,
          items: sub.items,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await handleSubscriptionDeleted({
          id: sub.id,
          metadata: sub.metadata,
        });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        const sub = invoice.parent?.subscription_details?.subscription;
        await handleInvoicePaid({
          subscription: typeof sub === "string" ? sub : (sub?.id ?? null),
          billing_reason: invoice.billing_reason,
        });
        break;
      }

      default:
        console.log(`[stripe-webhook] unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(
      `[stripe-webhook] error handling ${event.type}:`,
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
