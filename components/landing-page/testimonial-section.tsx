const testimonials = [
  {
    quote:
      "I described what I wanted my support agent to do, and Stridify had it live on my website in under ten minutes. My customers can actually call it. This is wild.",
    name: "Jordan Lee",
    role: "Founder",
    company: "FreshBites",
  },
  {
    quote:
      "We replaced our entire IVR phone tree with a Stridify voice agent. It sounds natural, handles bookings, and we didn't write a single line of code.",
    name: "Priya Patel",
    role: "Operations Lead",
    company: "Urban Goods",
  },
];

export function TestimonialSection() {
  return (
    <section id="testimonials" className="px-6 py-24 md:py-32 bg-section-alt">
      <div className="mx-auto max-w-6xl">
        <div data-aos="fade-up" className="mb-16 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-4">
            Testimonials
          </p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Loved by builders
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              data-aos="fade-up"
              data-aos-delay={String(i * 150)}
              className="rounded-2xl border border-border bg-surface p-8 md:p-10"
            >
              <p className="text-lg font-medium leading-relaxed text-foreground md:text-xl">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-8 flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-surface-elevated" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
