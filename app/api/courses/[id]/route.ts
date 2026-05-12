import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/**
 * GET /api/courses/[id]
 * Fetches a single course with its sections and lab groups.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Get the ID from the URL
    const { id } = await params;

    // 2. Ask the database for the course itself
    const courseResult = await query("SELECT * FROM courses WHERE id = $1", [id]);
    const course = courseResult.rows[0];

    // If the course doesn't exist, tell the student
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // 3. Ask for the sections that belong to this specific course
    const sectionsResult = await query("SELECT id, name FROM sections WHERE course_id = $1", [id]);
    
    // 4. Ask for the lab groups that belong to this specific course
    const labsResult = await query("SELECT id, name FROM lab_groups WHERE course_id = $1", [id]);

    // 5. Package it all together and send it back
    return NextResponse.json({
      ...course,
      sections: sectionsResult.rows,
      labs: labsResult.rows
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch course details" }, { status: 500 });
  }
}
