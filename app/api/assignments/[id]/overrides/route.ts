import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { requireCoordinator, coordinatorOwnsCourse } from "@/lib/auth-helpers";

/**
 * GET /api/assignments/[id]/overrides
 * List all overrides for an assignment, with section names joined.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireCoordinator();
  if (response) return response;

  const { id } = await params;

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
    `SELECT ao.*, s.name AS section_name
     FROM assignment_overrides ao
     JOIN sections s ON s.id = ao.section_id
     WHERE ao.assignment_id = $1
     ORDER BY s.name`,
    [id]
  );

  return Response.json(result.rows);
}

/**
 * POST /api/assignments/[id]/overrides
 * Add a new override for a specific section.
 * Body: { section_id, due_date }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireCoordinator();
  if (response) return response;

  const { id } = await params;

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
    const { section_id, due_date } = body;

    if (!section_id || !due_date) {
      return Response.json({ error: "Missing required fields: section_id, due_date" }, { status: 400 });
    }

    // Verify section belongs to the same course
    const section = await query(
      "SELECT id FROM sections WHERE id = $1 AND course_id = $2",
      [section_id, assignment.rows[0].course_id]
    );
    if (section.rows.length === 0) {
      return Response.json({ error: "Section does not belong to this course" }, { status: 400 });
    }

    // Check for duplicate override
    const existing = await query(
      "SELECT id FROM assignment_overrides WHERE assignment_id = $1 AND section_id = $2",
      [id, section_id]
    );
    if (existing.rows.length > 0) {
      return Response.json({ error: "Override already exists for this section" }, { status: 409 });
    }

    const result = await query(
      `INSERT INTO assignment_overrides (assignment_id, section_id, due_date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, section_id, due_date]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("Error creating override:", error);
    return Response.json({ error: "Failed to create override" }, { status: 500 });
  }
}
