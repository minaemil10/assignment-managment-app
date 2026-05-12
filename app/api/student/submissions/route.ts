import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

/**
 * POST /api/student/submissions
 * Marks an assignment as 'Done' permanently. 
 * Once marked, it cannot be undone.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const studentId = (session.user as any).id;

    const { assignment_id } = await req.json();

    if (!assignment_id) {
      return NextResponse.json({ error: "Missing assignment ID" }, { status: 400 });
    }

    // 1. Check if it's already marked as done
    const checkResult = await query(
      "SELECT is_done FROM student_submissions WHERE student_id = $1 AND assignment_id = $2",
      [studentId, assignment_id]
    );

    if (checkResult.rows.length > 0 && checkResult.rows[0].is_done) {
      return NextResponse.json({ message: "Assignment is already completed" }, { status: 200 });
    }

    // 2. Mark it as done (Insert if new, update if it was somehow false)
    await query(`
      INSERT INTO student_submissions (student_id, assignment_id, is_done)
      VALUES ($1, $2, TRUE)
      ON CONFLICT (student_id, assignment_id) 
      DO UPDATE SET is_done = TRUE, marked_at = CURRENT_TIMESTAMP
    `, [studentId, assignment_id]);

    return NextResponse.json({ message: "Assignment marked as completed!" }, { status: 200 });
  } catch (error) {
    console.error("Submission Error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
