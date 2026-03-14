import {
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineCpuChip,
  HiOutlineRocketLaunch,
} from "react-icons/hi2";

const steps = [
  {
    icon: HiOutlineChatBubbleBottomCenterText,
    title: "Prompt",
    description:
      "Describe your agent's personality, goals, and workflow in plain language — no code required.",
    color: "bg-primary/10 text-primary ring-primary/20",
  },
  {
    icon: HiOutlineCpuChip,
    title: "Build",
    description:
      "Our engine orchestrates the LLM, generates the voice interface, and wires up the agent logic instantly.",
    color: "bg-secondary/10 text-secondary ring-secondary/20",
  },
  {
    icon: HiOutlineRocketLaunch,
    title: "Deploy",
    description:
      "Export the code, deploy on our cloud, expose as an API, or embed directly into your mobile app.",
    color: "bg-accent/10 text-accent ring-accent/20",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-6 py-24 bg-section-alt">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div data-aos="fade-up" className="text-center">
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            How it Works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            From concept to production-ready agent in three simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-20 grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-8">
          {/* Connecting line */}
          <div className="pointer-events-none absolute left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] top-9 hidden h-px bg-border md:block" />

          {steps.map((step, i) => (
            <div
              key={step.title}
              data-aos="fade-up"
              data-aos-delay={String(i * 150)}
              className="flex flex-col items-center text-center"
            >
              <div
                className={`relative z-10 flex h-18 w-18 items-center justify-center rounded-2xl ring-1 ${step.color}`}
              >
                <step.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
