import { auth } from "@/auth";
import { query } from "@/lib/db";
import LogoutButton from "@/components/shared/LogoutButton";
import ThemeToggle from "@/components/shared/ThemeToggle";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function CoordinatorDashboard() {
  const session = await auth();
  const user = session?.user as any;

  // Fetch courses this coordinator manages, with section + assignment counts
  const coursesResult = await query(
    `SELECT c.id, c.code, c.name, c.is_elective,
       (SELECT COUNT(*) FROM sections s WHERE s.course_id = c.id) AS section_count,
       (SELECT COUNT(*) FROM assignments a WHERE a.course_id = c.id) AS assignment_count,
       (SELECT COUNT(*) FROM lab_groups lg WHERE lg.course_id = c.id) AS lab_count
     FROM courses c
     INNER JOIN course_coordinators cc ON cc.course_id = c.id
     WHERE cc.user_id = $1
     ORDER BY c.code`,
    [user?.id]
  );

  const courses = coursesResult.rows;

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="bg-card shadow rounded-lg p-6 mb-6 border border-border flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Coordinator Dashboard</h1>
            <p className="text-muted-foreground mt-2">Hello, {session?.user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-card p-6 rounded-lg shadow border border-border text-center">
            <h3 className="text-muted-foreground font-medium">Courses</h3>
            <p className="text-3xl font-bold text-foreground mt-2">{courses.length}</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow border border-border text-center">
            <h3 className="text-muted-foreground font-medium">Total Assignments</h3>
            <p className="text-3xl font-bold text-foreground mt-2">
              {courses.reduce((sum: number, c: any) => sum + parseInt(c.assignment_count), 0)}
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow border border-border text-center">
            <h3 className="text-muted-foreground font-medium">Total Sections</h3>
            <p className="text-3xl font-bold text-foreground mt-2">
              {courses.reduce((sum: number, c: any) => sum + parseInt(c.section_count), 0)}
            </p>
          </div>
        </div>

        {/* Course Cards */}
        <h2 className="text-xl font-semibold text-foreground mb-4">My Courses</h2>
        {courses.length === 0 ? (
          <div className="bg-card p-6 rounded-lg shadow border border-border">
            <p className="text-muted-foreground text-center">
              You are not assigned to coordinate any courses yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course: any) => (
              <Link
                key={course.id}
                href={`/coordinator/courses/${course.id}/assignments`}
                className="block group"
              >
                <div className="bg-card p-6 rounded-lg shadow border border-border transition-all hover:border-primary/50 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-foreground">{course.code}</h3>
                    {course.is_elective && (
                      <Badge variant="secondary">Elective</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-3">{course.name}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground/70">
                    <span>{course.section_count} section{course.section_count !== '1' ? 's' : ''}</span>
                    <span>•</span>
                    <span>{course.assignment_count} assignment{course.assignment_count !== '1' ? 's' : ''}</span>
                    <span>•</span>
                    <span>{course.lab_count} lab group{course.lab_count !== '1' ? 's' : ''}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
