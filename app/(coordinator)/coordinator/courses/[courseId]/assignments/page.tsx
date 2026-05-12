import { auth } from "@/auth";
import { query } from "@/lib/db";
import { coordinatorOwnsCourse } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import DeleteAssignmentButton from "./DeleteAssignmentButton";

const TYPE_COLORS: Record<string, string> = {
  LAB: "bg-green-600 text-white",
  SHEET: "bg-blue-600 text-white",
  QUIZ: "bg-orange-500 text-white",
  MIDTERM: "bg-red-600 text-white",
  FINAL_PROJECT: "bg-purple-600 text-white",
  OTHER: "bg-gray-600 text-white",
};

export default async function AssignmentListPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  const user = session?.user as any;
  const { courseId } = await params;

  const owns = await coordinatorOwnsCourse(user?.id, parseInt(courseId));
  if (!owns) redirect("/coordinator/dashboard");

  const courseResult = await query("SELECT * FROM courses WHERE id = $1", [courseId]);
  if (courseResult.rows.length === 0) redirect("/coordinator/dashboard");
  const course = courseResult.rows[0];

  const assignmentsResult = await query(
    `SELECT a.*,
       (SELECT COUNT(*) FROM assignment_overrides ao WHERE ao.assignment_id = a.id) AS override_count
     FROM assignments a
     WHERE a.course_id = $1
     ORDER BY a.due_date ASC`,
    [courseId]
  );
  const assignments = assignmentsResult.rows;

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Link
              href="/coordinator/dashboard"
              className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-foreground mt-1">{course.code}: {course.name}</h1>
            <p className="text-muted-foreground">Manage assignments for this course</p>
          </div>
          <Link href={`/coordinator/courses/${courseId}/assignments/new`}>
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2 px-4 rounded transition">
              + New Assignment
            </button>
          </Link>
        </div>

        {/* Assignments Table */}
        {assignments.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">No assignments yet for this course.</p>
            <Link href={`/coordinator/courses/${courseId}/assignments/new`}>
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2 px-4 rounded transition">
                Create your first assignment
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium text-sm">Title</th>
                  <th className="text-left p-4 text-muted-foreground font-medium text-sm">Type</th>
                  <th className="text-left p-4 text-muted-foreground font-medium text-sm">Default Deadline</th>
                  <th className="text-left p-4 text-muted-foreground font-medium text-sm">Overrides</th>
                  <th className="text-left p-4 text-muted-foreground font-medium text-sm">Team</th>
                  <th className="text-right p-4 text-muted-foreground font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment: any) => (
                  <tr key={assignment.id} className="border-b border-border last:border-0">
                    <td className="p-4 text-foreground font-medium">{assignment.title}</td>
                    <td className="p-4">
                      <Badge className={TYPE_COLORS[assignment.type] || ""}>
                        {assignment.type.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(assignment.due_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/coordinator/courses/${courseId}/assignments/${assignment.id}/overrides`}
                        className="text-primary hover:underline"
                      >
                        {assignment.override_count} override{assignment.override_count !== '1' ? 's' : ''}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground">{assignment.team_size}</td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/coordinator/courses/${courseId}/assignments/${assignment.id}/edit`}>
                          <button className="border border-border text-muted-foreground hover:bg-accent text-sm py-1 px-3 rounded transition">
                            Edit
                          </button>
                        </Link>
                        <Link href={`/coordinator/courses/${courseId}/assignments/${assignment.id}/overrides`}>
                          <button className="border border-border text-muted-foreground hover:bg-accent text-sm py-1 px-3 rounded transition">
                            Overrides
                          </button>
                        </Link>
                        <DeleteAssignmentButton
                          assignmentId={assignment.id}
                          assignmentTitle={assignment.title}
                          courseId={courseId}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
