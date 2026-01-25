import React from "react";
import { neonAuth } from "@neondatabase/auth/next/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await neonAuth();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar user={{ name: user.name, email: user.email }} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
