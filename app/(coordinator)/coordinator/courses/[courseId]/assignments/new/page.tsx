import { auth } from "@/auth";
import { coordinatorOwnsCourse } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import Link from "next/link";
import AssignmentForm from "@/components/coordinator/AssignmentForm";

export default async function NewAssignmentPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  const user = session?.user as any;
  const { courseId } = await params;

  const owns = await coordinatorOwnsCourse(user?.id, parseInt(courseId));
  if (!owns) redirect("/coordinator/dashboard");

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
          <h1 className="text-3xl font-bold text-white mt-1">Create Assignment</h1>
          <p className="text-gray-400">Add a new assignment to this course</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <AssignmentForm courseId={courseId} mode="create" />
        </div>
      </div>
    </div>
  );
}
