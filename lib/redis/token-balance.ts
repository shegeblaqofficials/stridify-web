/**
 * lib/redis/token-balance.ts
 *
 * Atomic token balance management using Redis INCRBY / DECRBY.
 *
 * Why Redis instead of Supabase read-modify-write?
 * ─────────────────────────────────────────────────
 * Supabase: SELECT balance → compute new value → UPDATE balance
 * This is a 3-step non-atomic cycle. Concurrent agent sessions for the same
 * org will read the same stale value and overwrite each other's deductions
 * (classic lost-update race condition).
 *
 * Redis DECRBY / INCRBY execute atomically on the server — no read needed,
 * no race condition possible. Redis is the live source of truth. Supabase
 * `token_balance` is synced after each session for persistence/reporting.
 *
 * Booking pattern (for coding agents that loop):
 * ────────────────────────────────────────────────
 * 1. Before any LLM call: bookTokens() — atomically reserves BOOK_AMOUNT
 *    from the balance. This prevents over-spending: if another session
 *    races in, the balance is already reduced.
 * 2. During the loop: after each step check if used ≥ 80 % of booked.
 *    If so, call bookTokens() again (checkAndRebook).
 * 3. When finished: reconcileBooking(actualUsed, totalBooked) — credits
 *    back unused tokens or debits the extra if the agent ran over.
 *
 * Key schema:
 *   org:balance:{orgId}                   → current spendable balance (integer tokens)
 *   org:balance:booked:{orgId}:{sessionId} → tokens reserved by ONE specific session
 *                                           (session-scoped, TTL-guarded)
 */

import { redis } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";

// ── Constants ─────────────────────────────────────────────────────────

/** Tokens reserved per booking call before an LLM invocation. */
export const BOOK_AMOUNT = 1000;

/**
 * Fraction of booked tokens consumed before re-booking in agent loops.
 * At 80 % usage the agent books another BOOK_AMOUNT so it never stalls.
 */
export const REBOOK_THRESHOLD = 0.8;

// ── Key helpers ───────────────────────────────────────────────────────

const BALANCE_KEY = (orgId: string) => `org:balance:${orgId}`;
/**
 * Per-session booking key. Scoped to (orgId, sessionId) so concurrent
 * sessions within the same org never read or decrement each other's
 * reservations. A 2-hour TTL ensures the key is cleaned up automatically
 * if the session crashes before reconcileBooking() runs.
 */
const BOOKED_KEY = (orgId: string, sessionId: string) =>
  `org:balance:booked:${orgId}:${sessionId}`;

/** TTL for the per-session booking key (seconds). Acts as a crash safety net. */
const BOOKED_KEY_TTL_SECONDS = 7_200; // 2 hours

// ── Seed from Supabase (on cache miss) ───────────────────────────────

/**
 * Loads `token_balance` from Supabase and seeds the Redis key with NX
 * (set-if-not-exists). Safe to call concurrently — only one process wins.
 */
async function seedFromDb(orgId: string): Promise<number> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("organizations")
    .select("token_balance")
    .eq("organization_id", orgId)
    .single();
  const balance = data?.token_balance ?? 0;
  await redis.set(BALANCE_KEY(orgId), balance, { nx: true });
  return balance;
}

// ── Read ──────────────────────────────────────────────────────────────

/** Returns the current spendable token balance (seeds from DB on miss). */
export async function getBalance(orgId: string): Promise<number> {
  const val = await redis.get<number>(BALANCE_KEY(orgId));
  if (val === null) return seedFromDb(orgId);
  return val;
}

/** Returns tokens currently booked (reserved) by a specific session. */
export async function getBookedAmount(
  orgId: string,
  sessionId: string,
): Promise<number> {
  const val = await redis.get<number>(BOOKED_KEY(orgId, sessionId));
  return val ?? 0;
}

// ── Write ─────────────────────────────────────────────────────────────

/**
 * Hard-set the balance to `amount`. Use for subscription activation /
 * renewal where the balance resets to the plan's monthly allotment.
 * Syncs to Supabase synchronously (this is a billing event, not hot-path).
 */
export async function setBalance(orgId: string, amount: number): Promise<void> {
  await redis.set(BALANCE_KEY(orgId), Math.max(0, amount));
  await syncBalanceToDb(orgId, Math.max(0, amount));
}

/**
 * Add `amount` tokens to the balance (top-up or subscription credit).
 * Atomic INCRBY — safe under concurrency.
 * Syncs to Supabase asynchronously (best-effort).
 */
export async function creditBalance(
  orgId: string,
  amount: number,
): Promise<number> {
  if (amount <= 0) return getBalance(orgId);
  const newBalance = await redis.incrby(BALANCE_KEY(orgId), amount);
  // Persist async — Stripe events are rare; a sync is fine here too
  syncBalanceToDb(orgId, newBalance).catch((err) =>
    console.error("[token-balance] syncBalanceToDb after credit failed:", err),
  );
  return newBalance;
}

/**
 * Subtract `amount` tokens from the balance.
 * Atomic DECRBY — safe under concurrency. May go negative.
 * Callers should check the returned balance and handle < 0 accordingly.
 */
export async function debitBalance(
  orgId: string,
  amount: number,
): Promise<number> {
  if (amount <= 0) return getBalance(orgId);
  return redis.decrby(BALANCE_KEY(orgId), amount);
}

