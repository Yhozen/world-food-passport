"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions";
import {
  Globe,
  BarChart3,
  List,
  Settings,
  LogOut,
  Utensils,
  Lock,
} from "lucide-react";
import type { Session } from "@/lib/auth";

interface DashboardSidebarProps {
  session: Session;
}

export function DashboardSidebar({ session }: DashboardSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: Globe, label: "World Map" },
    { href: "/dashboard/stats", icon: BarChart3, label: "Stats" },
    { href: "/dashboard/all", icon: List, label: "All Visits" },
  ];

  return (
    <aside className="w-64 bg-card border-r-4 border-black flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b-4 border-black">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary border-4 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
            <Utensils className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold uppercase tracking-tight">
            Food Passport
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 border-4 border-black font-bold uppercase text-sm transition-all ${
                isActive
                  ? "bg-primary text-black shadow-[3px_3px_0px_0px_#000]"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Privacy Badge */}
      <div className="px-4 pb-4">
        <div className="p-3 bg-accent/20 border-4 border-accent/50 flex items-center gap-2">
          <Lock className="w-4 h-4 text-accent" />
          <span className="text-xs font-mono uppercase text-accent">
            Private Mode
          </span>
        </div>
      </div>

      {/* User section */}
      <div className="p-4 border-t-4 border-black">
        <div className="mb-4">
          <p className="font-bold truncate">{session.name || "Food Lover"}</p>
          <p className="text-xs text-muted-foreground truncate font-mono">
            {session.email}
          </p>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border-4 border-black bg-background text-foreground font-bold uppercase text-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
