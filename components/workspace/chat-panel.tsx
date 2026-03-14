"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  HiOutlineUser,
  HiOutlinePaperClip,
  HiOutlinePaperAirplane,
  HiOutlinePlus,
  HiOutlineMicrophone,
  HiOutlinePaintBrush,
  HiOutlineCodeBracket,
  HiOutlineSparkles,
  HiOutlineCpuChip,
} from "react-icons/hi2";

const quickActions = [
  { label: "Add Feature", icon: HiOutlinePlus },
  { label: "Edit Voice Flow", icon: HiOutlineMicrophone },
  { label: "Change UI", icon: HiOutlinePaintBrush },
  { label: "Add API", icon: HiOutlineCodeBracket },
  { label: "Improve Conversation", icon: HiOutlineSparkles },
];

interface ChatPanelProps {
  projectId: string;
  onPreviewUrl?: (url: string) => void;
}

export function ChatPanel({ projectId, onPreviewUrl }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/agent",
        body: { projectId },
      }),
    [projectId],
  );

  const { messages, sendMessage, status } = useChat({
    id: projectId,
    transport,
    onFinish: ({ message }) => {
      try {
        const text = message.parts
          ?.filter(
            (p): p is { type: "text"; text: string } => p.type === "text",
          )
          .map((p) => p.text)
          .join("");
        if (text) {
          const data = JSON.parse(text);
          if (data.previewUrl) onPreviewUrl?.(data.previewUrl);
        }
      } catch {
        // Response is plain text
      }
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    await sendMessage({ text });
  };

  return (
    <aside className="w-[420px] flex flex-col border-r border-border bg-surface shrink-0">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 workspace-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center px-6 pt-24">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <HiOutlineSparkles className="size-6 text-primary" />
            </div>
            <h3 className="text-base font-semibold mb-1.5">Build your agent</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Describe what you want to create and I&apos;ll help you build it.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <div
                className={`size-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  message.role === "user"
                    ? "bg-surface-elevated"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {message.role === "user" ? (
                  <HiOutlineUser className="size-4" />
                ) : (
                  <HiOutlineCpuChip className="size-4" />
                )}
              </div>
              <div
                className={`p-3 rounded-xl text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-surface-elevated border border-border rounded-tl-none"
                    : "bg-primary/5 border border-primary/20"
                }`}
              >
                {message.parts
                  ?.filter((part) => part.type === "text")
                  .map((part, i) => (
                    <span key={i}>{part.text}</span>
                  ))}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3">
            <div className="size-8 rounded-full bg-primary/10 text-primary flex-shrink-0 flex items-center justify-center">
              <HiOutlineCpuChip className="size-4" />
            </div>
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                <div
                  className="size-1.5 rounded-full bg-primary animate-pulse"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="size-1.5 rounded-full bg-primary animate-pulse"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-surface-elevated text-muted-foreground border border-transparent hover:border-primary/30 hover:text-primary transition-all flex items-center gap-1"
            >
              <action.icon className="size-3" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="w-full h-32 p-4 pr-12 rounded-xl bg-surface-elevated border border-border focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm resize-none workspace-scrollbar placeholder:text-muted-foreground"
            placeholder="Describe the feature or logic you want to build..."
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-surface text-muted-foreground transition-colors"
            >
              <HiOutlinePaperClip className="size-5" />
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50 transition-opacity"
            >
              <HiOutlinePaperAirplane className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
