import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    const studentId = (session?.user as any)?.id;

    // 1. Fetch all courses
    const coursesRes = await query(`
      SELECT id, code, name, is_elective, department_id, term_id 
      FROM courses 
      ORDER BY code ASC
    `);
    const courses = coursesRes.rows;

    // 2. Fetch existing enrollments for THIS student from the DB
    let enrolledCourseIds: number[] = [];
    if (studentId) {
      const enrollRes = await query(`
        SELECT DISTINCT s.course_id 
        FROM enrollments e
        JOIN sections s ON e.section_id = s.id
        WHERE e.student_id = $1
      `, [studentId]);
      enrolledCourseIds = enrollRes.rows.map(r => r.course_id);
    }

    // 3. Fetch all sections and labs
    const sectionsRes = await query("SELECT id, name, course_id FROM sections");
    const labsRes = await query("SELECT id, name, course_id FROM lab_groups");

    // 4. Combine everything
    const data = courses.map((course: any) => ({
      ...course,
      isEnrolled: enrolledCourseIds.includes(course.id), // New flag from DB!
      sections: sectionsRes.rows.filter((s: any) => s.course_id === course.id),
      labs: labsRes.rows.filter((l: any) => l.course_id === course.id),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
