"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useEffectiveRole } from "@/components/providers/EffectiveRoleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const { data: session } = useSession();
  const role = useEffectiveRole();

  const [studentId, setStudentId] = useState("");
  const [savedStudentId, setSavedStudentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const justSavedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        const id = data.studentId || "";
        setStudentId(id);
        setSavedStudentId(id);
      })
      .catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentId.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      const updated = await res.json();
      const id = updated.studentId || "";
      setStudentId(id);
      setSavedStudentId(id);
      setFeedback({ type: "success", message: "Student ID saved" });

      // Show "Saved!" on the button for 2 seconds
      setJustSaved(true);
      if (justSavedTimerRef.current) clearTimeout(justSavedTimerRef.current);
      justSavedTimerRef.current = setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Failed to save" });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  }

  const initials = (session?.user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hasChanges = studentId !== savedStudentId;

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
              <AvatarFallback className="text-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
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

      <Card>
        <CardHeader>
          <CardTitle>Student ID</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">Student Number</Label>
            <Input
              id="studentId"
              placeholder="e.g. 112345678"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>

          {feedback && (
            <p
              className={`text-sm font-medium ${
                feedback.type === "success"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {feedback.message}
            </p>
          )}

          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed h-11 px-6 rounded-lg font-medium"
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving...
              </>
            ) : justSaved ? (
              "Saved!"
            ) : (
              "Save"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
