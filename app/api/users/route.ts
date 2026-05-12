import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const res = await query(
      `SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
              d.name AS department_name
       FROM users u
       LEFT JOIN departments d ON d.id = u.department_id
       ORDER BY u.created_at DESC`,
      []
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
