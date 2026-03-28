import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div
        data-aos="fade-up"
        data-aos-duration="600"
        className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-border bg-surface px-8 py-20 text-center md:px-16"
      >
        {/* Same background as hero */}
        <div className="hero-gradient" />
        <div className="absolute inset-0 grid-pattern" />

        <h2 className="relative mx-auto max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Your next voice agent is
          <br />
          <span className="text-muted-foreground">one prompt away.</span>
        </h2>
        <p className="relative mx-auto mt-5 max-w-lg text-base text-muted-foreground leading-relaxed md:text-lg">
          Turn ideas into live voice agents in minutes. No code, no config. Just
          describe what you want.
        </p>

        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" className="rounded-lg">
            Get Started for Free
          </Button>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </section>
  );
}
