import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

// GET: Fetch all courses, ordered by their code
export async function GET() {
  try {
    const res = await query('SELECT * FROM courses ORDER BY code ASC');
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

// POST: Create a new course
export async function POST(req: Request) {
  try {
    // 1. Security Check: Only Admins can create courses
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized. Only Admins can create courses." }, { status: 403 });
    }

    // 2. Extract data from the request body
    const { code, name, is_elective, term_id, department_id } = await req.json();

    // 3. Validation: Ensure required fields exist
    if (!code || !name || !term_id) {
      return NextResponse.json({ error: "Course code, name, and term are required" }, { status: 400 });
    }

    // 4. Insert into Database
    // We use $1, $2 placeholders to prevent SQL Injection.
    // If is_elective is undefined, we default it to false.
    // If department_id is empty, we insert null (for Preparatory courses).
    const res = await query(
      `INSERT INTO courses (code, name, is_elective, term_id, department_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        code, 
        name, 
        is_elective || false, 
        term_id, 
        department_id || null
      ]
    );

    // 5. Return the newly created course
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error: any) {
    // Check if the exact course code already exists (Optional, depending on DB constraints)
    if (error.code === '23505') {
       return NextResponse.json({ error: "A course with this code already exists" }, { status: 400 });
    }
    console.error("Error creating course:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
