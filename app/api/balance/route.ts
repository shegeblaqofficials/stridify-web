/**
 * app/api/balance/route.ts
 *
 * Internal token-balance API consumed by LiveKit agents and other
 * server-side workers. NOT exposed to browser clients.
 *
 * Authentication: Bearer token via STRIDIFY_AGENT_SECRET env var.
 *
 * GET  /api/balance?orgId=<id>
 *   → { balance: number }
 *
 * POST /api/balance
 *   Body: one of the following shapes:
 *
 *   { action: "book",      orgId, sessionId }
 *   → { balance: number, totalBooked: number, sessionId: string }
 *
 *   { action: "credit",    orgId, amount }
 *   → { balance: number }
 *
 *   { action: "debit",     orgId, amount }
 *   → { balance: number }
 *
 *   { action: "reconcile", orgId, sessionId, actualUsed, bookedAmount }
 *   → { balance: number }
 */

import { NextRequest } from "next/server";
import {
  getBalance,
  bookTokens,
  creditBalance,
  debitBalance,
  reconcileBooking,
} from "@/lib/redis/token-balance";

// ── Auth ─────────────────────────────────────────────────────────────

function authorize(
  req: NextRequest,
): { ok: true } | { ok: false; res: Response } {
  const secret = process.env.STRIDIFY_AGENT_SECRET;
  if (!secret) {
    console.error("[balance-api] STRIDIFY_AGENT_SECRET is not configured");
    return {
      ok: false,
      res: Response.json({ error: "Server misconfiguration" }, { status: 500 }),
    };
  }

  const header = req.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || token !== secret) {
    return {
      ok: false,
      res: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true };
}

// ── GET — read balance ────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = authorize(req);
  if (!auth.ok) return auth.res;

  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) {
    return Response.json({ error: "Missing orgId" }, { status: 400 });
  }

  const balance = await getBalance(orgId);
  return Response.json({ balance });
}

// ── POST — book / credit / debit / reconcile ──────────────────────────

export async function POST(req: NextRequest) {
  const auth = authorize(req);
  if (!auth.ok) return auth.res;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, orgId } = body;

  if (typeof action !== "string") {
    return Response.json({ error: "Missing action" }, { status: 400 });
  }
  if (typeof orgId !== "string" || !orgId) {
    return Response.json({ error: "Missing orgId" }, { status: 400 });
  }

  switch (action) {
    // ── book ───────────────────────────────────────────────────────
    case "book": {
      const { sessionId } = body;
      if (typeof sessionId !== "string" || !sessionId) {
        return Response.json({ error: "Missing sessionId" }, { status: 400 });
      }
      try {
        const { balance, totalBooked } = await bookTokens(orgId, sessionId);
        return Response.json({ balance, totalBooked, sessionId });
      } catch (error) {
        // bookTokens throws only if balance <= 0
        if (
          error instanceof Error &&
          error.message.includes("No tokens available")
        ) {
          return Response.json(
            {
              error: "insufficient_balance",
              message: error.message,
            },
            { status: 402 },
          );
        }
        throw error;
      }
    }

    // ── credit ─────────────────────────────────────────────────────
    case "credit": {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return Response.json(
          { error: "amount must be a positive number" },
          { status: 400 },
        );
      }
      const balance = await creditBalance(orgId, amount);
      return Response.json({ balance });
    }

    // ── debit ──────────────────────────────────────────────────────
    case "debit": {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return Response.json(
          { error: "amount must be a positive number" },
          { status: 400 },
        );
      }
      const balance = await debitBalance(orgId, amount);
      return Response.json({ balance });
    }

    // ── reconcile ──────────────────────────────────────────────────
    case "reconcile": {
      const { sessionId } = body;
      const actualUsed = Number(body.actualUsed);
      const bookedAmount = Number(body.bookedAmount);

      if (typeof sessionId !== "string" || !sessionId) {
        return Response.json({ error: "Missing sessionId" }, { status: 400 });
      }
      if (!Number.isFinite(actualUsed) || actualUsed < 0) {
        return Response.json(
          { error: "actualUsed must be a non-negative number" },
          { status: 400 },
        );
      }
      if (!Number.isFinite(bookedAmount) || bookedAmount < 0) {
        return Response.json(
          { error: "bookedAmount must be a non-negative number" },
          { status: 400 },
        );
      }

      const balance = await reconcileBooking(
        orgId,
        sessionId,
        actualUsed,
        bookedAmount,
      );
      return Response.json({ balance });
    }

    default:
      return Response.json(
        {
          error: `Unknown action "${action}". Valid: book | credit | debit | reconcile`,
        },
        { status: 400 },
      );
  }
}
