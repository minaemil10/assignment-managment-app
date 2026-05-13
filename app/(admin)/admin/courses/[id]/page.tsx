"use client";

import { useState, useEffect, use } from "react";
import { Course, Section, LabGroup, User } from "@/types/models";
import Link from "next/link";

interface CourseDetail extends Course {
  sections: Section[];
  labs: LabGroup[];
  coordinators: User[];
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [allCoordinators, setAllCoordinators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form States
  const [sectionName, setSectionName] = useState("");
  const [labName, setLabName] = useState("");
  const [selectedCoordId, setSelectedCoordId] = useState("");

  const fetchData = async () => {
    try {
      const [courseRes, usersRes] = await Promise.all([
        fetch(`/api/courses/${id}`),
        fetch("/api/users")
      ]);

      if (courseRes.ok) {
        setCourse(await courseRes.json());
      } else {
        setError("Course not found");
      }

      if (usersRes.ok) {
        const users: User[] = await usersRes.json();
        setAllCoordinators(users.filter(u => u.role === 'COORDINATOR'));
      }
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const addSection = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/courses/${id}/sections`, {
      method: "POST",
      body: JSON.stringify({ name: sectionName }),
    });
    if (res.ok) {
      setSectionName("");
      fetchData();
    }
  };

  const addLab = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/courses/${id}/labs`, {
      method: "POST",
      body: JSON.stringify({ name: labName }),
    });
    if (res.ok) {
      setLabName("");
      fetchData();
    }
  };

  const assignCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoordId) return;
    const res = await fetch(`/api/courses/${id}/coordinators`, {
      method: "POST",
      body: JSON.stringify({ user_id: Number(selectedCoordId) }),
    });
    if (res.ok) {
      setSelectedCoordId("");
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const removeCoordinator = async (userId: number) => {
    if (!confirm("Remove this coordinator?")) return;
    const res = await fetch(`/api/courses/${id}/coordinators`, {
      method: "DELETE",
      body: JSON.stringify({ user_id: userId }),
    });
    if (res.ok) fetchData();
  };

  const inputClass = "flex-1 border border-border bg-input p-2 rounded text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading Course Details...</div>;
  if (error || !course) return <div className="p-8 text-destructive text-center">{error || "Course not found"}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/courses" className="text-primary hover:underline">← Back to Courses</Link>
        <h1 className="text-3xl font-bold text-foreground">{course.code}: {course.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sections Management */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Sections</h2>
          <form onSubmit={addSection} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="e.g., Section 1"
              className={inputClass}
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              required
            />
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add</button>
          </form>
          <div className="space-y-2">
            {course.sections.map(s => (
              <div key={s.id} className="p-3 bg-accent/30 rounded border border-border text-foreground font-medium">
                {s.name}
              </div>
            ))}
            {course.sections.length === 0 && <p className="text-muted-foreground text-sm italic">No sections added yet.</p>}
          </div>
        </div>

        {/* Labs Management */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Lab Groups</h2>
          <form onSubmit={addLab} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="e.g., Lab A"
              className={inputClass}
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              required
            />
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Add</button>
          </form>
          <div className="space-y-2">
            {course.labs.map(l => (
              <div key={l.id} className="p-3 bg-accent/30 rounded border border-border text-foreground font-medium">
                {l.name}
              </div>
            ))}
            {course.labs.length === 0 && <p className="text-muted-foreground text-sm italic">No lab groups added yet.</p>}
          </div>
        </div>

        {/* Coordinator Management */}
        <div className="bg-card p-6 rounded-lg border border-border md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Assigned Coordinators</h2>
          <form onSubmit={assignCoordinator} className="flex gap-2 mb-6 max-w-md">
            <select
              className={inputClass}
              value={selectedCoordId}
              onChange={(e) => setSelectedCoordId(e.target.value)}
              required
            >
              <option value="">Select a Coordinator...</option>
              {allCoordinators
                .filter(ac => !course.coordinators.some(cc => cc.id === ac.id))
                .map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
            </select>
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90 font-bold">Assign</button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {course.coordinators.map(c => (
              <div key={c.id} className="p-4 border border-border rounded-lg flex justify-between items-center bg-accent/30">
                <div>
                  <p className="font-bold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                </div>
                <button
                  onClick={() => removeCoordinator(c.id)}
                  className="text-destructive hover:text-destructive/80 text-sm font-bold"
                >
                  Remove
                </button>
              </div>
            ))}
            {course.coordinators.length === 0 && <p className="text-muted-foreground italic">No coordinators assigned to this course yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
