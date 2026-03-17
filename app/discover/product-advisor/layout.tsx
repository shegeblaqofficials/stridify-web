import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Advisor – Stridify",
  description:
    "Get personalized product recommendations and guidance from our AI product advisor.",
};

export default function ProductAdvisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
