"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/provider/account-provider";
import { TelephonyHeader } from "@/components/telephony/telephony-header";
import {
  TelephonyChatPanel,
  type TokenUsage,
} from "@/components/telephony/telephony-chat-panel";
import { TelephonySetup } from "@/components/telephony/telephony-setup";
import { PhoneSimulator } from "@/components/telephony/phone-simulator";
import { KnowledgeBaseOverlay } from "@/components/telephony/knowledge-base-overlay";
import { UpgradeModal } from "@/components/workspace/upgrade-modal";
import { PageLoader } from "@/components/ui/page-loader";
import {
  getProject,
  getProjectPrompts,
  getTelephonyProject,
  updateTelephonyProject,
} from "@/lib/project/actions";
import { getChatMessages } from "@/lib/redis/actions";
import { checkProjectBalance, updateProjectTitle } from "@/lib/project/actions";
import type { Project } from "@/model/project/project";
import type { Prompt } from "@/model/project/prompt";
import type { TelephonyProject } from "@/model/project/telephony-project";
import type { UIMessage } from "ai";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineCog6Tooth,
  HiOutlinePhone,
  HiOutlineComputerDesktop,
  HiOutlineXMark,
} from "react-icons/hi2";

type MobileTab = "chat" | "setup" | "simulator";

interface TelephonyWorkspaceProps {
  projectId: string;
}

