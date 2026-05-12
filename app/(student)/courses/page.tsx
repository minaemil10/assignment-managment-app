"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CourseWithDetails } from "@/types/models";

// Extending the model locally to include the enrollment flag
interface CourseWithEnrollment extends CourseWithDetails {
  isEnrolled: boolean;
}

export default function CourseCatalog() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseWithEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState("");
  const [labId, setLabId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Track new enrollments in this session to update UI immediately
  const [newlyEnrolledIds, setNewlyEnrolledIds] = useState<number[]>([]);

  useEffect(() => {
    async function getCourses() {
      try {
        const response = await fetch("/api/courses");
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    }
    getCourses();
  }, []);

  const handleEnroll = async (course: CourseWithEnrollment) => {
    if (course.sections.length > 0 && !sectionId) {
      setError(`Please select a Section for ${course.code}`);
      return;
    }
    if (course.labs.length > 0 && !labId) {
      setError(`Please select a Lab Group for ${course.code}`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section_id: sectionId ? parseInt(sectionId) : null,
          lab_group_id: labId ? parseInt(labId) : null
        })
      });

      if (response.ok) {
        setNewlyEnrolledIds(prev => [...prev, course.id]);
        setSelectedCourseId(null);
        setSectionId("");
        setLabId("");
      } else {
        const data = await response.json();
        setError(data.error || "Enrollment failed.");
      }
    } catch (err) {
      setError("Connection error.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading catalog...</div>;

  const totalEnrolled = courses.filter(c => c.isEnrolled).length + newlyEnrolledIds.length;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white min-h-screen pb-32">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Course Catalog</h1>
        {totalEnrolled > 0 && (
          <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
             {totalEnrolled} course(s) joined
          </span>
        )}
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      <div className="grid gap-6">
        {courses.map((course) => {
          const isSelected = selectedCourseId === course.id;
          const isEnrolled = course.isEnrolled || newlyEnrolledIds.includes(course.id);
          
          return (
            <div 
              key={course.id} 
              onClick={() => {
                // BLOCK CLICKING IF ALREADY ENROLLED
                if (submitting || isEnrolled) return;
                setSelectedCourseId(isSelected ? null : course.id);
                setSectionId("");
                setLabId("");
                setError("");
              }}
              className={`p-6 border-2 rounded-xl transition-all duration-200 ${
                isEnrolled ? 'border-green-200 bg-green-50/50 opacity-80 cursor-default' :
                isSelected ? 'border-blue-500 bg-blue-50 shadow-md cursor-pointer' : 
                'border-gray-100 hover:border-gray-200 hover:shadow-sm cursor-pointer'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className={`text-sm font-bold uppercase tracking-widest ${isEnrolled ? 'text-green-600' : 'text-blue-600'}`}>
                    {course.code}
                  </span>
                  <h2 className={`text-2xl font-bold mt-1 ${isEnrolled ? 'text-gray-500' : 'text-gray-800'}`}>
                    {course.name}
                  </h2>
                </div>
                {isEnrolled && (
                  <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-white px-3 py-1 rounded-full border border-green-200 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Joined
                  </div>
                )}
              </div>

              {isSelected && !isEnrolled && (
                <div 
                  className="mt-6 p-6 bg-white rounded-lg border border-blue-200 space-y-4"
                  onClick={(e) => e.stopPropagation()} 
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.sections.length > 0 && (
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Section *</label>
                        <select 
                          disabled={submitting}
                          value={sectionId}
                          onChange={(e) => setSectionId(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                        >
                          <option value="">Choose Section</option>
                          {course.sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    )}

                    {course.labs.length > 0 && (
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Lab Group *</label>
                        <select 
                          disabled={submitting}
                          value={labId}
                          onChange={(e) => setLabId(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                        >
                          <option value="">Choose Lab Group</option>
                          {course.labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  <button 
                    disabled={submitting}
                    onClick={() => handleEnroll(course)}
                    className={`w-full text-white font-bold py-3 rounded-lg transition-all shadow-lg ${
                      submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {submitting ? "Saving..." : "Join Course"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FOOTER BUTTON */}
      {(totalEnrolled > 0) && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200 shadow-2xl flex justify-center">
          <button 
            onClick={() => router.push("/dashboard")}
            className="max-w-md w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3"
          >
            Go to Dashboard
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
