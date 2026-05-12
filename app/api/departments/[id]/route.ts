import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized. Only Admins can delete departments." }, { status: 403 });
    }

    // 1. Check if the department exists
    const deptRes = await query('SELECT id FROM departments WHERE id = $1', [id]);
    if (deptRes.rows.length === 0) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    // 2. Check for linked courses
    const courseRes = await query('SELECT id FROM courses WHERE department_id = $1 LIMIT 1', [id]);
    if (courseRes.rows.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete this department because it has courses assigned to it. Delete the courses first." 
      }, { status: 400 });
    }

    // 3. Check for enrolled users
    const userRes = await query('SELECT id FROM users WHERE department_id = $1 LIMIT 1', [id]);
    if (userRes.rows.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete this department because users are assigned to it." 
      }, { status: 400 });
    }

    // 4. Delete auto-generated terms first (Foreign Key constraint)
    await query('DELETE FROM terms WHERE department_id = $1', [id]);

    // 5. Delete the department
    await query('DELETE FROM departments WHERE id = $1', [id]);

    return NextResponse.json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
  }
}
