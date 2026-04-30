import type { ReactNode } from "react";
import "@/app/embed.css";

export const metadata = {
  title: "Stridify Embed",
  description: "Stridify voice agent embed",
};

export default function EmbedRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-transparent">{children}</body>
    </html>
  );
}
