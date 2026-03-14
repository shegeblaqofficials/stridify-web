import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing – Stridify",
  description:
    "Compare Stridify plans side-by-side. Find the perfect plan for your voice agent needs.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
