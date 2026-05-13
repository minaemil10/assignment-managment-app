import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

/**
 * GET /api/enrollments
 * Fetch all courses the current student is enrolled in, along with section and lab details.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const studentId = (session.user as any).id;

    // Join with courses, sections, lab_groups to get the full view of the enrollment
    const result = await query(`
      SELECT 
        e.id as enrollment_id,
        c.id as course_id,
        c.code as course_code,
        c.name as course_name,
        s.name as section_name,
        l.name as lab_group_name,
        (
          SELECT json_agg(json_build_object('name', u.name))
          FROM course_coordinators cc
          JOIN users u ON u.id = cc.user_id
          WHERE cc.course_id = c.id
        ) as coordinators
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN sections s ON e.section_id = s.id
      LEFT JOIN lab_groups l ON e.lab_group_id = l.id
      WHERE e.student_id = $1
      ORDER BY e.enrolled_at DESC
    `, [studentId]);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error("Fetch enrollments error:", error);
    return NextResponse.json({ error: "Failed to fetch enrollments." }, { status: 500 });
  }
}

/**
 * POST /api/enrollments
 * Saves a student's enrollment. Now requires course_id.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { course_id, section_id, lab_group_id } = await req.json();
    const studentId = (session.user as any).id;

    if (!course_id) {
      return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
    }

    // We allow section and lab to be null now, so we don't return an error if they are missing.
    await query(
      `INSERT INTO enrollments (student_id, course_id, section_id, lab_group_id) 
       VALUES ($1, $2, $3, $4)`, 
      [studentId, course_id, section_id || null, lab_group_id || null]
    );

    return NextResponse.json({ message: "Enrollment successful!" }, { status: 201 });
  } catch (error: any) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Could not save enrollment. You may already be enrolled." },
      { status: 500 }
    );
  }
}
