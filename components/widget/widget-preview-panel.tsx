"use client";

import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineWindow,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { EmbedSnippet } from "./embed-snippet";

const POPUP_SCRIPT_ID = "stridify-embed-popup-script";
const POPUP_WRAPPER_ID = "stridify-embed-wrapper";

type Variant = "iframe" | "popup";

interface WidgetPreviewPanelProps {
  projectId: string;
  /** Origin used in generated install snippets. */
  origin?: string;
}

export function WidgetPreviewPanel({
  projectId,
  origin,
}: WidgetPreviewPanelProps) {
  const [variant, setVariant] = useState<Variant>("iframe");

  const baseOrigin = useMemo(() => {
    if (origin) return origin;
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  }, [origin]);

  const iframeSnippet = `<iframe
  src="${baseOrigin}/embed?sandboxId=${projectId}"
  style="width: 360px; height: 64px; border: 0; background: transparent"
  allow="microphone; camera; autoplay"
></iframe>`;

  const popupSnippet = `<script
  src="${baseOrigin}/embed-popup.js"
  data-stridify-sandbox-id="${projectId}"
  defer
></script>`;

  const code = variant === "iframe" ? iframeSnippet : popupSnippet;

  // When the popup variant is selected, inject the real embed-popup.js into
  // the parent document so the floating bubble renders on this page itself.
  // The bundle mounts a shadow-DOM wrapper at document.body — we tear it down
  // when switching variants or unmounting.
  useEffect(() => {
    if (variant !== "popup") return;
    if (typeof document === "undefined") return;

    if (!document.getElementById(POPUP_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = POPUP_SCRIPT_ID;
      script.src = "/embed-popup.js";
      script.defer = true;
      script.dataset.stridifySandboxId = projectId;
      document.body.appendChild(script);
    }

    return () => {
      document.getElementById(POPUP_SCRIPT_ID)?.remove();
      document.getElementById(POPUP_WRAPPER_ID)?.remove();
    };
  }, [variant, projectId]);

  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* Scrollable inner column with consistent max-width */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 py-8 space-y-8">
          {/* Header */}
          <header className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <HiOutlineSparkles className="size-3.5" />
              Widget preview
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Embed your voice agent anywhere
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Stridify widget is a low-code way to drop a voice agent into
              any website or web app. Pick a variant and paste the snippet —
              that&apos;s it.
            </p>
          </header>

          {/* Variant picker */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select a variant
            </h3>
            <div
              role="tablist"
              aria-label="Widget variant"
              className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface p-1"
            >
              <VariantButton
                active={variant === "iframe"}
                onClick={() => setVariant("iframe")}
                icon={HiOutlineWindow}
                label="Iframe"
                description="Inline bar"
              />
              <VariantButton
                active={variant === "popup"}
                onClick={() => setVariant("popup")}
                icon={HiOutlineChatBubbleBottomCenterText}
                label="Popup"
                description="Floating bubble"
              />
            </div>
          </section>

          {/* Live preview */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live preview
            </h3>

            {variant === "iframe" ? (
              <div className="relative rounded-2xl border border-border bg-section-alt overflow-hidden">
                {/* Subtle dotted backdrop */}
                <div
                  className="absolute inset-0 opacity-50 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, rgba(120,120,120,0.18) 1px, transparent 0)",
                    backgroundSize: "16px 16px",
                  }}
                />
                <div className="relative flex min-h-48 items-center justify-center p-10">
                  <iframe
                    src={`/embed?sandboxId=${projectId}`}
                    className="w-90 h-16 rounded-2xl border-0 bg-transparent"
                    allow="microphone; camera; autoplay"
                    title="Stridify embed iframe preview"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-section-alt p-6 flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                  <HiOutlineChatBubbleBottomCenterText className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Floating bubble in the bottom-right
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The live popup is now mounted on this page — look for the
                    floating bubble in the bottom-right corner and click it to
                    test the voice assistant.
                  </p>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {variant === "iframe"
                ? "The iframe variant sits inline wherever you place it."
                : "The popup variant attaches a floating bubble to the bottom-right of the page."}
            </p>
          </section>

          {/* Embed code */}
          <section className="space-y-3 pb-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Embed code
              </h3>
              <span className="text-[11px] text-muted-foreground/70">
                Paste before <code className="font-mono">{`</body>`}</code>
              </span>
            </div>
            <EmbedSnippet code={code} />
          </section>
        </div>
      </div>
    </div>
  );
}

interface VariantButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

function VariantButton({
  active,
  onClick,
  icon: Icon,
  label,
  description,
}: VariantButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        "group flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all",
        active
          ? "bg-background shadow-sm ring-1 ring-border"
          : "hover:bg-background/60",
      ].join(" ")}
    >
      <div
        className={[
          "flex size-8 items-center justify-center rounded-md transition-colors",
          active
            ? "bg-foreground text-background"
            : "bg-section-alt text-muted-foreground group-hover:text-foreground",
        ].join(" ")}
      >
        <Icon className="size-4" />
      </div>
      <div className="flex flex-col leading-tight">
        <span
          className={[
            "text-sm font-semibold",
            active ? "text-foreground" : "text-muted-foreground",
          ].join(" ")}
        >
          {label}
        </span>
        <span className="text-[11px] text-muted-foreground/80">
          {description}
        </span>
      </div>
    </button>
  );
}
