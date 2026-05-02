"use client";

import { useState } from "react";
import {
  HiOutlinePhone,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineArrowLeft,
  HiOutlineMapPin,
} from "react-icons/hi2";

interface AvailableNumber {
  id: string;
  e164_format: string;
  locality: string;
  region: string;
  number_type: string;
  capabilities: string[];
}

type Step = "search" | "confirm" | "purchasing" | "done";

interface BuyNumberModalProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onNumberPurchased: (e164: string) => void;
}

export function BuyNumberModal({
  projectId,
  open,
  onClose,
  onNumberPurchased,
}: BuyNumberModalProps) {
  const [step, setStep] = useState<Step>("search");
  const [areaCode, setAreaCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<AvailableNumber[]>([]);
  const [selected, setSelected] = useState<AvailableNumber | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [purchasedNumber, setPurchasedNumber] = useState<string | null>(null);

  if (!open) return null;

  function resetAndClose() {
    setStep("search");
    setAreaCode("");
    setResults([]);
    setSelected(null);
    setError(null);
    setPurchasedNumber(null);
    onClose();
  }

  async function handleSearch() {
    if (!areaCode.trim()) return;
    setSearching(true);
    setError(null);
    setResults([]);
    try {
      const res = await fetch("/api/livekit/phone-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search", areaCode: areaCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.numbers ?? []);
      if ((data.numbers ?? []).length === 0) {
        setError("No numbers found for that area code. Try a different one.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }

  async function handlePurchase() {
    if (!selected) return;
    setStep("purchasing");
    setError(null);
    try {
      const res = await fetch("/api/livekit/phone-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "purchase",
          projectId,
          e164: selected.e164_format,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Purchase failed");
      setPurchasedNumber(data.phoneNumber);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
      setStep("confirm");
    }
  }

  function formatNumber(e164: string) {
    // +14155551234 → (415) 555-1234
    const digits = e164.replace(/\D/g, "");
    if (digits.length === 11 && digits[0] === "1") {
      return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    return e164;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={step !== "purchasing" ? resetAndClose : undefined}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-surface rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            {step === "confirm" && (
              <button
                onClick={() => {
                  setStep("search");
                  setError(null);
                }}
                className="p-1.5 rounded-lg hover:bg-surface-elevated transition-colors -ml-1.5"
              >
                <HiOutlineArrowLeft className="size-4 text-muted-foreground" />
              </button>
            )}
            <div>
              <h2 className="text-[15px] font-bold text-foreground">
                {step === "done" ? "Number Activated" : "Buy a Phone Number"}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {step === "search" && "Search US numbers by area code"}
                {step === "confirm" && "Review and confirm your purchase"}
                {step === "purchasing" && "Provisioning your number…"}
                {step === "done" && "Your agent is ready to receive calls"}
              </p>
            </div>
          </div>
          {step !== "purchasing" && (
            <button
              onClick={resetAndClose}
              className="p-1.5 rounded-xl hover:bg-surface-elevated transition-colors"
            >
              <HiOutlineXMark className="size-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* ── Search step ─────────────────────────────────────────────── */}
        {step === "search" && (
          <div className="px-6 py-5 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={3}
                  value={areaCode}
                  onChange={(e) =>
                    setAreaCode(e.target.value.replace(/\D/g, ""))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Area code (e.g. 415)"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-background text-[13px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching || areaCode.length !== 3}
                className="px-4 py-3 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold transition-opacity disabled:opacity-40 hover:opacity-90"
              >
                {searching ? "Searching…" : "Search"}
              </button>
            </div>

            {error && <p className="text-[12px] text-destructive">{error}</p>}

            {results.length > 0 && (
              <div className="space-y-1.5 max-h-64 overflow-y-auto workspace-scrollbar -mx-1 px-1">
                {results.map((num) => (
                  <button
                    key={num.id || num.e164_format}
                    onClick={() => {
                      setSelected(num);
                      setStep("confirm");
                      setError(null);
                    }}
                    className="w-full flex items-center gap-3 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-surface-elevated px-4 py-3 transition-all text-left group"
                  >
                    <div className="size-9 rounded-xl bg-surface-elevated flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                      <HiOutlinePhone className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-foreground tabular-nums">
                        {formatNumber(num.e164_format)}
                      </p>
                      {(num.locality || num.region) && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <HiOutlineMapPin className="size-3" />
                          {[num.locality, num.region]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
                      {num.number_type?.replace("local", "local") ?? "local"}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Plan note */}
            <p className="text-[11px] text-muted-foreground/70 text-center pt-1">
              1 free US local number is included on paid plans only.
            </p>
          </div>
        )}

        {/* ── Confirm step ─────────────────────────────────────────────── */}
        {step === "confirm" && selected && (
          <div className="px-6 py-5 space-y-5">
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <HiOutlinePhone className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-[18px] font-bold text-foreground tabular-nums">
                  {formatNumber(selected.e164_format)}
                </p>
                {(selected.locality || selected.region) && (
                  <p className="text-[12px] text-muted-foreground flex items-center gap-1">
                    <HiOutlineMapPin className="size-3" />
                    {[selected.locality, selected.region]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-surface-elevated border border-border/60 p-4 space-y-2 text-[12px] text-muted-foreground">
              <p>
                • An inbound SIP trunk and dispatch rule will be created in
                LiveKit.
              </p>
              <p>
                • Inbound calls to this number route directly to your agent.
              </p>
              <p>• 1 free US local number is included on paid plans only.</p>
            </div>

            {error && <p className="text-[12px] text-destructive">{error}</p>}

            <button
              onClick={handlePurchase}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-[14px] font-bold hover:opacity-90 transition-opacity"
            >
              Confirm Purchase
            </button>
          </div>
        )}

        {/* ── Purchasing step ───────────────────────────────────────────── */}
        {step === "purchasing" && (
          <div className="px-6 py-10 flex flex-col items-center gap-4">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[14px] font-bold text-foreground">
                Provisioning number…
              </p>
              <p className="text-[12px] text-muted-foreground">
                Creating SIP trunk and dispatch rule. This takes a few seconds.
              </p>
            </div>
          </div>
        )}

        {/* ── Done step ────────────────────────────────────────────────── */}
        {step === "done" && purchasedNumber && (
          <div className="px-6 py-8 flex flex-col items-center gap-5">
            <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <HiOutlineCheckCircle className="size-7 text-emerald-500" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[18px] font-bold text-foreground tabular-nums">
                {formatNumber(purchasedNumber)}
              </p>
              <p className="text-[12px] text-muted-foreground">
                Active · Inbound calls route to your agent
              </p>
            </div>
            <button
              onClick={() => {
                onNumberPurchased(purchasedNumber);
                resetAndClose();
              }}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-[14px] font-bold hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
