import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "City Travel Guide – Stridify",
  description:
    "Explore the best attractions, restaurants, and hidden gems in the city. Get personalized recommendations and tips for your trip.",
};

export default function CityTravelGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
