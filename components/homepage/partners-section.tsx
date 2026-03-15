const partners = [
  { name: "Vercel", wordmark: "▲ Vercel" },
  { name: "Stripe", wordmark: "stripe" },
  { name: "Supabase", wordmark: "⚡ Supabase" },
  { name: "OpenAI", wordmark: "OpenAI" },
  { name: "LiveKit", wordmark: "LiveKit" },
  { name: "ElevenLabs", wordmark: "llElevenLabs" },
  { name: "Twilio", wordmark: "twilio" },
];

export function PartnersSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <p
          data-aos="fade-up"
          className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
        >
          Powered by the tools we trust
        </p>

        <div
          data-aos="fade-up"
          data-aos-delay="150"
          className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-16"
        >
          {partners.map((p) => (
            <span
              key={p.name}
              className="select-none text-xl font-semibold tracking-tight text-muted-foreground/40 transition-colors hover:text-muted-foreground/70 md:text-2xl"
            >
              {p.wordmark}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
