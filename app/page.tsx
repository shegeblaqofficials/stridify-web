"use client";

import { useAccount } from "@/provider/account-provider";
import { LandingPage } from "@/components/landing-page/landing-page";
import { DashboardLayout } from "@/components/dashboard/layout";
import DashboardHome from "@/components/dashboard/home";
import { PageLoader } from "@/components/ui/page-loader";

export default function Home() {
  const { user, loading } = useAccount();

  if (loading) return <PageLoader />;

  if (user) {
    return (
      <DashboardLayout>
        <DashboardHome />
      </DashboardLayout>
    );
  }

  return <LandingPage />;
}
