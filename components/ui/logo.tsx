export function StridifyLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Rounded square */}
      <rect width="32" height="32" rx="8" fill="currentColor" />
      {/* Lightning bolt */}
      <path d="M18 5L10 18h5l-1 9 8-13h-5l1-9z" fill="var(--background)" />
    </svg>
  );
}
