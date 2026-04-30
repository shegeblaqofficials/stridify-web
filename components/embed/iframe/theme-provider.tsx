import { THEME_MEDIA_QUERY } from "@/lib/embed/env";

const THEME_SCRIPT = `
  const doc = document.documentElement;
  const theme = new URLSearchParams(window.location.search).get('theme') ?? 'light';
  if (theme === "system") {
    if (window.matchMedia("${THEME_MEDIA_QUERY}").matches) {
      doc.classList.add("dark");
    } else {
      doc.classList.add("light");
    }
  } else {
    doc.classList.add(theme);
  }
`
  .trim()
  .replace(/\n/g, "")
  .replace(/\s+/g, " ");

export function ApplyThemeScript() {
  return <script id="stridify-embed-theme-script">{THEME_SCRIPT}</script>;
}
