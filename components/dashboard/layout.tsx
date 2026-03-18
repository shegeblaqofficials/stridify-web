"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { useAccount } from "@/provider/account-provider";
import { PageLoader } from "@/components/ui/page-loader";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, account, loading } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || !account?.is_active) {
      router.replace("/");
    }
  }, [user, account, loading, router]);

  if (loading) return <PageLoader />;
  if (!user || !account?.is_active) return <PageLoader />;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
