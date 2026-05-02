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
  createTelephonyProject,
  updateProjectPrompt,
  updateProjectTitle,
  updateTelephonyProject,
  getVoices,
  type Voice,
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
import { BuyNumberModal } from "./buy-number-modal";

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
  const [showBuyNumber, setShowBuyNumber] = useState(false);
  const [releasingNumber, setReleasingNumber] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [setupError, setSetupError] = useState(false);

  const [selectedVoice, setSelectedVoice] = useState("");
  const [inboundEnabled, setInboundEnabled] = useState(true);
  const [assistantName, setAssistantName] = useState("Agent Name");

  useEffect(() => {
    if (telephonyProject) {
      setAssistantName(telephonyProject.agent_name || "Agent Name");
      setSelectedVoice(telephonyProject.agent_voice || "");
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
  const isPaidPlan =
    Boolean(organization?.is_subscribed) && !organization?.is_free_plan;

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getProject(projectId),
      getTelephonyProject(projectId),
      getProjectPrompts(projectId),
      getVoices(),
    ]).then(async ([proj, telProj, prompts, v]) => {
      if (cancelled) return;

      let resolvedTelProj = telProj;
      if (!resolvedTelProj && proj) {
        resolvedTelProj = await createTelephonyProject({
          projectId: proj.project_id,
          organizationId: proj.organization_id,
          agentName: "Voice Assistant",
          agentVoice: "inworld/inworld-tts-1:Ashley",
          voiceProvider: "inworld",
          provider: "livekit",
        });
      }

      if (!resolvedTelProj) {
        setSetupError(true);
        setDataLoading(false);
        return;
      }

      setProject(proj);
      setTelephonyProject(resolvedTelProj);
      setVoices(v);
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

  if (setupError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3 bg-background text-foreground">
        <p className="text-[15px] font-semibold">Telephony project not found</p>
        <p className="text-[13px] text-muted-foreground">
          This project doesn&apos;t have a telephony configuration. Please
          contact support or create a new telephony project.
        </p>
        <a
          href="/projects"
          className="mt-2 text-[13px] text-accent underline underline-offset-2"
        >
          Back to projects
        </a>
      </div>
    );
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
            voices={voices}
            phoneNumbers={phoneNumbers}
            canBuyNumber={isPaidPlan}
            releasingNumber={releasingNumber}
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
              if (isPaidPlan) {
                setShowBuyNumber(true);
              }
            }}
            onReleaseNumber={async () => {
              if (!telephonyProject?.telephone_number || releasingNumber)
                return;
              const confirmed = window.confirm(
                "Release this phone number? This removes it from your agent and cannot be undone.",
              );
              if (!confirmed) return;

              setReleasingNumber(true);
              try {
                const res = await fetch("/api/livekit/phone-numbers", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "release", projectId }),
                });
                const data = await res.json();
                if (!res.ok) {
                  throw new Error(data.error ?? "Failed to release number");
                }

                setTelephonyProject((prev) =>
                  prev
                    ? {
                        ...prev,
                        telephone_number: null,
                        phone_number_provider: null,
                        livekit_phone_number_id: null,
                        sip_dispatch_rule_id: null,
                        sip_trunk_id: null,
                        agent_status: "not_connected",
                      }
                    : prev,
                );
              } catch (err) {
                alert(
                  err instanceof Error
                    ? err.message
                    : "Failed to release number",
                );
              } finally {
                setReleasingNumber(false);
              }
            }}
            onUpgradePlan={() => {
              window.location.href = "/pricing";
            }}
            onVoiceChange={async (voiceId) => {
              setSelectedVoice(voiceId);
              const next = await updateTelephonyProject({
                projectId,
                agentVoice: voiceId,
              });
              if (next) setTelephonyProject(next);
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
            selectedVoice={selectedVoice}
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

        <BuyNumberModal
          projectId={projectId}
          open={showBuyNumber}
          onClose={() => setShowBuyNumber(false)}
          onNumberPurchased={(e164) => {
            setTelephonyProject((prev) =>
              prev
                ? { ...prev, telephone_number: e164, agent_status: "connected" }
                : prev,
            );
          }}
        />
      </main>
    </div>
  );
}
