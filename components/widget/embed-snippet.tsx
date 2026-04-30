"use client";

import { useState } from "react";
import { HiOutlineClipboard, HiOutlineCheck } from "react-icons/hi2";

interface EmbedSnippetProps {
  code: string;
  language?: string;
}

export function EmbedSnippet({ code, language = "html" }: EmbedSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("[embed-snippet] copy failed:", err);
    }
  };

  return (
    <div className="relative group rounded-lg border border-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-surface-elevated">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md bg-background hover:bg-surface-elevated text-foreground border border-border transition-colors"
        >
          {copied ? (
            <>
              <HiOutlineCheck className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <HiOutlineClipboard className="size-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs leading-relaxed font-mono overflow-x-auto text-foreground bg-background">
        <code>{code}</code>
      </pre>
    </div>
  );
}
