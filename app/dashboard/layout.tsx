import React from "react";
import { neonAuth } from "@neondatabase/auth/next/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

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
    <SidebarProvider>
      <DashboardSidebar user={{ name: user.name, email: user.email }} />
      <SidebarInset className="overflow-auto bg-transparent">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
