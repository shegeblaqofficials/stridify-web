const testimonials = [
  {
    quote:
      "Stridify completely changed how we handle customer support. We went from 'idea' to a fully functioning voice agent in less than ten minutes.",
    name: "Alex Rivera",
    role: "Head of Engineering",
    company: "FlowState",
  },
  {
    quote:
      "The latency is unbelievable. Our users can't tell they aren't speaking to a human. The prompt-to-app workflow is the future.",
    name: "Sarah Chen",
    role: "Lead Developer",
    company: "NexaVoice",
  },
];

export function TestimonialSection() {
  return (
    <section id="testimonials" className="px-6 py-24 bg-section-muted">
      <div className="mx-auto max-w-7xl">
        <div data-aos="fade-up" className="mb-16">
          <h2 className="mb-4 text-3xl font-bold">What People Are Saying</h2>
          <p className="max-w-md text-muted-foreground">
            Hear from teams already building production voice agents with
            Stridify.
          </p>
        </div>

        <div className="grid gap-16 md:grid-cols-[1fr_1px_1fr] md:gap-12">
          {testimonials.map((t, i) => (
            <>
              {i > 0 && <div className="hidden bg-border md:block" />}
              <div
                key={t.name}
                data-aos="fade-up"
                data-aos-delay={String(i * 200)}
              >
                {/* Quote mark */}
                <span className="mb-6 block text-4xl font-bold leading-none text-primary/50">
                  &#x201C;&#x201C;
                </span>

                {/* Quote text */}
                <p className="mb-10 text-lg font-medium italic leading-relaxed text-foreground md:text-2xl md:font-semibold">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 shrink-0 rounded-full bg-muted-foreground/20" />
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-foreground">
                      {t.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t.role}, {t.company}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ))}
        </div>
      </div>
    </section>
  );
}
