import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { requireCoordinator, coordinatorOwnsCourse } from "@/lib/auth-helpers";

/**
 * PUT /api/assignments/[id]/overrides/[overrideId]
 * Update an override's due date.
 * Body: { due_date }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; overrideId: string }> }
) {
  const { user, response } = await requireCoordinator();
  if (response) return response;

  const { id, overrideId } = await params;

  try {
    // Verify assignment exists and coordinator owns it
    const assignment = await query("SELECT course_id FROM assignments WHERE id = $1", [id]);
    if (assignment.rows.length === 0) {
      return Response.json({ error: "Assignment not found" }, { status: 404 });
    }

    const owns = await coordinatorOwnsCourse(user.id, assignment.rows[0].course_id);
    if (!owns) {
      return Response.json({ error: "You don't coordinate this course" }, { status: 403 });
    }

    const body = await request.json();
    const { due_date } = body;

    if (!due_date) {
      return Response.json({ error: "Missing required field: due_date" }, { status: 400 });
    }

    const result = await query(
      `UPDATE assignment_overrides SET due_date = $1 WHERE id = $2 AND assignment_id = $3 RETURNING *`,
      [due_date, overrideId, id]
    );

    if (result.rows.length === 0) {
      return Response.json({ error: "Override not found" }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error updating override:", error);
    return Response.json({ error: "Failed to update override" }, { status: 500 });
  }
}

/**
 * DELETE /api/assignments/[id]/overrides/[overrideId]
 * Remove an override.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; overrideId: string }> }
) {
  const { user, response } = await requireCoordinator();
  if (response) return response;

  const { id, overrideId } = await params;

  // Verify assignment exists and coordinator owns it
  const assignment = await query("SELECT course_id FROM assignments WHERE id = $1", [id]);
  if (assignment.rows.length === 0) {
    return Response.json({ error: "Assignment not found" }, { status: 404 });
  }

  const owns = await coordinatorOwnsCourse(user.id, assignment.rows[0].course_id);
  if (!owns) {
    return Response.json({ error: "You don't coordinate this course" }, { status: 403 });
  }

  const result = await query(
    "DELETE FROM assignment_overrides WHERE id = $1 AND assignment_id = $2 RETURNING id",
    [overrideId, id]
  );

  if (result.rows.length === 0) {
    return Response.json({ error: "Override not found" }, { status: 404 });
  }

  return Response.json({ message: "Override deleted" });
}
