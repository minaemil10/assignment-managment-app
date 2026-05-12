import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

/**
 * POST /api/enrollments
 * Saves a student's enrollment. Now allows NULL for section or lab if missing.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { section_id, lab_group_id } = await req.json();
    const studentId = (session.user as any).id;

    // We allow these to be null now, so we don't return an error if they are missing.
    // Instead, we just pass whatever we have to the database.
    await query(
      `INSERT INTO enrollments (student_id, section_id, lab_group_id) 
       VALUES ($1, $2, $3)`, 
      [studentId, section_id || null, lab_group_id || null]
    );

    return NextResponse.json({ message: "Enrollment successful!" }, { status: 201 });
  } catch (error: any) {
    // If they are already enrolled, we might get a unique constraint error.
    // In a real app, you might want to UPDATE the record here instead.
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Could not save enrollment. You may already be enrolled." },
      { status: 500 }
    );
  }
}
