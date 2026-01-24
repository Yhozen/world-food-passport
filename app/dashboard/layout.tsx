import React from "react"
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar session={session} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
