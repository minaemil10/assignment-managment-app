import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

/**
 * GET /api/student/dashboard
 * Updated to include full details (description, links) for the inline-view.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const studentId = (session.user as any).id;

    const result = await query(`
      SELECT 
        a.id AS assignment_id,
        a.title,
        a.type,
        a.description,
        a.resource_link,
        a.submission_link,
        c.code AS course_code,
        c.name AS course_name,
        COALESCE(ao.due_date, a.due_date) AS resolved_deadline,
        COALESCE(ss.is_done, FALSE) AS is_done
      FROM enrollments e
      JOIN sections s ON e.section_id = s.id
      JOIN courses c ON s.course_id = c.id
      JOIN assignments a ON c.id = a.course_id
      LEFT JOIN assignment_overrides ao ON (
        a.id = ao.assignment_id AND e.section_id = ao.section_id
      )
      LEFT JOIN student_submissions ss ON (
        a.id = ss.assignment_id AND e.student_id = ss.student_id
      )
      WHERE e.student_id = $1
      ORDER BY resolved_deadline ASC;
    `, [studentId]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
