"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { BarChart3, Globe, Lock, LogOut, Trophy, Utensils } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
interface DashboardSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

const navItems = [
  { href: "/dashboard", icon: Globe, label: "World Map" },
  { href: "/dashboard/stats", icon: BarChart3, label: "Stats" },
  { href: "/dashboard/challenges", icon: Trophy, label: "Challenges" },
] as const;

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-3 px-2 pt-3">
        <div className="flex items-center gap-2 px-2">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
              <Utensils className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              World Food Passport
            </span>
          </Link>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                  >
                    <Link href={item.href as never}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3">
        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/20 px-3 py-2 text-xs text-sidebar-foreground/80 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5" />
            <span className="font-medium">Private mode</span>
          </div>
        </div>
        <div className="rounded-lg border border-sidebar-border bg-sidebar px-3 py-3 text-xs text-sidebar-foreground group-data-[collapsible=icon]:hidden">
          <p className="text-sm font-semibold text-sidebar-foreground truncate">
            {user.name || "Food Lover"}
          </p>
          <p className="text-xs text-sidebar-foreground/70 truncate">
            {user.email}
          </p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              type="button"
              tooltip="Sign out"
              onClick={() => {
                void authClient.signOut();
              }}
            >
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
