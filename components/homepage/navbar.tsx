"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Link as ScrollLink } from "react-scroll";
import { Button } from "@/components/ui/button";
import { StridifyLogo } from "@/components/ui/logo";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { AuthModal } from "@/components/auth/auth-modal";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { useUser } from "@/hooks/use-user";

type NavLink = {
  label: string;
  href: string;
  scrollTo?: string;
  action?: "auth";
};

const navLinks: NavLink[] = [
  { label: "Discover", href: "/templates", scrollTo: "templates" },
  { label: "How it Works", href: "/#how-it-works", scrollTo: "how-it-works" },
  { label: "Pricing", href: "/pricing", scrollTo: "pricing" },
];

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [authOpen, setAuthOpen] = useState(false);
  const closeAuth = useCallback(() => setAuthOpen(false), []);
  const { user, loading } = useUser();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border glass-panel">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <StridifyLogo className="h-5 w-5 text-foreground" />
            <span className="text-base font-bold uppercase tracking-widest">
              Stridify
            </span>
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) =>
              isHome && link.scrollTo ? (
                <ScrollLink
                  key={link.label}
                  to={link.scrollTo}
                  spy
                  smooth
                  duration={700}
                  offset={-70}
                  className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  activeClass="!text-foreground"
                >
                  {link.label}
                </ScrollLink>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ),
            )}

            {/* Auth area */}
            {!loading && (
              <>
                {user ? (
                  <UserDropdown user={user} />
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setAuthOpen(true)}
                      className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Sign In
                    </button>
                    <Button
                      size="md"
                      className="rounded-lg"
                      onClick={() => setAuthOpen(true)}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </>
            )}
            <ThemeSwitcher />
          </nav>
        </div>
      </header>

      <AuthModal open={authOpen} onClose={closeAuth} />
    </>
  );
}
