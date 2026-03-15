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
      "Vibe coding is a developer-centric approach to building AI agents using intuitive prompting and real-time feedback loops. It focuses on the 'feel' and 'personality' of the interaction rather than just rigid logic, allowing for more natural human-AI synergy.",
  },
  {
    question: "Can I export my voice agents?",
    answer:
      "Yes, all agents built on Stridify can be exported as a zip file containing the agent code and clear instructions for deployment and integration.",
  },
  {
    question: "How does pricing work for high-volume apps?",
    answer:
      "For applications scaling beyond the Pro tier, we offer usage-based billing at wholesale rates. Our Enterprise plan includes volume tiers that lower your cost-per-prompt as your traffic increases. Contact our sales team for a custom quote.",
  },
  {
    question: "Is there a discount for open-source projects?",
    answer:
      "Absolutely. We believe in the power of the open community. Verified open-source contributors and non-profits can apply for a 50% discount on the Pro plan or free Enterprise credits.",
  },
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes — all plans are flexible. You can upgrade, downgrade, or cancel at any time. Changes take effect immediately and billing is prorated automatically.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="px-6 py-24 bg-section-alt">
      <h2
        data-aos="fade-up"
        className="mb-12 text-center text-3xl font-bold tracking-tight"
      >
        Frequently Asked Questions
      </h2>
      <div
        data-aos="fade-up"
        data-aos-delay="150"
        className="mx-auto max-w-3xl divide-y divide-border"
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