// ── Booking ───────────────────────────────────────────────────────────

/**
 * Reserve tokens before starting an LLM call.
 *
 * Books min(currentBalance, BOOK_AMOUNT) — if balance is low, books only what's available.
 * Only rejects if balance is 0 or negative (cannot proceed at all).
 *
 * Atomically:
 *   - Decrements `org:balance:{orgId}` by the amount to book
 *   - Sets `org:balance:booked:{orgId}:{sessionId}` += amount booked
 *     (session-scoped key with TTL — cannot clash with other sessions)
 *
 * Returns the new balance and the running booked total for this session.
 *
 * Throws: Error if balance <= 0 (no tokens available to book)
 */
export async function bookTokens(
  orgId: string,
  sessionId: string,
): Promise<{ balance: number; totalBooked: number }> {
  // Check current balance first — reject only if 0 or negative
  const currentBalance = await getBalance(orgId);
  if (currentBalance <= 0) {
    throw new Error(
      `No tokens available for booking. Current balance: ${currentBalance}`,
    );
  }

  // Book whatever is available (up to BOOK_AMOUNT)
  const amountToBook = Math.min(currentBalance, BOOK_AMOUNT);

  const bookedKey = BOOKED_KEY(orgId, sessionId);

  // Atomically deduct from balance, increment session booking counter,
  // and (re)set the TTL — all in a single round-trip.
  const [balance, totalBooked] = (await redis
    .pipeline()
    .decrby(BALANCE_KEY(orgId), amountToBook)
    .incrby(bookedKey, amountToBook)
    .expire(bookedKey, BOOKED_KEY_TTL_SECONDS)
    .exec()) as [number, number, number];

  console.log(
    `[token-balance] booked ${amountToBook} (of ${BOOK_AMOUNT} requested) for org=${orgId} session=${sessionId} — balance=${balance} sessionBooked=${totalBooked}`,
  );
  return { balance, totalBooked };
}

/**
 * Reconcile a booking after LLM work completes.
 *
 * Compares `actualUsed` against `bookedAmount`:
 *   - actualUsed < bookedAmount → credit back the difference (agent used less)
 *   - actualUsed > bookedAmount → debit the extra   (agent ran over)
 *   - equal                    → no-op
 *
 * Deletes the session-scoped booking key (releases the reservation).
 * Returns the final spendable balance.
 */
export async function reconcileBooking(
  orgId: string,
  sessionId: string,
  actualUsed: number,
  bookedAmount: number,
): Promise<number> {
  const diff = bookedAmount - actualUsed; // positive → we over-booked
  const pipeline = redis.pipeline();

  if (diff > 0) {
    pipeline.incrby(BALANCE_KEY(orgId), diff); // credit back unused
  } else if (diff < 0) {
    pipeline.decrby(BALANCE_KEY(orgId), -diff); // debit the overage
  } else {
    pipeline.get(BALANCE_KEY(orgId)); // no change — just read
  }

  // Delete the session-specific booking key (clean up, not decrement).
  // Using DEL prevents any negative value from a double-reconcile.
  pipeline.del(BOOKED_KEY(orgId, sessionId));

  const [newBalance] = (await pipeline.exec()) as [number, number];

  console.log(
    `[token-balance] reconcile org=${orgId} session=${sessionId} booked=${bookedAmount} used=${actualUsed} diff=${diff} balance=${newBalance}`,
  );

  // Sync to Supabase at end of session (non-blocking)
  syncBalanceToDb(orgId, newBalance).catch((err) =>
    console.error(
      "[token-balance] syncBalanceToDb after reconcile failed:",
      err,
    ),
  );

  return newBalance;
}

// ── Coding-agent loop helper ──────────────────────────────────────────

/**
 * Called after each coding-agent step.
 *
 * If `totalUsed / totalBooked >= REBOOK_THRESHOLD` (80 %), books another
 * BOOK_AMOUNT so the agent can keep running without stalling or over-drawing.
 *
 * Returns updated totals and the current balance.
 */
export async function checkAndRebook(
  orgId: string,
  sessionId: string,
  totalUsed: number,
  totalBooked: number,
): Promise<{
  reBooked: boolean;
  newTotalBooked: number;
  balance: number;
}> {
  if (totalBooked > 0 && totalUsed / totalBooked >= REBOOK_THRESHOLD) {
    const { balance } = await bookTokens(orgId, sessionId);
    const newTotalBooked = totalBooked + BOOK_AMOUNT;
    console.log(
      `[token-balance] re-booked ${BOOK_AMOUNT} for org=${orgId} session=${sessionId} totalUsed=${totalUsed} newTotalBooked=${newTotalBooked}`,
    );
    return { reBooked: true, newTotalBooked, balance };
  }
  const balance = await getBalance(orgId);
  return { reBooked: false, newTotalBooked: totalBooked, balance };
}

// ── Supabase sync ─────────────────────────────────────────────────────

/**
 * Write the Redis balance back to Supabase for persistence and reporting.
 * Clamps to ≥ 0 so the DB column never goes negative.
 */
export async function syncBalanceToDb(
  orgId: string,
  balance?: number,
): Promise<void> {
  const finalBalance = balance ?? (await getBalance(orgId));
  const supabase = createAdminClient();
  await supabase
    .from("organizations")
    .update({
      token_balance: Math.max(0, finalBalance),
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", orgId);
}
