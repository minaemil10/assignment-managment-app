import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Prevent admin from modifying their own account
    if ((session?.user as any)?.id === id) {
      return NextResponse.json({ error: "You cannot modify your own account." }, { status: 400 });
    }

    const body = await req.json();
    const { role, is_active } = body;

    const validRoles = ["STUDENT", "COORDINATOR", "ADMIN"];
    if (role !== undefined && !validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Build update dynamically based on what was sent
    const updates: string[] = [];
    const values: any[] = [];

    if (role !== undefined) {
      values.push(role);
      updates.push(`role = $${values.length}`);
    }

    if (is_active !== undefined) {
      values.push(is_active);
      updates.push(`is_active = $${values.length}`);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    values.push(id);
    const res = await query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING id, name, email, role, is_active`,
      values
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
