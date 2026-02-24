"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role || "STUDENT";

  const initials = (session?.user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback className="text-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {session?.user?.name || "User"}
              </p>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
              <Badge variant="outline" className="mt-1">{role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
