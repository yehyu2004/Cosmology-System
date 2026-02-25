"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Shield, GraduationCap, BookOpen, ShieldCheck, UserCheck, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type Role = "STUDENT" | "TA" | "PROFESSOR" | "ADMIN";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
  studentId: string | null;
  createdAt: string;
}

interface Props {
  users: User[];
  currentUserId: string;
  currentUserRole: Role;
}

const ROLE_RANK: Record<Role, number> = { STUDENT: 0, TA: 1, PROFESSOR: 2, ADMIN: 3 };

const ROLES: Role[] = ["STUDENT", "TA", "PROFESSOR", "ADMIN"];

const ROLE_CONFIG: Record<Role, { label: string; color: string; bg: string }> = {
  STUDENT: {
    label: "Student",
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  TA: {
    label: "TA",
    color: "text-green-700 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  PROFESSOR: {
    label: "Professor",
    color: "text-purple-700 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  ADMIN: {
    label: "Admin",
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
};

const FILTER_TABS: { label: string; value: Role | "ALL"; icon: React.ElementType }[] = [
  { label: "All", value: "ALL", icon: Users },
  { label: "Students", value: "STUDENT", icon: GraduationCap },
  { label: "TAs", value: "TA", icon: BookOpen },
  { label: "Professors", value: "PROFESSOR", icon: Shield },
  { label: "Admins", value: "ADMIN", icon: ShieldCheck },
];

export default function UsersClient({ users: initialUsers, currentUserId, currentUserRole }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const canDelete = (targetRole: Role) => ROLE_RANK[currentUserRole] > ROLE_RANK[targetRole];

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      (u.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleCounts = ROLES.reduce(
    (acc, role) => {
      acc[role] = users.filter((u) => u.role === role).length;
      return acc;
    },
    {} as Record<Role, number>
  );

  async function handleRoleChange(userId: string, newRole: Role) {
    setUpdating(userId);
    setFeedback(null);

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }

      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u)));
      setFeedback({ type: "success", message: `Role updated to ${ROLE_CONFIG[newRole].label}` });
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Failed to update role" });
    } finally {
      setUpdating(null);
      setTimeout(() => setFeedback(null), 3000);
    }
  }

  async function handleDeleteUser(userId: string, userName: string) {
    if (!confirm(`Delete user "${userName}"? This will also remove their submissions and assignments. This cannot be undone.`)) return;

    setDeleting(userId);
    setFeedback(null);
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setFeedback({ type: "success", message: `User "${userName}" deleted` });
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Failed to delete user" });
    } finally {
      setDeleting(null);
      setTimeout(() => setFeedback(null), 3000);
    }
  }

  async function handleImpersonate(userId: string) {
    setImpersonating(userId);
    try {
      const res = await fetch("/api/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to impersonate");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Failed to impersonate" });
      setImpersonating(null);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {users.length} registered {users.length === 1 ? "user" : "users"}
        </p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`animate-fade-in px-4 py-3 rounded-lg text-sm font-medium ${
            feedback.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Filter Tabs */}
      <div
        className="animate-fade-in flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        style={{ animationDelay: "80ms" }}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = roleFilter === tab.value;
          const count = tab.value === "ALL" ? users.length : roleCounts[tab.value];
          return (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              <span className="text-xs opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div
        className="animate-fade-in relative"
        style={{ animationDelay: "160ms" }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Desktop User Table */}
      <div
        className="animate-fade-in card-minimal overflow-hidden hidden md:block"
        style={{ animationDelay: "240ms" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">
                  User
                </th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">
                  Email
                </th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">
                  Student ID
                </th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">
                  Role
                </th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">
                  Joined
                </th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const initials = (user.name || user.email)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const isSelf = user.id === currentUserId;
                  const config = ROLE_CONFIG[user.role];

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {user.name || "Unnamed"}
                              {isSelf && (
                                <span className="ml-1.5 text-xs text-gray-400">(you)</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.studentId || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        {isSelf || currentUserRole !== "ADMIN" ? (
                          <Badge className={`${config.bg} ${config.color} text-xs`}>
                            {config.label}
                          </Badge>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                            disabled={updating === user.id}
                            className="text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 transition-colors"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {ROLE_CONFIG[r].label}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString("en-CA")}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          {!isSelf && currentUserRole === "ADMIN" && (
                            <button
                              onClick={() => handleImpersonate(user.id)}
                              disabled={impersonating === user.id}
                              title={`View as ${user.name || user.email}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Impersonate
                            </button>
                          )}
                          {!isSelf && canDelete(user.role) && (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                              disabled={deleting === user.id}
                              title={`Delete ${user.name || user.email}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {deleting === user.id ? "Deleting..." : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div
        className="animate-fade-in md:hidden space-y-3"
        style={{ animationDelay: "240ms" }}
      >
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">
            No users found.
          </div>
        ) : (
          filtered.map((user) => {
            const initials = (user.name || user.email)
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const isSelf = user.id === currentUserId;
            const config = ROLE_CONFIG[user.role];

            return (
              <div
                key={user.id}
                className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-4 space-y-3"
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name || "Unnamed"}
                    {isSelf && (
                      <span className="ml-1.5 text-xs text-gray-400">(you)</span>
                    )}
                  </p>
                </div>

                {/* Email */}
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>

                {/* Student ID */}
                {user.studentId && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Student ID: {user.studentId}
                  </p>
                )}

                {/* Role */}
                <div>
                  {isSelf || currentUserRole !== "ADMIN" ? (
                    <Badge className={`${config.bg} ${config.color} text-xs`}>
                      {config.label}
                    </Badge>
                  ) : (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                      disabled={updating === user.id}
                      className="text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 transition-colors"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_CONFIG[r].label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Actions */}
                {!isSelf && (currentUserRole === "ADMIN" || canDelete(user.role)) && (
                  <div className="flex items-center gap-2">
                    {currentUserRole === "ADMIN" && (
                      <button
                        onClick={() => handleImpersonate(user.id)}
                        disabled={impersonating === user.id}
                        title={`View as ${user.name || user.email}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Impersonate
                      </button>
                    )}
                    {canDelete(user.role) && (
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                        disabled={deleting === user.id}
                        title={`Delete ${user.name || user.email}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deleting === user.id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </div>
                )}

                {/* Joined Date */}
                <p className="text-xs text-gray-500">
                  Joined {new Date(user.createdAt).toLocaleDateString("en-CA")}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
