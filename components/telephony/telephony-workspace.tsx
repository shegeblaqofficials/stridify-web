"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "@/provider/account-provider";
import { TelephonyHeader } from "@/components/telephony/telephony-header";
import { PhoneSimulator } from "@/components/telephony/phone-simulator";
import { KnowledgeBaseOverlay } from "@/components/knowledge/knowledge-base-overlay";
import { PageLoader } from "@/components/ui/page-loader";
import {
  getProject,
  getProjectPrompts,
  getTelephonyProject,
  updateProjectPrompt,
  updateProjectTitle,
  updateTelephonyProject,
} from "@/lib/project/actions";
import type { Project } from "@/model/project/project";
import type { TelephonyProject } from "@/model/project/telephony-project";
import {
  HiOutlineCog6Tooth,
  HiOutlinePhone,
  HiOutlineComputerDesktop,
  HiOutlineXMark,
} from "react-icons/hi2";
import { TelephonySetupPanel } from "./telephony-setup-panel";

type MobileTab = "setup" | "simulator";

interface TelephonyWorkspaceProps {
  projectId: string;
}

export default function TelephonyWorkspace({
  projectId,
}: TelephonyWorkspaceProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [telephonyProject, setTelephonyProject] =
    useState<TelephonyProject | null>(null);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTab>("setup");
  const [showMobileBanner, setShowMobileBanner] = useState(true);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);

  const [selectedVoice, setSelectedVoice] = useState("nova-professional");
  const [inboundEnabled, setInboundEnabled] = useState(true);
  const [assistantName, setAssistantName] = useState("Agent Name");

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

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getProject(projectId),
      getTelephonyProject(projectId),
      getProjectPrompts(projectId),
    ]).then(([proj, telProj, prompts]) => {
      if (cancelled) return;
      setProject(proj);
      setTelephonyProject(telProj);
      setSystemPrompt(
        prompts.length > 0 ? prompts[prompts.length - 1].content : "",
      );
      setDataLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleProjectNameChange = useCallback(
    async (newName: string) => {
      await updateProjectTitle(projectId, newName);
      setProject((p) => (p ? { ...p, title: newName } : p));
    },
    [projectId],
  );

  if (loading || !user || !account || !organization || dataLoading) {
    return <PageLoader />;
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <TelephonyHeader
        projectId={projectId}
        projectName={project?.title}
        onProjectNameChange={handleProjectNameChange}
      />

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

      <div className="flex h-10 items-center border-b border-border bg-surface shrink-0 md:hidden">
        {(
          [
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

      <main className="flex flex-1 overflow-hidden relative">
        <div
          className={[
            "h-full w-full md:w-105 shrink-0 md:border-r md:border-border",
            mobileTab === "setup" ? "flex" : "hidden",
            "md:flex!",
          ].join(" ")}
        >
          <TelephonySetupPanel
            phoneNumbers={phoneNumbers}
            selectedVoice={selectedVoice}
            inboundEnabled={inboundEnabled}
            assistantName={assistantName}
            systemPrompt={systemPrompt}
            onSystemPromptSave={async (next) => {
              const res = await updateProjectPrompt(
                projectId,
                organization.organization_id,
                next,
              );
              if (res) setSystemPrompt(res.content);
            }}
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
          />
        </div>

        <div
          className={[
            "flex flex-col h-full w-full md:flex-1 min-w-0",
            mobileTab === "simulator" ? "flex" : "hidden",
            "md:flex!",
          ].join(" ")}
        >
          <PhoneSimulator
            projectId={projectId}
            agentName={assistantName || "Agent Name"}
            onStartCall={(number) => {
              console.log("[telephony] start test call:", number);
            }}
            onEndCall={() => {
              console.log("[telephony] call ended");
            }}
          />
        </div>

        <KnowledgeBaseOverlay
          open={showKnowledgeBase}
          onClose={() => setShowKnowledgeBase(false)}
        />
      </main>
    </div>
  );
}
