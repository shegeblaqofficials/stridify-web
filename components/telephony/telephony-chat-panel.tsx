"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import type { Prompt } from "@/model/project/prompt";
import type {
  CodingAgentUIMessage,
  AgentMessageMetadata,
} from "@/lib/agents/coding-agent";
import { checkProjectBalance } from "@/lib/project/actions";
import {
  HiOutlineUser,
  HiOutlinePaperClip,
  HiOutlinePaperAirplane,
  HiOutlinePlus,
  HiOutlineMicrophone,
  HiOutlineBookOpen,
  HiOutlineSparkles,
  HiOutlineCpuChip,
  HiOutlineBolt,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";

const quickActions = [
  { label: "Add Feature", icon: HiOutlinePlus },
  { label: "Edit Voice Flow", icon: HiOutlineMicrophone },
  { label: "Add Knowledge", icon: HiOutlineBookOpen },
  { label: "Improve Conversation", icon: HiOutlineSparkles },
];

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

interface TelephonyChatPanelProps {
  projectId: string;
  initialPrompt?: Prompt | null;
  initialMessages?: UIMessage[];
  isNewProject?: boolean;
  balanceExhausted?: boolean;
  isSubscribed?: boolean;
  onTokenUpdate?: (usage: TokenUsage) => void;
  onStreamingComplete?: () => void;
  onInsufficientBalance?: () => void;
  onBuyCredits?: () => void;
}

export function TelephonyChatPanel({
  projectId,
  initialPrompt,
  initialMessages,
  isNewProject,
  balanceExhausted: balanceExhaustedProp = false,
  isSubscribed = false,
  onTokenUpdate,
  onStreamingComplete,
  onInsufficientBalance,
  onBuyCredits,
}: TelephonyChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [balanceExhaustedLocal, setBalanceExhaustedLocal] = useState(false);
  const initialPromptSent = useRef(false);

  const balanceExhausted = balanceExhaustedProp || balanceExhaustedLocal;

  useEffect(() => {
    if (!balanceExhaustedProp) setBalanceExhaustedLocal(false);
  }, [balanceExhaustedProp]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/agent",
        body: { projectId },
        prepareSendMessagesRequest({ messages, id }) {
          return {
            body: {
              message: messages[messages.length - 1],
              id,
              projectId,
            },
          };
        },
      }),
    [projectId],
  );

  const { messages, sendMessage, status } = useChat<CodingAgentUIMessage>({
    id: projectId,
    messages: initialMessages as CodingAgentUIMessage[] | undefined,
    transport,
    onError(error) {
      if (
        error?.message?.includes("402") ||
        error?.message?.includes("insufficient_balance")
      ) {
        setBalanceExhaustedLocal(true);
        onInsufficientBalance?.();
        return;
      }
      checkProjectBalance(projectId).then(({ exhausted }) => {
        if (exhausted) {
          setBalanceExhaustedLocal(true);
          onInsufficientBalance?.();
        }
      });
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (
      isNewProject &&
      initialPrompt?.content &&
      !initialPromptSent.current &&
      messages.length === 0
    ) {
      initialPromptSent.current = true;
      sendMessage({ text: initialPrompt.content });
    }
  }, [isNewProject, initialPrompt, messages.length, sendMessage]);

  const prevStatus = useRef(status);
  useEffect(() => {
    if (
      prevStatus.current === "streaming" &&
      status === "ready" &&
      onStreamingComplete
    ) {
      onStreamingComplete();
    }
    prevStatus.current = status;
  }, [status, onStreamingComplete]);

  useEffect(() => {
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    const metadata = lastAssistant?.metadata as
      | AgentMessageMetadata
      | undefined;
    if (metadata?.tokenUsage) {
      onTokenUpdate?.(metadata.tokenUsage);
    }
    if (metadata?.balanceExhausted && !balanceExhausted) {
      setBalanceExhaustedLocal(true);
      onInsufficientBalance?.();
    }
  }, [messages, onTokenUpdate, onInsufficientBalance, balanceExhausted]);

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
    <aside className="w-full md:w-[420px] h-full flex flex-col border-r border-border/60 bg-background shrink-0 min-h-0">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 workspace-scrollbar min-h-0"
      >
        {messages.length === 0 && !initialPrompt ? (
          <div className="flex flex-col items-center justify-center text-center px-6 pt-20">
            <div className="size-11 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
              <HiOutlineChatBubbleLeftRight className="size-5 text-primary/80" />
            </div>
            <h3 className="text-sm font-semibold mb-1 text-foreground/90">
              Build your voice agent
            </h3>
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              Describe your agent&apos;s purpose and I&apos;ll help you
              configure it for phone calls.
            </p>
          </div>
        ) : (
          <>
            {initialPrompt && messages.length === 0 && (
              <div className="flex gap-2.5">
                <div className="size-6 rounded-full shrink-0 flex items-center justify-center bg-surface-elevated border border-border/60">
                  <HiOutlineUser className="size-3 text-muted-foreground/70" />
                </div>
                <div className="px-3 py-2 rounded-2xl rounded-tl-md text-[13px] leading-relaxed bg-surface-elevated border border-border/40 max-w-[85%]">
                  {initialPrompt.content}
                </div>
              </div>
            )}
            {messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="flex gap-2.5">
                  <div className="size-6 rounded-full shrink-0 flex items-center justify-center bg-surface-elevated border border-border/60">
                    <HiOutlineUser className="size-3 text-muted-foreground/70" />
                  </div>
                  <div className="px-3 py-2 rounded-2xl rounded-tl-md text-[13px] leading-relaxed bg-surface-elevated border border-border/40 max-w-[85%]">
                    {message.parts?.map((part, i) =>
                      part.type === "text" ? (
                        <span key={i}>{part.text}</span>
                      ) : null,
                    )}
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex gap-2.5">
                  <div className="size-6 rounded-full shrink-0 flex items-center justify-center bg-primary/8 border border-primary/15">
                    <HiOutlineCpuChip className="size-3 text-primary/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 rounded-2xl rounded-tl-md text-[13px] leading-relaxed bg-surface border border-border/30 max-w-[95%]">
                      {message.parts?.map((part, i) =>
                        part.type === "text" ? (
                          <span key={i}>{part.text}</span>
                        ) : null,
                      )}
                    </div>
                  </div>
                </div>
              ),
            )}
          </>
        )}

        {/* System logs placeholder */}
        {isLoading && messages.length === 0 && (
          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Setting up your agent...</span>
            </div>
          </div>
        )}

        {isLoading && messages.length > 0 && (
          <div className="flex gap-2.5">
            <div className="size-6 rounded-full bg-primary/8 border border-primary/15 shrink-0 flex items-center justify-center">
              <HiOutlineCpuChip className="size-3 text-primary/70" />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-surface-elevated border border-border/40">
              <span className="flex items-center gap-0.5">
                <span className="size-1 rounded-full bg-primary/50 animate-pulse" />
                <span
                  className="size-1 rounded-full bg-primary/50 animate-pulse"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="size-1 rounded-full bg-primary/50 animate-pulse"
                  style={{ animationDelay: "300ms" }}
                />
              </span>
              <span className="text-[11px] text-muted-foreground/60 font-medium">
                Processing
              </span>
            </div>
          </div>
        )}

        {/* Balance exhausted banner */}
        {balanceExhausted && (
          <div className="mx-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <HiOutlineBolt className="size-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Out of credits
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                    Your progress has been saved. Upgrade to keep building.
                  </p>
                  {onBuyCredits && (
                    <button
                      type="button"
                      onClick={() => onBuyCredits()}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-[0.97]"
                    >
                      <HiOutlineSparkles className="size-3" />
                      {isSubscribed ? "Buy 50,000 Credits" : "Upgrade Plan"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions + Input */}
      <div className="mt-auto shrink-0">
        <div className="px-3 pb-2 md:px-4">
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-surface-elevated/80 text-muted-foreground/70 border border-border/40 hover:border-border hover:text-foreground/80 transition-all flex items-center gap-1.5"
              >
                <action.icon className="size-3" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 md:p-4 border-t border-border/60">
          {isLoading && (
            <div className="flex items-center justify-end gap-1.5 pb-1.5 animate-in fade-in duration-300">
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-medium text-red-500">
                Processing...
              </span>
            </div>
          )}
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
              disabled={balanceExhausted}
              className={`w-full h-20 md:h-28 p-3 md:p-3.5 pr-12 rounded-xl bg-surface-elevated border outline-none text-[13px] resize-none workspace-scrollbar placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${
                isLoading
                  ? "border-red-500/50 focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50"
                  : "border-border/50 focus:ring-1 focus:ring-primary/40 focus:border-primary/40"
              }`}
              placeholder={
                balanceExhausted
                  ? "Upgrade your plan to continue..."
                  : "Ask AI to edit flow or add features..."
              }
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
                disabled={isLoading || !input.trim() || balanceExhausted}
                className="p-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50 transition-opacity"
              >
                <HiOutlinePaperAirplane className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
