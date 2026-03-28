"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Link as ScrollLink } from "react-scroll";
import { Button } from "@/components/ui/button";
import { StridifyLogo } from "@/components/ui/logo";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { AuthModal } from "@/components/auth/auth-modal";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { useAccount } from "@/provider/account-provider";
import { HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2";

type NavLink = {
  label: string;
  href: string;
  scrollTo?: string;
  action?: "auth";
};

const navLinks: NavLink[] = [
  { label: "Features", href: "/#features", scrollTo: "features" },
  { label: "Discover", href: "/#templates", scrollTo: "templates" },
  { label: "How it Works", href: "/#how-it-works", scrollTo: "how-it-works" },
  { label: "Pricing", href: "/pricing", scrollTo: "pricing" },
];

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeAuth = useCallback(() => setAuthOpen(false), []);
  const { user, loading } = useAccount();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border glass-panel">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <StridifyLogo className="h-5 w-5 text-foreground" />
            <span className="text-base font-bold uppercase tracking-widest">
              Stridify
            </span>
            <span className="rounded-md border border-border px-2 py-0.75 text-[9px] font-bold uppercase leading-none tracking-wide text-muted-foreground">
              Beta
            </span>
          </Link>

          {/* Desktop nav */}
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
                      className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
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

          {/* Mobile controls */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeSwitcher />
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex size-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-surface-elevated"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <HiOutlineXMark className="size-6" />
              ) : (
                <HiOutlineBars3 className="size-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile menu panel */}
      <div
        className={`fixed top-16 right-0 bottom-0 z-40 w-full max-w-sm border-l border-border bg-background transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="flex h-full flex-col px-6 pt-6 pb-8">
          {/* Nav links */}
          <div className="space-y-1">
            {navLinks.map((link) =>
              isHome && link.scrollTo ? (
                <ScrollLink
                  key={link.label}
                  to={link.scrollTo}
                  spy
                  smooth
                  duration={700}
                  offset={-70}
                  onClick={() => setMobileOpen(false)}
                  className="flex cursor-pointer items-center rounded-xl px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
                  activeClass="!bg-primary/5 !text-foreground"
                >
                  {link.label}
                </ScrollLink>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center rounded-xl px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>

          {/* Divider */}
          <div className="my-6 h-px bg-border" />

          {/* Auth area */}
          {!loading && (
            <div className="space-y-3">
              {user ? (
                <div className="px-4">
                  <UserDropdown user={user} />
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      setAuthOpen(true);
                    }}
                    className="flex w-full items-center rounded-xl px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
                  >
                    Sign In
                  </button>
                  <div className="px-4">
                    <Button
                      size="lg"
                      className="w-full rounded-xl"
                      onClick={() => {
                        setMobileOpen(false);
                        setAuthOpen(true);
                      }}
                    >
                      Get Started
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </nav>
      </div>

      <AuthModal open={authOpen} onClose={closeAuth} />
    </>
  );
}
