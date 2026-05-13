import { auth } from "@/auth";
import { query } from "@/lib/db";
import { coordinatorOwnsCourse } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import Link from "next/link";
import OverrideList from "./OverrideList";

export default async function OverrideManagementPage({
  params,
}: {
  params: Promise<{ courseId: string; assignmentId: string }>;
}) {
  const session = await auth();
  const user = session?.user as any;
  const { courseId, assignmentId } = await params;

  const owns = await coordinatorOwnsCourse(user?.id, parseInt(courseId));
  if (!owns) redirect("/coordinator/dashboard");

  const assignmentResult = await query(
    "SELECT * FROM assignments WHERE id = $1 AND course_id = $2",
    [assignmentId, courseId]
  );
  if (assignmentResult.rows.length === 0) {
    redirect(`/coordinator/courses/${courseId}/assignments`);
  }
  const assignment = assignmentResult.rows[0];

  const sectionsResult = await query(
    "SELECT id, name FROM sections WHERE course_id = $1 ORDER BY name",
    [courseId]
  );
  const allSections = sectionsResult.rows;

  const overridesResult = await query(
    `SELECT ao.*, s.name AS section_name
     FROM assignment_overrides ao
     JOIN sections s ON s.id = ao.section_id
     WHERE ao.assignment_id = $1
     ORDER BY s.name`,
    [assignmentId]
  );
  const overrides = overridesResult.rows;

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/coordinator/courses/${courseId}/assignments`}
            className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            ← Back to Assignments
          </Link>
          <h1 className="text-3xl font-bold text-foreground mt-1">Deadline Overrides</h1>
          <p className="text-muted-foreground">
            Manage per-section deadline exceptions for this assignment
          </p>
        </div>

        {/* Assignment Info */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-2">{assignment.title}</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground/70">Type: </span>
              <span className="text-muted-foreground">{assignment.type.replace("_", " ")}</span>
            </div>
            <div>
              <span className="text-muted-foreground/70">Default Deadline: </span>
              <span className="text-muted-foreground">
                {new Date(assignment.due_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Override List */}
        <OverrideList
          assignmentId={assignmentId}
          allSections={allSections}
          initialOverrides={overrides}
        />
      </div>
    </div>
  );
}
