import React, { Fragment } from "react";

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
      "We replaced our entire IVR phone tree with a Stridify voice agent. It sounds natural, handles bookings, and we didn’t write a single line of code.",
    name: "Priya Patel",
    role: "Operations Lead",
    company: "Urban Goods",
  },
];

export function TestimonialSection() {
  return (
    <section id="testimonials" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div data-aos="fade-up" className="mb-16">
          <h2 className="mb-4 text-3xl font-bold">Builders Love Stridify</h2>
          <p className="max-w-md text-muted-foreground">
            Hear from people already shipping voice agents to production with
            nothing but a prompt.
          </p>
        </div>

        <div className="grid gap-16 md:grid-cols-[1fr_1px_1fr] md:gap-12">
          {testimonials.map((t, i) => (
            <Fragment key={t.name}>
              {i > 0 && (
                <div
                  key={`divider-${i}`}
                  className="hidden bg-border md:block"
                />
              )}
              <div data-aos="fade-up" data-aos-delay={String(i * 200)}>
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
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
