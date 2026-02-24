"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
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
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EffectiveRoleProvider } from "@/components/providers/EffectiveRoleContext";

interface MainLayoutClientProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  userImage?: string;
  userRole: string;
  isImpersonating?: boolean;
  realUserName?: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: null },
  { href: "/assignments", label: "Assignments", icon: FileText, roles: null },
  { href: "/simulations", label: "Simulations", icon: FlaskConical, roles: null },
  { href: "/grading", label: "Grading", icon: ClipboardCheck, roles: ["TA", "PROFESSOR", "ADMIN"] },
  { href: "/grades", label: "My Grades", icon: GraduationCap, roles: ["STUDENT"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["TA", "PROFESSOR", "ADMIN"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: null },
];

export default function MainLayoutClient({
  children,
  userName,
  userEmail,
  userImage,
  userRole,
  isImpersonating,
  realUserName,
}: MainLayoutClientProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [stoppingImpersonation, setStoppingImpersonation] = useState(false);

  async function stopImpersonating() {
    setStoppingImpersonation(true);
    await fetch("/api/impersonate", { method: "DELETE" });
    window.location.href = "/admin/users";
  }

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
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-200 lg:static lg:translate-x-0",
          collapsed ? "lg:w-[68px]" : "w-64",
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full"
        )}
      >
        <div className={cn(
          "flex items-center gap-3 py-5 border-b border-gray-200 dark:border-gray-800",
          collapsed ? "px-3 justify-center" : "px-5"
        )}>
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-5 h-5 text-blue-400" />
            </button>
          ) : (
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10 shrink-0">
              <Telescope className="w-5 h-5 text-blue-400" />
            </div>
          )}
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-bold text-gray-900 dark:text-white">Cosmo</h1>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        <nav className={cn(
          "flex-1 overflow-y-auto py-4 space-y-1",
          collapsed ? "px-2" : "px-3"
        )}>
          {visibleItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  collapsed ? "justify-center px-0" : "px-3",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <item.icon className="w-4.5 h-4.5 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div className={cn(
          "border-t border-gray-200 dark:border-gray-800",
          collapsed ? "p-2" : "p-4"
        )}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={userImage} />
                <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                <Sun className="w-4 h-4 hidden dark:block" />
                <Moon className="w-4 h-4 block dark:hidden" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={userImage} />
                  <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{userRole}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                >
                  <Sun className="w-4 h-4 hidden dark:block" />
                  <Moon className="w-4 h-4 block dark:hidden" />
                </Button>
              </div>
            </>
          )}
        </div>

      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center h-14 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2" aria-label="Open menu">
            {sidebarOpen ? (
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <div className="flex items-center gap-2 ml-3">
            <Telescope className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-sm text-gray-900 dark:text-white">Cosmo</span>
          </div>
        </header>

        {isImpersonating && (
          <div className="flex items-center justify-between gap-3 px-4 py-2 bg-amber-100 dark:bg-amber-900/40 border-b border-amber-200 dark:border-amber-800 text-sm">
            <span className="text-amber-900 dark:text-amber-200">
              Viewing as <strong>{userName}</strong> &mdash; Logged in as {realUserName}
            </span>
            <button
              onClick={stopImpersonating}
              disabled={stoppingImpersonation}
              className="shrink-0 px-3 py-1 rounded-md text-xs font-medium bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 hover:bg-amber-300 dark:hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {stoppingImpersonation ? "Stopping..." : "Stop Impersonating"}
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <EffectiveRoleProvider userRole={userRole}>
            {children}
          </EffectiveRoleProvider>
        </main>
      </div>
    </div>
  );
}
