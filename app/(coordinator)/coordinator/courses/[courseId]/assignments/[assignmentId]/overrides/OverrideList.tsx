"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import OverrideForm from "@/components/coordinator/OverrideForm";

interface Override {
  id: number;
  assignment_id: number;
  section_id: number;
  due_date: string;
  section_name: string;
}

interface Section {
  id: number;
  name: string;
}

interface OverrideListProps {
  assignmentId: string;
  allSections: Section[];
  initialOverrides: Override[];
}

export default function OverrideList({ assignmentId, allSections, initialOverrides }: OverrideListProps) {
  const router = useRouter();
  const [overrides, setOverrides] = useState<Override[]>(initialOverrides);
  const [editingOverride, setEditingOverride] = useState<Override | null>(null);
  const [editDate, setEditDate] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Override | null>(null);
  const [loading, setLoading] = useState(false);

  const availableSections = allSections.filter(
    (s) => !overrides.some((o) => o.section_id === s.id)
  );

  const handleAddSuccess = () => {
    router.refresh();
    fetch(`/api/assignments/${assignmentId}/overrides`)
      .then((res) => res.json())
      .then(setOverrides);
  };

  const handleEdit = async () => {
    if (!editingOverride || !editDate) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/assignments/${assignmentId}/overrides/${editingOverride.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ due_date: new Date(editDate).toISOString() }),
        }
      );
      if (res.ok) {
        setEditingOverride(null);
        router.refresh();
        const updated = await fetch(`/api/assignments/${assignmentId}/overrides`);
        setOverrides(await updated.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/assignments/${assignmentId}/overrides/${deleteTarget.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setDeleteTarget(null);
        setOverrides((prev) => prev.filter((o) => o.id !== deleteTarget.id));
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDateForInput = (dateStr: string) =>
    new Date(dateStr).toISOString().slice(0, 16);

  return (
    <div className="space-y-6">
      {/* Add Override Form */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Add Override</h3>
        <OverrideForm
          assignmentId={assignmentId}
          availableSections={availableSections}
          onSuccess={handleAddSuccess}
        />
      </div>

      {/* Overrides Table */}
      {overrides.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            No overrides yet. All sections use the default deadline.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Section</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Override Deadline</th>
                <th className="text-right p-4 text-muted-foreground font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {overrides.map((override) => (
                <tr key={override.id} className="border-b border-border last:border-0">
                  <td className="p-4 text-foreground font-medium">{override.section_name}</td>
                  <td className="p-4 text-muted-foreground">{formatDate(override.due_date)}</td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        className="border border-border text-muted-foreground hover:bg-accent text-sm py-1 px-3 rounded transition"
                        onClick={() => {
                          setEditingOverride(override);
                          setEditDate(formatDateForInput(override.due_date));
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-destructive hover:bg-destructive/90 text-white text-sm py-1 px-3 rounded transition"
                        onClick={() => setDeleteTarget(override)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingOverride} onOpenChange={(open) => !open && setEditingOverride(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Override</DialogTitle>
            <DialogDescription>
              Update the deadline for {editingOverride?.section_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <label htmlFor="edit-date" className="text-sm font-medium text-foreground">New Deadline</label>
            <input
              id="edit-date"
              type="datetime-local"
              className="w-full px-3 py-2 bg-input border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <button
              className="border border-border text-muted-foreground hover:bg-accent py-2 px-4 rounded transition"
              onClick={() => setEditingOverride(null)}
            >
              Cancel
            </button>
            <button
              className="bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded transition"
              onClick={handleEdit}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Override</DialogTitle>
            <DialogDescription>
              Remove the deadline override for {deleteTarget?.section_name}? This section will
              revert to the default deadline.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className="border border-border text-muted-foreground hover:bg-accent py-2 px-4 rounded transition"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              className="bg-destructive hover:bg-destructive/90 text-white py-2 px-4 rounded transition"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
