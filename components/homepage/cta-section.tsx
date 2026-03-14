import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="px-6 py-24">
      <div
        data-aos="zoom-in"
        data-aos-duration="800"
        className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-foreground px-8 py-20 text-center md:px-16"
      >
        {/* Decorative bolt */}
        <svg
          className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.06]"
          width="180"
          height="220"
          viewBox="0 0 180 220"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M100 0L0 130h70L50 220l130-140h-70L100 0z"
            fill="currentColor"
            className="text-background"
          />
        </svg>

        <h2 className="relative mx-auto max-w-2xl text-4xl font-black leading-tight tracking-tight text-background md:text-5xl">
          Ready to prompt your next app into existence?
        </h2>

        <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            className="rounded-lg bg-background px-8 text-foreground hover:bg-background/90"
          >
            Get Started for Free
          </Button>
          <a
            href="#"
            className="text-sm font-semibold text-background/70 underline underline-offset-4 transition-colors hover:text-background"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </section>
  );
}
