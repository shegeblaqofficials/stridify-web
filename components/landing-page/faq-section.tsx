"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    question: "What is vibe coding?",
    answer:
      "Vibe coding is a new way to build software by describing what you want in natural language instead of writing code. On Stridify, you write a prompt, and our platform generates a fully working voice agent with everything you need: conversation logic, AI models, and a live interface you can test immediately.",
  },
  {
    question: "What can I build with Stridify?",
    answer:
      "Anything that involves voice and AI. Customer support agents, booking assistants, language tutors, sales bots, phone receptionists, interactive guides if it talks, Stridify can build it. Your agent can live on a website, answer phone calls, run as an API backend, or work inside a mobile app.",
  },
  {
    question: "Do I need to know how to code?",
    answer:
      "Not at all. Stridify is built for anyone with an idea. You describe what your voice agent should do in plain English, and the platform handles everything else, from setting up AI models to generating the UI and deploying to the cloud.",
  },
  {
    question: "How do I deploy my voice agent?",
    answer:
      "Once you’re happy with your agent, hit Deploy. Stridify hosts it on our cloud and gives you a live URL, an embeddable widget, a phone number, or an API endpoint depending on how you want to use it. The whole process takes minutes.",
  },
  {
    question: "Can I use my agent on a phone line?",
    answer:
      "Yes. Stridify supports telephony out of the box. You can connect your voice agent to a phone number so customers can call in and talk to it directly with no extra setup required.",
  },
  {
    question: "How does pricing work for high volume apps?",
    answer:
      "For applications scaling beyond the Pro tier, we offer usage-based billing at wholesale rates. Our Enterprise plan includes volume tiers that lower your cost per interaction as your traffic increases. Contact our sales team for a custom quote.",
  },
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes, all plans are flexible and you can upgrade, downgrade, or cancel at any time. Changes take effect immediately and billing is prorated automatically.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="px-6 py-24">
      <div data-aos="fade-up" className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium text-muted-foreground mb-4">
          Support
        </p>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Frequently asked questions
        </h2>
      </div>
      <div
        data-aos="fade-up"
        data-aos-delay="150"
        className="mx-auto mt-12 max-w-3xl divide-y divide-border"
      >
        {faqs.map((faq) => (
          <FaqRow key={faq.question} faq={faq} />
        ))}
      </div>
    </section>
  );
}

function FaqRow({ faq }: { faq: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="py-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left text-lg font-medium transition-colors hover:text-foreground"
      >
        <span>{faq.question}</span>
        <ChevronIcon
          className={`h-5 w-5 shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-primary" : "text-muted-foreground"}`}
        />
      </button>
      <div className={`accordion-body ${open ? "open" : ""}`}>
        <div>
          <p className="pt-4 leading-relaxed text-muted-foreground">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
