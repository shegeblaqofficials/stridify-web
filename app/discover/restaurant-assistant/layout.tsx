import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restaurant Assistant – Stridify",
  description:
    "Get personalized restaurant recommendations and tips for your dining experiences.",
};

export default function RestaurantAssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
