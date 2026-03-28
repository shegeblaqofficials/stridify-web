import {
  HiOutlineGlobeAlt,
  HiOutlinePhone,
  HiOutlineCodeBracketSquare,
  HiOutlineBolt,
  HiOutlineShieldCheck,
  HiOutlineArrowPath,
} from "react-icons/hi2";

const capabilities = [
  {
    icon: HiOutlineGlobeAlt,
    title: "Web Apps",
    description:
      "Deploy voice agents as full web applications with custom domains and instant global CDN.",
  },
  {
    icon: HiOutlinePhone,
    title: "Telephony",
    description:
      "Connect your agent to a phone number. Customers call in and talk directly with no extra setup.",
  },
  {
    icon: HiOutlineCodeBracketSquare,
    title: "Embeddable Widget",
    description:
      "Drop a voice widget into any existing site with a single script tag. Works everywhere.",
  },
  {
    icon: HiOutlineBolt,
    title: "Real Time Response",
    description:
      "Optimized voice streaming pipeline delivers sub-200ms latency so responses feel natural and instant.",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "Enterprise Ready",
    description:
      "SOC 2 compliant infrastructure with end-to-end encryption, SSO, and audit logging built in.",
  },
  {
    icon: HiOutlineArrowPath,
    title: "Iterate with Prompts",
    description:
      "Refine your agent with follow-up prompts. Change behavior, add features, and redeploy in seconds.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-6 py-24 md:py-32 bg-section-alt">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div data-aos="fade-up" className="text-center mb-16 md:mb-20">
          <p className="text-sm font-medium text-muted-foreground mb-4">
            Capabilities
          </p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Built for every channel
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground leading-relaxed">
            One platform, every deployment target. Build once and ship to web,
            phone, or widget.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((cap, i) => (
            <div
              key={cap.title}
              data-aos="fade-up"
              data-aos-delay={String(i * 60)}
              className="group rounded-2xl p-8 transition-colors duration-200 hover:bg-white dark:hover:bg-[#1a1a1f]"
            >
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-foreground/5">
                <cap.icon className="size-5 text-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {cap.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {cap.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
