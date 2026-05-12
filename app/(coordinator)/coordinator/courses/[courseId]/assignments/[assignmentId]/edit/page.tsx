import { auth } from "@/auth";
import { query } from "@/lib/db";
import { coordinatorOwnsCourse } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import Link from "next/link";
import AssignmentForm from "@/components/coordinator/AssignmentForm";

export default async function EditAssignmentPage({
  params,
}: {
  params: Promise<{ courseId: string; assignmentId: string }>;
}) {
  const session = await auth();
  const user = session?.user as any;
  const { courseId, assignmentId } = await params;

  const owns = await coordinatorOwnsCourse(user?.id, parseInt(courseId));
  if (!owns) redirect("/coordinator/dashboard");

  const result = await query("SELECT * FROM assignments WHERE id = $1 AND course_id = $2", [
    assignmentId,
    courseId,
  ]);
  if (result.rows.length === 0) redirect(`/coordinator/courses/${courseId}/assignments`);

  const assignment = result.rows[0];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/coordinator/courses/${courseId}/assignments`}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Back to Assignments
          </Link>
          <h1 className="text-3xl font-bold text-white mt-1">Edit: {assignment.title}</h1>
          <p className="text-gray-400">Update assignment details</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <AssignmentForm
            courseId={courseId}
            mode="edit"
            initialData={{
              id: assignment.id,
              title: assignment.title,
              type: assignment.type,
              description: assignment.description,
              due_date: assignment.due_date,
              resource_link: assignment.resource_link,
              submission_link: assignment.submission_link,
              team_size: assignment.team_size,
            }}
          />
        </div>
      </div>
    </div>
  );
}
