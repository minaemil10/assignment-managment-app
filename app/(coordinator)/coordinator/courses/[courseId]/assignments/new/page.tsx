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
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/coordinator/courses/${courseId}/assignments`}
            className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            ← Back to Assignments
          </Link>
          <h1 className="text-3xl font-bold text-foreground mt-1">Create Assignment</h1>
          <p className="text-muted-foreground">Add a new assignment to this course</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <AssignmentForm courseId={courseId} mode="create" />
        </div>
      </div>
    </div>
  );
}
