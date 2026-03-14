import Link from "next/link";
import { StridifyLogo } from "@/components/ui/logo";

const columns = [
  {
    title: "Product",
    links: ["Discover", "Solutions", "Pricing"],
  },
  {
    title: "Resources",
    links: ["Integrations", "How It Works", "FAQ"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  },
];

export function Footer() {
  return (
    <footer data-aos="fade-up" className="border-t border-border px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="mb-6 flex items-center gap-2">
              <StridifyLogo className="h-5 w-5 text-foreground" />
              <span className="text-sm font-bold uppercase tracking-widest">
                Stridify
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Defining the future of interaction through vibe-centric agent
              engineering.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-widest">
                {col.title}
              </h4>
              {col.links.map((link) => (
                <Link
                  key={link}
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2025 Stridify Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
