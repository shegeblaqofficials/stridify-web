import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Language Practice Coach – Stridify",
  description:
    "Improve your language skills with personalized practice sessions and real-time feedback from our AI language coach.",
};

export default function LanguagePracticeCoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
