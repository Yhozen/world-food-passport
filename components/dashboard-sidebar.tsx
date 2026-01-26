"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Globe, BarChart3, LogOut, Utensils, Lock } from "lucide-react";
interface DashboardSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

const navItems = [
  { href: "/dashboard", icon: Globe, label: "World Map" },
  { href: "/dashboard/stats", icon: BarChart3, label: "Stats" },
] as const;

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white/80 backdrop-blur flex flex-col text-slate-700">
      <div className="px-6 pt-8 pb-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Utensils className="h-5 w-5 text-amber-600" />
          </div>
          <span className="text-sm font-semibold text-slate-900">
            World Food Passport
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-full px-4 py-2 text-sm transition ${
                  isActive
                    ? "bg-amber-100 text-amber-900"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="px-4 pb-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5" />
            <span className="font-medium">Private mode</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user.name || "Food Lover"}
            </p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              void authClient.signOut();
            }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-400"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
