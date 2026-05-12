import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized. Only Admins can delete terms." }, { status: 403 });
    }

    // Check if the term exists
    const termRes = await query('SELECT id FROM terms WHERE id = $1', [id]);
    if (termRes.rows.length === 0) {
      return NextResponse.json({ error: "Term not found" }, { status: 404 });
    }

    // Check if any courses are linked to this term
    const courseRes = await query('SELECT id FROM courses WHERE term_id = $1 LIMIT 1', [id]);
    if (courseRes.rows.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete this term because it has courses assigned to it. Delete the courses first." 
      }, { status: 400 });
    }

    await query('DELETE FROM terms WHERE id = $1', [id]);

    return NextResponse.json({ message: "Term deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete term" }, { status: 500 });
  }
}
