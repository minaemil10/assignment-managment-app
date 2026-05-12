import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

/**
 * GET /api/student/assignments/[id]
 * Fetches full details for a specific assignment, including the resolved deadline.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const studentId = (session.user as any).id;
    const { id: assignmentId } = await params;

    const result = await query(`
      SELECT 
        a.*,
        c.code AS course_code,
        c.name AS course_name,
        COALESCE(ao.due_date, a.due_date) AS resolved_deadline,
        COALESCE(ss.is_done, FALSE) AS is_done
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      -- Join enrollment via the course_id (through the section table)
      JOIN sections s ON c.id = s.course_id
      JOIN enrollments e ON s.id = e.section_id
      LEFT JOIN assignment_overrides ao ON (
        a.id = ao.assignment_id AND s.id = ao.section_id
      )
      LEFT JOIN student_submissions ss ON (
        a.id = ss.assignment_id AND e.student_id = ss.student_id
      )
      WHERE a.id = $1 AND e.student_id = $2
      LIMIT 1
    `, [assignmentId, studentId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Assignment not found or not enrolled" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Assignment Detail API Error:", error);
    return NextResponse.json({ error: "Failed to load details" }, { status: 500 });
  }
}
