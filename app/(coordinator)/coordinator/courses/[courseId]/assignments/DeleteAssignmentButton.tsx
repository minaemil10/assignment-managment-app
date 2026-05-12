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
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteAssignmentButtonProps {
  assignmentId: number;
  assignmentTitle: string;
  courseId: string;
}

export default function DeleteAssignmentButton({
  assignmentId,
  assignmentTitle,
}: DeleteAssignmentButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button className="bg-destructive hover:bg-destructive/90 text-white text-sm py-1 px-3 rounded transition" />
      }>
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Assignment</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{assignmentTitle}&quot;? This will also delete all
            its deadline overrides. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            className="border border-border text-muted-foreground hover:bg-accent py-2 px-4 rounded transition"
            onClick={() => setOpen(false)}
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
  );
}
