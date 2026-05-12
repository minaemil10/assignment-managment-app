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
      "SELECT * FROM sections WHERE course_id = $1 ORDER BY name ASC",
      [id]
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
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

    const { name } = await req.json();
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Section name is required" }, { status: 400 });
    }

    const res = await query(
      "INSERT INTO sections (course_id, name) VALUES ($1, $2) RETURNING *",
      [id, name.trim()]
    );
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating section:", error);
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}
