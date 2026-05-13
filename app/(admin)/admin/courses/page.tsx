"use client";

import { useState, useEffect } from "react";
import { Course, Term, Department } from "@/types/models";
import Link from "next/link";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isElective, setIsElective] = useState(false);
  const [departmentId, setDepartmentId] = useState("");
  const [termId, setTermId] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    const [coursesRes, termsRes, deptsRes] = await Promise.all([
      fetch("/api/courses"),
      fetch("/api/terms"),
      fetch("/api/departments")
    ]);

    if (coursesRes.ok) setCourses(await coursesRes.json());
    if (termsRes.ok) setTerms(await termsRes.json());
    if (deptsRes.ok) setDepartments(await deptsRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!termId) {
      setError("Please select a term for the course.");
      return;
    }

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        code, 
        name, 
        is_elective: isElective,
        term_id: Number(termId),
        department_id: departmentId ? Number(departmentId) : null 
      }),
    });

    if (res.ok) {
      setCode("");
      setName("");
      setIsElective(false);
      setDepartmentId("");
      setTermId("");
      fetchData(); 
    } else {
      const data = await res.json();
      setError(data.error || "Failed to add course");
    }
  };

  const getDepartmentName = (deptId: number | null) => {
    if (!deptId) return "None (Prep)";
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : "Unknown";
  };

  const getTermName = (tId: number) => {
    const term = terms.find(t => t.id === tId);
    return term ? `Term ${term.number}` : "Unknown";
  };

  const filteredTerms = terms.filter(t => {
    if (departmentId === "") return t.department_id === null;
    return t.department_id === Number(departmentId);
  });

  const inputClass = "w-full border border-border bg-input p-2 rounded text-foreground focus:ring-2 focus:ring-ring outline-none";

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Manage Courses</h1>

      {/* The Form */}
      <div className="bg-accent/30 p-6 rounded-xl border border-border mb-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Add New Course</h2>
        {error && <p className="text-destructive mb-4 bg-destructive/10 p-3 rounded text-sm">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Course Code</label>
              <input
                type="text"
                required
                placeholder="e.g., CS101"
                className={inputClass}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            
            <div className="flex-2 w-1/2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Course Name</label>
              <input
                type="text"
                required
                placeholder="e.g., Intro to Programming"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Department</label>
              <select
                className={inputClass}
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setTermId("");
                }}
              >
                <option value="">None (Prep Level)</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Term</label>
              <select
                className={inputClass}
                value={termId}
                onChange={(e) => setTermId(e.target.value)}
                required
              >
                <option value="" disabled>Select a term</option>
                {filteredTerms.map((term) => (
                  <option key={term.id} value={term.id}>Term {term.number}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex items-center mb-2">
              <input
                type="checkbox"
                id="isElective"
                className="w-4 h-4 text-blue-600 border-border rounded cursor-pointer"
                checked={isElective}
                onChange={(e) => setIsElective(e.target.checked)}
              />
              <label htmlFor="isElective" className="ml-2 block text-sm font-medium text-muted-foreground cursor-pointer">Elective</label>
            </div>

            <button 
              type="submit" 
              disabled={!code || !name || !termId}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-2 px-6 rounded transition h-[42px]"
            >
              Add Course
            </button>
          </div>
        </form>
      </div>

      {/* The Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-accent/50 border-b border-border">
            <tr>
              <th className="p-4 text-muted-foreground font-semibold">Code</th>
              <th className="p-4 text-muted-foreground font-semibold">Name</th>
              <th className="p-4 text-muted-foreground font-semibold">Term</th>
              <th className="p-4 text-muted-foreground font-semibold">Department</th>
              <th className="p-4 text-muted-foreground font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {courses.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No courses found.</td></tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="hover:bg-accent/30 transition">
                  <td className="p-4 font-bold text-primary">
                    <Link href={`/admin/courses/${course.id}`} className="hover:underline">
                      {course.code}
                    </Link>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-foreground">{course.name}</div>
                    {course.is_elective && <span className="text-[10px] bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-1.5 py-0.5 rounded font-bold uppercase">Elective</span>}
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">{getTermName(course.term_id)}</td>
                  <td className="p-4 text-muted-foreground text-sm">{getDepartmentName(course.department_id)}</td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/courses/${course.id}`} className="text-primary hover:text-primary/80 text-sm font-bold">
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
