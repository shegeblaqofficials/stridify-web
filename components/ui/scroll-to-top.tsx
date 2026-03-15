"use client";

import { useEffect, useState } from "react";
import { HiOutlineChevronUp } from "react-icons/hi2";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-50 flex size-11 items-center justify-center rounded-full border border-border bg-surface shadow-lg transition-all duration-300 hover:bg-surface-elevated hover:shadow-xl active:scale-95 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <HiOutlineChevronUp className="size-5 text-foreground" />
    </button>
  );
}
