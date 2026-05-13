"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Coordinator {
  name: string;
}

interface Enrollment {
  enrollment_id: number;
  course_id: number;
  course_code: string;
  course_name: string;
  section_name: string | null;
  lab_group_name: string | null;
  coordinators: Coordinator[] | null;
}

export default function MyCoursesPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [droppingId, setDroppingId] = useState<number | null>(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  async function fetchEnrollments() {
    try {
      const res = await fetch("/api/enrollments");
      if (!res.ok) throw new Error("Failed to load enrollments");
      const data = await res.json();
      setEnrollments(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleDropCourse(enrollmentId: number) {
    if (!confirm("Are you sure you want to drop this course? This will remove all related assignments from your dashboard.")) {
      return;
    }

    setDroppingId(enrollmentId);
    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "DELETE"
      });
      
      if (!res.ok) {
        throw new Error("Failed to unenroll");
      }

      // Remove from state
      setEnrollments(prev => prev.filter(e => e.enrollment_id !== enrollmentId));
    } catch (err: any) {
      alert(err.message || "Failed to drop course");
    } finally {
      setDroppingId(null);
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground font-medium">Loading your courses...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto bg-background min-h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-2 font-medium">Manage your active course enrollments.</p>
        </div>
        <button 
          onClick={() => router.push("/courses")}
          className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 font-bold rounded-lg transition-colors border border-primary/20"
        >
          + Enroll in More
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive border border-destructive/30 rounded-lg text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {enrollments.length === 0 && !error ? (
        <div className="text-center p-16 bg-card border-2 border-dashed border-border rounded-xl">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">You aren't enrolled in any courses</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Head over to the Course Catalog to browse and enroll in courses for this semester.</p>
          <button 
            onClick={() => router.push("/courses")}
            className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition shadow-lg"
          >
            Go to Course Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(enrollment => (
            <div key={enrollment.enrollment_id} className="flex flex-col bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              
              {/* Card Header */}
              <div className="p-5 border-b border-border bg-muted/20">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-black tracking-widest text-primary uppercase bg-primary/10 px-2 py-1 rounded">
                    {enrollment.course_code}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground leading-tight">
                  {enrollment.course_name}
                </h2>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-grow space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider">Section</p>
                    <p className="font-semibold text-sm text-foreground truncate">
                      {enrollment.section_name || <span className="text-muted-foreground italic">None</span>}
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider">Lab Group</p>
                    <p className="font-semibold text-sm text-foreground truncate">
                      {enrollment.lab_group_name || <span className="text-muted-foreground italic">None</span>}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider">Coordinators</p>
                  <div className="flex flex-wrap gap-2">
                    {enrollment.coordinators && enrollment.coordinators.length > 0 ? (
                      enrollment.coordinators.map((c, i) => (
                        <span key={i} className="text-xs font-medium text-foreground bg-accent px-2 py-1 rounded-md border border-border">
                          {c.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No coordinators assigned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 border-t border-border bg-muted/10">
                <button
                  disabled={droppingId === enrollment.enrollment_id}
                  onClick={() => handleDropCourse(enrollment.enrollment_id)}
                  className={`w-full py-2.5 rounded-lg text-sm font-bold transition-colors ${
                    droppingId === enrollment.enrollment_id 
                      ? 'bg-destructive/50 text-destructive-foreground cursor-not-allowed'
                      : 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border border-destructive/20 hover:border-transparent'
                  }`}
                >
                  {droppingId === enrollment.enrollment_id ? 'Dropping...' : 'Drop Course'}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
