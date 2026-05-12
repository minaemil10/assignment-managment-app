import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Fetch course details
    const courseRes = await query("SELECT * FROM courses WHERE id = $1", [id]);
    if (courseRes.rows.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // 2. Fetch sections (ordered)
    const sectionsRes = await query(
      "SELECT id, name FROM sections WHERE course_id = $1 ORDER BY name ASC",
      [id]
    );

    // 3. Fetch lab groups (ordered)
    const labsRes = await query(
      "SELECT id, name FROM lab_groups WHERE course_id = $1 ORDER BY name ASC",
      [id]
    );

    // 4. Fetch coordinators (joined with users table)
    const coordinatorsRes = await query(
      `SELECT u.id, u.name, u.email
       FROM course_coordinators cc
       JOIN users u ON u.id = cc.user_id
       WHERE cc.course_id = $1
       ORDER BY u.name ASC`,
      [id]
    );

    return NextResponse.json({
      ...courseRes.rows[0],
      sections: sectionsRes.rows,
      labs: labsRes.rows,
      coordinators: coordinatorsRes.rows,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}