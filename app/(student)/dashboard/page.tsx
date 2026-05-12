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

  return <span className="font-mono text-blue-600 font-bold">{timeLeft}</span>;
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
    if (isDone) return { label: "Completed", color: "bg-green-100 text-green-700" };
    const deadline = new Date(deadlineStr);
    const now = new Date();
    if (now > deadline) return { label: "Overdue", color: "bg-red-100 text-red-700" };
    if ((deadline.getTime() - now.getTime()) / (1000 * 60 * 60) < 24) return { label: "Due Soon", color: "bg-amber-100 text-amber-700" };
    return { label: "Upcoming", color: "bg-blue-50 text-blue-600" };
  };

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Your Dashboard</h1>
          <p className="text-gray-500 font-medium">Click any assignment to see details and links.</p>
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
                className={`bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                  isExpanded ? 'border-blue-500 shadow-xl scale-[1.02]' : 'border-gray-100 hover:border-gray-200 shadow-sm'
                } ${item.is_done ? 'opacity-60 grayscale-[0.5]' : ''}`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.course_code}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${urgency.color}`}>
                          {urgency.label}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">
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
                          className="h-10 w-10 border-2 border-gray-200 rounded-xl flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          {updatingId === item.assignment_id ? (
                            <div className="h-4 w-4 bg-blue-500 rounded-full animate-pulse" />
                          ) : (
                            <div className="h-5 w-5 border-2 border-gray-300 rounded" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* EXPANDED CONTENT */}
                  {isExpanded && (
                    <div className="mt-8 pt-8 border-t border-gray-100 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</h4>
                        <p className="text-gray-600 leading-relaxed">{item.description || "No details provided."}</p>
                      </div>

                      {!item.is_done && (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <p className="text-xs font-bold text-blue-400 uppercase mb-1">Live Countdown</p>
                          <Countdown targetDate={item.resolved_deadline} />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 pt-2">
                        {item.resource_link && (
                          <a 
                            href={item.resource_link} 
                            target="_blank" 
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-bold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
                          >
                            View Resources
                          </a>
                        )}
                        {item.submission_link && (
                          <a 
                            href={item.submission_link} 
                            target="_blank" 
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-bold border-2 border-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
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
