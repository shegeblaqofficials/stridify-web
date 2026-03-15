import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="px-6 py-24">
      <div
        data-aos="zoom-in"
        data-aos-duration="800"
        className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-foreground px-8 py-20 text-center md:px-16"
      >
        {/* Subtle dot pattern background */}
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full opacity-10"
          style={{ zIndex: 0 }}
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="dots"
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="4" cy="4" r="2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Decorative bolt */}
        <svg
          className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.12]"
          width="180"
          height="220"
          viewBox="0 0 180 220"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M100 0L0 130h70L50 220l130-140h-70L100 0z"
            fill="currentColor"
            className="text-accent"
          />
        </svg>

        <h2
          className="relative mx-auto max-w-2xl text-4xl font-black leading-tight tracking-tight text-background md:text-5xl"
          style={{ zIndex: 1 }}
        >
          Ready to prompt your next app into existence?
        </h2>
        <p
          className="mx-auto mt-6 max-w-xl text-lg text-background/80 font-normal"
          style={{ zIndex: 1 }}
        >
          Turn your ideas into live voice agents in minutes. No code, no hassle,
          just pure creativity and instant results.
        </p>

        <div
          className="relative mt-10 flex flex-wrap items-center justify-center gap-4"
          style={{ zIndex: 1 }}
        >
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
