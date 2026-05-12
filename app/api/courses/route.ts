import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/**
 * GET /api/courses
 * Fetches all courses including their sections and labs for a one-page experience.
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

    // 4. Combine them
    // We "nest" the sections and labs inside each course object
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