export default function TelephonyWorkspace({
  projectId,
}: TelephonyWorkspaceProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [telephonyProject, setTelephonyProject] =
    useState<TelephonyProject | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<Prompt | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [balanceExhausted, setBalanceExhausted] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [showMobileBanner, setShowMobileBanner] = useState(true);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);

  // Telephony-specific state
  const [selectedVoice, setSelectedVoice] = useState("nova-professional");
  const [inboundEnabled, setInboundEnabled] = useState(true);
  const [assistantName, setAssistantName] = useState("Agent Name");

  // Initialize from telephonyProject when loaded
  useEffect(() => {
    if (telephonyProject) {
      setAssistantName(telephonyProject.agent_name || "Agent Name");
      setSelectedVoice(telephonyProject.agent_voice || "nova-professional");
    }
  }, [telephonyProject]);

  const phoneNumbers = telephonyProject?.telephone_number
    ? [
        {
          id: "1",
          number: telephonyProject.telephone_number,
          label: "Primary",
          active: true,
        },
      ]
    : [];

  const { user, account, organization, loading } = useAccount();
  const router = useRouter();
  const isTopPlan = organization?.plan === "Team";

  const handleUpgrade = useCallback(() => {
    if (isTopPlan) {
      setShowUpgradeModal(true);
    } else {
      router.push("/pricing");
    }
  }, [isTopPlan, router]);

  useEffect(() => {
    Promise.all([
      getProject(projectId),
      getProjectPrompts(projectId),
      getChatMessages(projectId),
      getTelephonyProject(projectId),
    ]).then(([proj, prompts, chatMessages, telProj]) => {
      setProject(proj);
      setTelephonyProject(telProj);
      if (prompts.length > 0) setInitialPrompt(prompts[0]);
      setInitialMessages(chatMessages);
      setDataLoading(false);
    });
  }, [projectId]);

  const handleStreamingComplete = useCallback(async () => {
    const proj = await getProject(projectId);
    if (proj) setProject(proj);
  }, [projectId]);

  if (loading || !user || !account || dataLoading) {
    return <PageLoader />;
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <TelephonyHeader
        projectId={projectId}
        projectName={project?.title}
        onProjectNameChange={async (newName) => {
          await updateProjectTitle(projectId, newName);
          setProject((p) => (p ? { ...p, title: newName } : p));
        }}
      />

      {/* Mobile desktop-suggestion banner */}
      {showMobileBanner && (
        <div className="flex items-center gap-2.5 px-3 py-2 bg-accent/10 text-accent text-[11px] leading-tight border-b border-accent/15 shrink-0 sm:hidden animate-in fade-in slide-in-from-top-1 duration-300">
          <HiOutlineComputerDesktop className="size-3.5 shrink-0" />
          <span className="flex-1">
            For the best experience, use a desktop browser.
          </span>
          <button
            type="button"
            onClick={() => setShowMobileBanner(false)}
            className="p-0.5 rounded hover:bg-accent/10 transition-colors"
          >
            <HiOutlineXMark className="size-3.5" />
          </button>
        </div>
      )}

      {/* Mobile tab bar */}
      <div className="flex h-10 items-center border-b border-border bg-surface shrink-0 md:hidden">
        {(
          [
            { key: "chat", label: "Chat", icon: HiOutlineChatBubbleLeftRight },
            { key: "setup", label: "Setup", icon: HiOutlineCog6Tooth },
            { key: "simulator", label: "Test", icon: HiOutlinePhone },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setMobileTab(tab.key)}
            className={[
              "flex flex-1 items-center justify-center gap-1.5 h-full text-xs font-semibold transition-colors relative",
              mobileTab === tab.key
                ? "text-foreground"
                : "text-muted-foreground",
            ].join(" ")}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
            {mobileTab === tab.key && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      <main className="flex flex-1 overflow-hidden">
        {/* Chat panel — left */}
        <div
          className={[
            "flex flex-col h-full",
            mobileTab === "chat" ? "flex w-full" : "hidden",
            "md:flex! md:w-auto",
          ].join(" ")}
        >
          <TelephonyChatPanel
            projectId={projectId}
            initialPrompt={initialPrompt}
            initialMessages={initialMessages}
            isNewProject={!initialPrompt}
            balanceExhausted={balanceExhausted}
            isSubscribed={isTopPlan}
            onTokenUpdate={setTokenUsage}
            onStreamingComplete={handleStreamingComplete}
            onInsufficientBalance={() => setBalanceExhausted(true)}
            onBuyCredits={handleUpgrade}
          />
        </div>

        {/* Setup panel — narrow left-of-simulator */}
        <div
          className={[
            "flex flex-col h-full w-full md:w-105 shrink-0 border-r border-border overflow-y-auto",
            mobileTab === "setup" ? "flex" : "hidden",
            "md:flex!",
          ].join(" ")}
        >
          <TelephonySetup
            phoneNumbers={phoneNumbers}
            selectedVoice={selectedVoice}
            inboundEnabled={inboundEnabled}
            assistantName={assistantName}
            onAssistantNameChange={setAssistantName}
            onAssistantNameBlur={async () => {
              const trimmed = assistantName.trim() || "Agent Name";
              if (trimmed !== telephonyProject?.agent_name) {
                await updateTelephonyProject({ projectId, agentName: trimmed });
              }
            }}
            onBuyNumber={() => {
              /* TODO: open buy number modal */
            }}
            onVoiceChange={async (voiceId) => {
              setSelectedVoice(voiceId);
              if (voiceId !== telephonyProject?.agent_voice) {
                await updateTelephonyProject({
                  projectId,
                  agentVoice: voiceId,
                });
              }
            }}
            onToggleInbound={setInboundEnabled}
            onOpenKnowledgeBase={() => setShowKnowledgeBase(true)}
            onOpenConversationFlow={() => {
              /* TODO: open conversation flow editor */
            }}
          />
        </div>

        {/* Simulator panel — priority space (flex-1) */}
        <div
          className={[
            "flex flex-col h-full w-full md:flex-1 min-w-0",
            mobileTab === "simulator" ? "flex" : "hidden",
            "md:flex!",
          ].join(" ")}
        >
          <PhoneSimulator
            agentName={assistantName || "Agent Name"}
            onStartCall={(number) => {
              console.log("[telephony] start test call:", number);
            }}
            onEndCall={() => {
              console.log("[telephony] call ended");
            }}
          />
        </div>
        {/* Knowledge Base Overlay */}
        <KnowledgeBaseOverlay
          open={showKnowledgeBase}
          onClose={() => setShowKnowledgeBase(false)}
        />
      </main>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={async () => {
          setShowUpgradeModal(false);
          const { exhausted } = await checkProjectBalance(projectId);
          if (!exhausted) setBalanceExhausted(false);
        }}
      />
    </div>
  );
}
