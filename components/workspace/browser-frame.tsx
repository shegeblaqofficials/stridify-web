interface BrowserFrameProps {
  url?: string;
  previewUrl?: string;
}

export function BrowserFrame({ url, previewUrl }: BrowserFrameProps) {
  return (
    <div className="w-full h-full bg-surface rounded-xl border border-border shadow-2xl flex flex-col overflow-hidden">
      {/* Address bar */}
      <div className="h-10 border-b border-border bg-surface-elevated flex items-center px-4 gap-4 shrink-0">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-danger/50" />
          <div className="size-2.5 rounded-full bg-accent/50" />
          <div className="size-2.5 rounded-full bg-secondary/50" />
        </div>
        <div className="flex-1 max-w-md h-6 bg-background rounded flex items-center px-3 border border-border">
          <span className="text-[10px] text-muted-foreground truncate">
            {url || "stridify.app/preview/..."}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {previewUrl ? (
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title="Agent Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-muted-foreground">
            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
              <div className="size-12 rounded-full bg-primary/25 flex items-center justify-center">
                <div className="size-5 rounded-full bg-primary animate-pulse" />
              </div>
            </div>
            <p className="text-sm font-medium">
              Enter a prompt to preview your agent
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
