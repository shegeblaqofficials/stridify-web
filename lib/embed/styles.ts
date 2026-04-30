import type { AppConfig } from "./types";

/**
 * Generate inline CSS that overrides accent variables on :root / .dark.
 * Used inside the iframe (full-document) variant.
 */
export function getStyles(appConfig: AppConfig): string {
  const { accent, accentDark } = appConfig;

  return [
    accent
      ? `:root { --primary: ${accent}; --primary-hover: color-mix(in srgb, ${accent} 80%, #000); --fgAccent: ${accent}; }`
      : "",
    accentDark
      ? `.dark { --primary: ${accentDark}; --primary-hover: color-mix(in srgb, ${accentDark} 80%, #000); --fgAccent: ${accentDark}; }`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Same as getStyles, but scoped to a shadow root via :host / :host(.dark).
 * Used by the popup standalone bundle which mounts inside a shadow DOM.
 */
export function getShadowStyles(appConfig: AppConfig): string {
  const { accent, accentDark } = appConfig;

  return [
    accent
      ? `:host { --primary: ${accent}; --primary-hover: color-mix(in srgb, ${accent} 80%, #000); --fgAccent: ${accent}; }`
      : "",
    accentDark
      ? `:host(.dark) { --primary: ${accentDark}; --primary-hover: color-mix(in srgb, ${accentDark} 80%, #000); --fgAccent: ${accentDark}; }`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
