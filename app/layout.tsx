import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AosProvider } from "@/components/ui/aos-provider";
import { AccountProvider } from "@/provider/account-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stridify - Build Voice Agent Apps With Just a Prompt",
  description:
    "Deploy low-latency conversational agents in seconds. Describe your workflow, and we handle the LLM orchestration and voice streaming.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=window.matchMedia("(prefers-color-scheme:dark)").matches;var c=(t==="dark"||(!t||t==="system")&&d)?"dark":"light";document.documentElement.classList.add(c)}catch(e){}})()`,
          }}
        />
        <meta
          name="keywords"
          content="voice agent, AI, live apps, conversational AI, prompt, vibe coding, Stridify, LLM, cloud deployment, real-time, streaming, agent templates"
        />
        <meta
          property="og:title"
          content="Stridify - Build Voice Agent Apps With Just a Prompt"
        />
        <meta
          property="og:description"
          content="Deploy low-latency conversational agents in seconds. Describe your workflow, and we handle the LLM orchestration and voice streaming."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://stridify.app/" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Stridify - Build Voice Agent Apps With Just a Prompt"
        />
        <meta
          name="twitter:description"
          content="Deploy low-latency conversational agents in seconds. Describe your workflow, and we handle the LLM orchestration and voice streaming."
        />
        <meta name="twitter:image" content="/og-image.png" />
        <link rel="canonical" href="https://stridify.app/" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AccountProvider>
            <AosProvider>{children}</AosProvider>
          </AccountProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
