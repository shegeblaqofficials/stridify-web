import React from "react";

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center w-full h-full bg-background z-50">
      <span className="relative flex h-10 w-10">
        <span className="animate-spin absolute inline-flex h-full w-full rounded-full bg-linear-to-tr from-primary/60 via-accent/40 to-primary/20 opacity-60" />
        <span className="relative inline-flex h-10 w-10 rounded-full bg-background border-2 border-primary/30" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <svg
            className="h-6 w-6 text-primary animate-pulse"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeOpacity="0.2"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </span>
    </div>
  );
}
