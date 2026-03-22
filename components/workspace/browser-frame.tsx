"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { ProjectStatus } from "@/model/project/project";
import {
  HiOutlineGlobeAlt,
  HiOutlineCog6Tooth,
  HiOutlineSparkles,
  HiOutlineArrowPath,
} from "react-icons/hi2";

export interface BrowserFrameHandle {
  refresh: () => void;
}

interface BrowserFrameProps {
  url?: string;
  previewUrl?: string;
  projectStatus?: ProjectStatus;
  refreshKey?: number;
  sandboxLoading?: boolean;
}

export const BrowserFrame = forwardRef<BrowserFrameHandle, BrowserFrameProps>(
  function BrowserFrame(
    { url, previewUrl, projectStatus, refreshKey, sandboxLoading },
    ref,
  ) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    // lockedUrl holds the URL currently loaded in the iframe — it never changes
    // unless the user clicks refresh or a genuinely new URL arrives.
    const [lockedUrl, setLockedUrl] = useState<string | undefined>(undefined);
    const isBuilding =
      projectStatus === "building" || projectStatus === "draft";

    // Lock in the first non-empty previewUrl. After that, only update if the
    // domain actually changes (i.e. a new sandbox was created).
    useEffect(() => {
      const incoming = previewUrl;
      if (!incoming) return;
      setLockedUrl((prev) => {
        if (!prev) return incoming; // first URL — lock it in
        if (prev === incoming) return prev; // same URL — keep cached page
        return incoming; // genuinely new sandbox URL
      });
    }, [previewUrl]);

    // When refreshKey changes, force-reload the iframe (same URL, fresh content)
    useEffect(() => {
      if (refreshKey && iframeRef.current && lockedUrl) {
        iframeRef.current.src = lockedUrl;
      }
    }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRefresh = useCallback(() => {
      // On manual refresh, re-set the src to force a reload.
      // If a new previewUrl is available, switch to it.
      const target = previewUrl || lockedUrl;
      if (iframeRef.current && target) {
        iframeRef.current.src = target;
        setLockedUrl(target);
      }
    }, [previewUrl, lockedUrl]);

    useImperativeHandle(ref, () => ({ refresh: handleRefresh }), [
      handleRefresh,
    ]);

    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        <div className="flex-1 relative">
          {lockedUrl ? (
            <iframe
              ref={iframeRef}
              src={lockedUrl}
              className="w-full h-full border-0"
              title="Agent Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : isBuilding ? (
            /* In-progress / building state */
            <div className="flex flex-col items-center justify-center h-full gap-5 text-muted-foreground px-8">
              <div className="relative">
                <div className="size-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                  <HiOutlineCog6Tooth
                    className="size-8 text-primary/60 animate-spin"
                    style={{ animationDuration: "3s" }}
                  />
                </div>
                <div className="absolute -top-1 -right-1 size-5 rounded-full bg-accent flex items-center justify-center">
                  <HiOutlineSparkles className="size-3 text-accent-foreground" />
                </div>
              </div>
              <div className="text-center space-y-1.5">
                <p className="text-sm font-semibold text-foreground">
                  Building your agent...
                </p>
                <p className="text-xs text-muted-foreground max-w-65 leading-relaxed">
                  We&apos;re generating your voice agent. The preview will
                  appear here once it&apos;s ready.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1 w-24 rounded-full bg-border overflow-hidden">
                  <div className="h-full w-1/2 rounded-full bg-primary animate-pulse" />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Processing
                </span>
              </div>
            </div>
          ) : sandboxLoading ? (
            /* Sandbox warming up — restoring from snapshot */
            <div className="flex flex-col items-center justify-center h-full gap-5 text-muted-foreground px-8">
              <div className="relative">
                <div className="size-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                  <HiOutlineArrowPath
                    className="size-8 text-primary/60 animate-spin"
                    style={{ animationDuration: "2s" }}
                  />
                </div>
              </div>
              <div className="text-center space-y-1.5">
                <p className="text-sm font-semibold text-foreground">
                  Starting sandbox...
                </p>
                <p className="text-xs text-muted-foreground max-w-65 leading-relaxed">
                  Restoring your workspace. The preview will appear in a moment.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1 w-24 rounded-full bg-border overflow-hidden">
                  <div className="h-full w-1/2 rounded-full bg-primary/60 animate-pulse" />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Warming up
                </span>
              </div>
            </div>
          ) : (
            /* Empty state — no preview yet */
            <div className="flex flex-col items-center justify-center h-full gap-5 text-muted-foreground px-8">
              <div className="size-20 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center">
                <HiOutlineGlobeAlt className="size-8 text-muted-foreground/40" />
              </div>
              <div className="text-center space-y-1.5">
                <p className="text-sm font-semibold text-foreground">
                  No preview yet
                </p>
                <p className="text-xs text-muted-foreground max-w-65 leading-relaxed">
                  Enter a prompt in the chat to start building your voice agent.
                  The live preview will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);
