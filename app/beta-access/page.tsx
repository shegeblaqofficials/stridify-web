import { Navbar } from "@/components/homepage/navbar";
import { Footer } from "@/components/homepage/footer";
import { Button } from "@/components/ui/button";
import { HiOutlineEnvelope, HiOutlineArrowLeft } from "react-icons/hi2";
import Link from "next/link";

export default function BetaAccessPage() {
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
        <div className="mb-12 flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <Button
            size="lg"
            variant="outline"
            className="flex items-center gap-2"
          >
            <HiOutlineEnvelope className="h-5 w-5" />
            Check Status
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

        {/* Queue info */}
        <div className="mb-16 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface/40 px-6 py-4 text-center">
            <div className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Queue Position
            </div>
            <div className="text-lg font-bold">Top 5%</div>
          </div>
          <div className="rounded-xl border border-border bg-surface/40 px-6 py-4 text-center">
            <div className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Beta Version
            </div>
            <div className="text-lg font-bold">0.4.1</div>
          </div>
          <div className="rounded-xl border border-border bg-surface/40 px-6 py-4 text-center">
            <div className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Invite Code
            </div>
            <div className="text-lg font-bold text-muted-foreground/60">
              Coming Soon
            </div>
          </div>
        </div>

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
