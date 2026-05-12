import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

/**
 * GET: Fetches all courses including their sections and labs.
 * Replaces the simpler version to support a one-page nested UI.
 */
export async function GET() {
  try {
    // 1. Fetch all courses
    const coursesRes = await query(`
      SELECT id, code, name, is_elective, department_id, term_id 
      FROM courses 
      ORDER BY code ASC
    `);
    const courses = coursesRes.rows;

    // 2. Fetch all sections
    const sectionsRes = await query("SELECT id, name, course_id FROM sections");
    const sections = sectionsRes.rows;

    // 3. Fetch all lab groups
    const labsRes = await query("SELECT id, name, course_id FROM lab_groups");
    const labs = labsRes.rows;

    // 4. Combine/Nest data
    const data = courses.map((course: any) => ({
      ...course,
      sections: sections.filter((s: any) => s.course_id === course.id),
      labs: labs.filter((l: any) => l.course_id === course.id),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

/**
 * POST: Create a new course
 * Retained from the admin-structure branch.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { code, name, is_elective, term_id, department_id } = await req.json();

    if (!code || !name || !term_id) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const res = await query(
      `INSERT INTO courses (code, name, is_elective, term_id, department_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [code, name, is_elective || false, term_id, department_id || null]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error: any) {
    if (error.code === '23505') {
       return NextResponse.json({ error: "Course code already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}