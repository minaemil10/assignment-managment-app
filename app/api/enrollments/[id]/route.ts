import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

/**
 * DELETE /api/enrollments/[id]
 * Deletes a student's enrollment.
 */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const studentId = (session.user as any).id;
    const { id } = await context.params;

    // Verify the enrollment belongs to the current student
    const checkResult = await query(
      "SELECT * FROM enrollments WHERE id = $1 AND student_id = $2",
      [id, studentId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Enrollment not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete the enrollment
    await query("DELETE FROM enrollments WHERE id = $1", [id]);

    return NextResponse.json({ message: "Unenrolled successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("Delete enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to unenroll." },
      { status: 500 }
    );
  }
}
