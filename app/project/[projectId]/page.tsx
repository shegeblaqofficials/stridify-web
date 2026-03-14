"use client";

import { use, useState } from "react";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { ChatPanel } from "@/components/workspace/chat-panel";
import { PreviewPanel } from "@/components/workspace/preview-panel";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectPage({ params }: PageProps) {
  const { projectId } = use(params);
  const [previewUrl, setPreviewUrl] = useState<string>();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      <WorkspaceHeader />
      <main className="flex flex-1 overflow-hidden">
        <ChatPanel projectId={projectId} onPreviewUrl={setPreviewUrl} />
        <PreviewPanel previewUrl={previewUrl} />
      </main>
    </div>
  );
}
