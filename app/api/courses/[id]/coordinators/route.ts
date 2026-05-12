import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await query(
      `SELECT u.id, u.name, u.email
       FROM course_coordinators cc
       JOIN users u ON u.id = cc.user_id
       WHERE cc.course_id = $1
       ORDER BY u.name ASC`,
      [id]
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch coordinators" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { user_id } = await req.json();
    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }

    // Verify the user exists and is a COORDINATOR
    const userRes = await query("SELECT * FROM users WHERE id = $1", [user_id]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (userRes.rows[0].role !== "COORDINATOR") {
      return NextResponse.json(
        { error: "User must have the COORDINATOR role to be assigned." },
        { status: 400 }
      );
    }

    const res = await query(
      "INSERT INTO course_coordinators (course_id, user_id) VALUES ($1, $2) RETURNING *",
      [id, user_id]
    );
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "This coordinator is already assigned to this course." }, { status: 400 });
    }
    console.error("Error assigning coordinator:", error);
    return NextResponse.json({ error: "Failed to assign coordinator" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { user_id } = await req.json();
    await query(
      "DELETE FROM course_coordinators WHERE course_id = $1 AND user_id = $2",
      [id, user_id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove coordinator" }, { status: 500 });
  }
}
