"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ASSIGNMENT_TYPES = [
  { value: "LAB", label: "Lab" },
  { value: "SHEET", label: "Sheet" },
  { value: "QUIZ", label: "Quiz" },
  { value: "MIDTERM", label: "Midterm" },
  { value: "FINAL_PROJECT", label: "Final Project" },
  { value: "OTHER", label: "Other" },
];

interface AssignmentFormProps {
  courseId: string;
  initialData?: {
    id?: number;
    title?: string;
    type?: string;
    description?: string;
    due_date?: string;
    resource_link?: string;
    submission_link?: string;
    team_size?: number;
  };
  mode: "create" | "edit";
}

export default function AssignmentForm({ courseId, initialData, mode }: AssignmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toISOString().slice(0, 16);
  };

  const [title, setTitle] = useState(initialData?.title || "");
  const [type, setType] = useState(initialData?.type || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [dueDate, setDueDate] = useState(formatDateForInput(initialData?.due_date));
  const [resourceLink, setResourceLink] = useState(initialData?.resource_link || "");
  const [submissionLink, setSubmissionLink] = useState(initialData?.submission_link || "");
  const [teamSize, setTeamSize] = useState(initialData?.team_size || 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      course_id: parseInt(courseId),
      title,
      type,
      description,
      due_date: new Date(dueDate).toISOString(),
      resource_link: resourceLink || null,
      submission_link: submissionLink || null,
      team_size: teamSize,
    };

    try {
      const url = mode === "create"
        ? "/api/assignments"
        : `/api/assignments/${initialData?.id}`;

      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push(`/coordinator/courses/${courseId}/assignments`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 bg-input border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  const labelClass = "block text-sm font-medium text-foreground mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className={labelClass}>Title *</label>
        <input
          id="title"
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Lab 1: Hello World"
          required
        />
      </div>

      <div>
        <label htmlFor="type" className={labelClass}>Type *</label>
        <select
          id="type"
          className={inputClass}
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        >
          <option value="" disabled>Select assignment type</option>
          {ASSIGNMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>Description</label>
        <textarea
          id="description"
          className={inputClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Instructions, notes, or details for students..."
          rows={4}
        />
      </div>

      <div>
        <label htmlFor="due_date" className={labelClass}>Default Due Date *</label>
        <input
          id="due_date"
          type="datetime-local"
          className={inputClass}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="resource_link" className={labelClass}>Resource Link</label>
          <input
            id="resource_link"
            type="url"
            className={inputClass}
            value={resourceLink}
            onChange={(e) => setResourceLink(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div>
          <label htmlFor="submission_link" className={labelClass}>Submission Link</label>
          <input
            id="submission_link"
            type="url"
            className={inputClass}
            value={submissionLink}
            onChange={(e) => setSubmissionLink(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <label htmlFor="team_size" className={labelClass}>Team Size</label>
        <input
          id="team_size"
          type="number"
          min={1}
          max={10}
          className={inputClass}
          value={teamSize}
          onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-semibold py-2 px-4 rounded transition"
        >
          {loading
            ? mode === "create" ? "Creating..." : "Saving..."
            : mode === "create" ? "Create Assignment" : "Save Changes"
          }
        </button>
        <button
          type="button"
          className="border border-border text-muted-foreground hover:bg-accent py-2 px-4 rounded transition"
          onClick={() => router.push(`/coordinator/courses/${courseId}/assignments`)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
