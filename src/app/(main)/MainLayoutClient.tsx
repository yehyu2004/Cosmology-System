"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Telescope,
  LayoutDashboard,
  FileText,
  FlaskConical,
  ClipboardCheck,
  GraduationCap,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface MainLayoutClientProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  userImage?: string;
  userRole: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: null },
  { href: "/assignments", label: "Assignments", icon: FileText, roles: null },
  { href: "/simulations", label: "Simulations", icon: FlaskConical, roles: null },
  { href: "/grading", label: "Grading", icon: ClipboardCheck, roles: ["TA", "PROFESSOR", "ADMIN"] },
  { href: "/grades", label: "My Grades", icon: GraduationCap, roles: ["STUDENT"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: null },
];

export default function MainLayoutClient({
  children,
  userName,
  userEmail,
  userImage,
  userRole,
}: MainLayoutClientProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-500/10">
            <Telescope className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">CosmoTA</h1>
            <p className="text-xs text-gray-500">Observational Cosmology</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <item.icon className="w-4.5 h-4.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={userImage} />
              <AvatarFallback className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{userRole}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-500 hover:text-red-600 dark:hover:text-red-400"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center h-14 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2">
            {sidebarOpen ? (
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <div className="flex items-center gap-2 ml-3">
            <Telescope className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-sm text-gray-900 dark:text-white">CosmoTA</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
