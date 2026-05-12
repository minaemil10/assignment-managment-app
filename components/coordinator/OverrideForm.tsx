"use client";

import { useState } from "react";

interface Section {
  id: number;
  name: string;
}

interface OverrideFormProps {
  assignmentId: string;
  availableSections: Section[];
  onSuccess: () => void;
}

export default function OverrideForm({ assignmentId, availableSections, onSuccess }: OverrideFormProps) {
  const [sectionId, setSectionId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputClass = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/assignments/${assignmentId}/overrides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section_id: parseInt(sectionId),
          due_date: new Date(dueDate).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add override");
        setLoading(false);
        return;
      }

      setSectionId("");
      setDueDate("");
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (availableSections.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        All sections already have overrides.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1">
          <label htmlFor="override-section" className="block text-sm font-medium text-gray-300 mb-1">
            Section
          </label>
          <select
            id="override-section"
            className={inputClass}
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            required
          >
            <option value="" disabled>Select section</option>
            {availableSections.map((s) => (
              <option key={s.id} value={s.id.toString()}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="override-date" className="block text-sm font-medium text-gray-300 mb-1">
            Override Deadline
          </label>
          <input
            id="override-date"
            type="datetime-local"
            className={inputClass}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded transition shrink-0"
        >
          {loading ? "Adding..." : "Add Override"}
        </button>
      </div>
    </form>
  );
}
