"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/provider/account-provider";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { ChatPanel } from "@/components/workspace/chat-panel";
import { PreviewPanel } from "@/components/workspace/preview-panel";
import { PageLoader } from "@/components/ui/page-loader";

interface WorkspaceProps {
  projectId: string;
}

export default function Workspace({ projectId }: WorkspaceProps) {
  const [previewUrl, setPreviewUrl] = useState<string>();
  const router = useRouter();
  const { user, account, loading } = useAccount();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
    if (!loading && account && account.is_active !== true) {
      router.push("/beta-access");
    }
  }, [loading]);

  if (!user) {
    return <PageLoader />;
  }

  console.log("Rendering ProjectPage with projectId:", loading);

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
