"use client";

import { useState, useEffect } from "react";

// HELPER: Small component for the countdown timer
function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("EXPIRED");
        clearInterval(timer);
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return <span className="font-mono text-primary font-bold">{timeLeft}</span>;
}

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/student/dashboard");
        const data = await res.json();
        if (res.ok) setAssignments(data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const handleMarkDone = async (e: React.MouseEvent, assignmentId: number) => {
    e.stopPropagation(); // Don't collapse the card when clicking the checkbox
    setUpdatingId(assignmentId);
    try {
      const res = await fetch("/api/student/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignment_id: assignmentId })
      });

      if (res.ok) {
        setAssignments(prev => prev.map(item => 
          item.assignment_id === assignmentId ? { ...item, is_done: true } : item
        ));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const getUrgency = (deadlineStr: string, isDone: boolean) => {
    if (isDone) return { label: "Completed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
    const deadline = new Date(deadlineStr);
    const now = new Date();
    if (now > deadline) return { label: "Overdue", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
    if ((deadline.getTime() - now.getTime()) / (1000 * 60 * 60) < 24) return { label: "Due Soon", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
    return { label: "Upcoming", color: "bg-accent text-primary" };
  };

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-foreground tracking-tight">Your Dashboard</h1>
          <p className="text-muted-foreground font-medium">Click any assignment to see details and links.</p>
        </header>

        <div className="grid gap-4">
          {assignments.map((item) => {
            const urgency = getUrgency(item.resolved_deadline, item.is_done);
            const isExpanded = expandedId === item.assignment_id;
            const deadline = new Date(item.resolved_deadline);

            return (
              <div 
                key={item.assignment_id}
                onClick={() => setExpandedId(isExpanded ? null : item.assignment_id)}
                className={`bg-card rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                  isExpanded ? 'border-primary shadow-xl scale-[1.02]' : 'border-border hover:border-accent-foreground/20 shadow-sm'
                } ${item.is_done ? 'opacity-60 grayscale-[0.5]' : ''}`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.course_code}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${urgency.color}`}>
                          {urgency.label}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {deadline.toLocaleDateString()} at {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="ml-4">
                      {item.is_done ? (
                        <div className="bg-green-600 text-white p-2 rounded-xl">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleMarkDone(e, item.assignment_id)}
                          disabled={updatingId === item.assignment_id}
                          className="h-10 w-10 border-2 border-border rounded-xl flex items-center justify-center hover:border-primary hover:bg-accent transition-colors"
                        >
                          {updatingId === item.assignment_id ? (
                            <div className="h-4 w-4 bg-primary rounded-full animate-pulse" />
                          ) : (
                            <div className="h-5 w-5 border-2 border-muted-foreground/30 rounded" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* EXPANDED CONTENT */}
                  {isExpanded && (
                    <div className="mt-8 pt-8 border-t border-border space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div>
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Description</h4>
                        <p className="text-foreground/80 leading-relaxed">{item.description || "No details provided."}</p>
                      </div>

                      {!item.is_done && (
                        <div className="p-4 bg-accent/30 rounded-xl border border-accent">
                          <p className="text-xs font-bold text-primary uppercase mb-1">Live Countdown</p>
                          <Countdown targetDate={item.resolved_deadline} />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 pt-2">
                        {item.resource_link && (
                          <a 
                            href={item.resource_link} 
                            target="_blank" 
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-bold bg-foreground text-background px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
                          >
                            View Resources
                          </a>
                        )}
                        {item.submission_link && (
                          <a 
                            href={item.submission_link} 
                            target="_blank" 
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-bold border-2 border-foreground px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            Go to Submission
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
