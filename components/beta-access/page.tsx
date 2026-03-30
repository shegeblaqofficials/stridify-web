"use client";
import { Navbar } from "@/components/landing-page/navbar";
import { Footer } from "@/components/landing-page/footer";
import { Button } from "@/components/ui/button";
import {
  HiOutlineEnvelope,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from "react-icons/hi2";
import Link from "next/link";
import { useAccount } from "@/provider/account-provider";
import { PageLoader } from "@/components/ui/page-loader";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getOrganization } from "@/lib/account/actions";

export function BetaAccess() {
  const { user, account, loading } = useAccount();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [statusResult, setStatusResult] = useState<"pending" | null>(null);

  async function handleCheckStatus() {
    if (!account?.organization_id) return;
    setChecking(true);
    setStatusResult(null);
    try {
      const org = await getOrganization(account.organization_id);
      if (org?.is_active) {
        router.push("/home");
        return;
      }
      setStatusResult("pending");
    } finally {
      setChecking(false);
    }
  }

  if (loading || !user) {
    return <PageLoader />;
  }
  return (
    <>
      <Navbar />
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-6 pb-24 pt-24">
        {/* Centered logo/waveform */}
        <div className="mb-12 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-linear-to-br from-primary/10 via-secondary/10 to-primary/5 flex items-center justify-center">
            {/* Stylized waveform icon */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect
                x="17"
                y="10"
                width="2"
                height="20"
                rx="1"
                className="fill-primary/80"
              />
              <rect
                x="21"
                y="14"
                width="2"
                height="12"
                rx="1"
                className="fill-primary/60"
              />
              <rect
                x="25"
                y="18"
                width="2"
                height="4"
                rx="1"
                className="fill-primary/40"
              />
              <rect
                x="13"
                y="14"
                width="2"
                height="12"
                rx="1"
                className="fill-primary/60"
              />
              <rect
                x="9"
                y="18"
                width="2"
                height="4"
                rx="1"
                className="fill-primary/40"
              />
            </svg>
          </div>
        </div>

        {/* Headline */}
        <h1 className="mb-4 text-center text-4xl font-black tracking-tight md:text-5xl">
          Welcome to the Stridify Beta.
        </h1>
        <p className="mb-8 max-w-xl text-center text-lg text-muted-foreground">
          We&apos;re currently in a limited-access beta to ensure the highest
          quality experience for our early users. We&apos;ll notify you as soon
          as your account is ready for vibe coding.
        </p>

        {/* Status + actions */}
        <div className="mb-6 flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <Button
            size="lg"
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleCheckStatus}
            disabled={checking}
          >
            <HiOutlineEnvelope className="h-5 w-5" />
            {checking ? "Checking…" : "Check Status"}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M2 10h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M10 2v16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Follow us on X
          </Button>
        </div>

        {/* Status feedback */}
        {statusResult === "pending" && (
          <div className="mb-8 flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm text-muted-foreground">
            <HiOutlineClock className="h-4 w-4 shrink-0 text-yellow-500" />
            Your account is still pending approval. We&apos;ll email you when
            you&apos;re in.
          </div>
        )}

        {/* Return to homepage */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2 text-sm font-bold text-muted-foreground transition-all hover:bg-surface-elevated hover:text-primary"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Return to Homepage
        </Link>
      </main>
      <Footer />
    </>
  );
}
