"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    reportNumber: 1,
    totalPoints: 100,
    dueDate: "",
    rubric: "",
    published: false,
  });

  async function handleSubmit(publish: boolean) {
    setSaving(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          published: publish,
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create assignment");
        return;
      }
      toast.success(publish ? "Assignment published" : "Assignment saved as draft");
      router.push("/assignments");
    } catch (err) {
      console.error("[assignment:create]", { error: err instanceof Error ? err.message : String(err) });
      toast.error("Failed to create assignment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Assignment</h1>

      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Observational Cosmology Report 1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the assignment requirements..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reportNumber">Report Number</Label>
              <Input
                id="reportNumber"
                type="number"
                min={1}
                max={10}
                value={form.reportNumber}
                onChange={(e) => setForm({ ...form, reportNumber: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label htmlFor="totalPoints">Total Points</Label>
              <Input
                id="totalPoints"
                type="number"
                min={0}
                max={10000}
                value={form.totalPoints}
                onChange={(e) => setForm({ ...form, totalPoints: parseInt(e.target.value) || 100 })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="rubric">Grading Rubric</Label>
            <Textarea
              id="rubric"
              value={form.rubric}
              onChange={(e) => setForm({ ...form, rubric: e.target.value })}
              placeholder="Describe the grading criteria for this report..."
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()} disabled={saving}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={() => handleSubmit(false)} disabled={saving || !form.title}>
          Save as Draft
        </Button>
        <Button onClick={() => handleSubmit(true)} disabled={saving || !form.title}>
          Publish
        </Button>
      </div>
    </div>
  );
}
