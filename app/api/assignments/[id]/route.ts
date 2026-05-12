import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { requireCoordinator, coordinatorOwnsCourse } from "@/lib/auth-helpers";

/**
 * GET /api/assignments/[id]
 * Fetch a single assignment with its overrides.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireCoordinator();
  if (response) return response;

  const { id } = await params;

  const result = await query(
    `SELECT a.*,
      COALESCE(
        json_agg(
          json_build_object('id', ao.id, 'assignment_id', ao.assignment_id, 'section_id', ao.section_id, 'due_date', ao.due_date)
        ) FILTER (WHERE ao.id IS NOT NULL),
        '[]'
      ) AS overrides
    FROM assignments a
    LEFT JOIN assignment_overrides ao ON ao.assignment_id = a.id
    WHERE a.id = $1
    GROUP BY a.id`,
    [id]
  );

  if (result.rows.length === 0) {
    return Response.json({ error: "Assignment not found" }, { status: 404 });
  }

  // Verify coordinator owns this course
  const assignment = result.rows[0];
  const owns = await coordinatorOwnsCourse(user.id, assignment.course_id);
  if (!owns) {
    return Response.json({ error: "You don't coordinate this course" }, { status: 403 });
  }

  return Response.json(assignment);
}

/**
 * PUT /api/assignments/[id]
 * Update an existing assignment.
 * Body: any subset of { title, type, due_date, description, resource_link, submission_link, team_size }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireCoordinator();
  if (response) return response;

  const { id } = await params;

  try {
    // Verify assignment exists and coordinator owns it
    const existing = await query("SELECT * FROM assignments WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return Response.json({ error: "Assignment not found" }, { status: 404 });
    }

    const owns = await coordinatorOwnsCourse(user.id, existing.rows[0].course_id);
    if (!owns) {
      return Response.json({ error: "You don't coordinate this course" }, { status: 403 });
    }

    const body = await request.json();
    const { title, type, due_date, description, resource_link, submission_link, team_size } = body;

    const result = await query(
      `UPDATE assignments
       SET title = COALESCE($1, title),
           type = COALESCE($2, type),
           due_date = COALESCE($3, due_date),
           description = COALESCE($4, description),
           resource_link = COALESCE($5, resource_link),
           submission_link = COALESCE($6, submission_link),
           team_size = COALESCE($7, team_size)
       WHERE id = $8
       RETURNING *`,
      [title, type, due_date, description, resource_link, submission_link, team_size, id]
    );

    return Response.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error updating assignment:", error);
    return Response.json({ error: "Failed to update assignment" }, { status: 500 });
  }
}

/**
 * DELETE /api/assignments/[id]
 * Delete an assignment (cascades to overrides via FK).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireCoordinator();
  if (response) return response;

  const { id } = await params;

  // Verify assignment exists and coordinator owns it
  const existing = await query("SELECT * FROM assignments WHERE id = $1", [id]);
  if (existing.rows.length === 0) {
    return Response.json({ error: "Assignment not found" }, { status: 404 });
  }

  const owns = await coordinatorOwnsCourse(user.id, existing.rows[0].course_id);
  if (!owns) {
    return Response.json({ error: "You don't coordinate this course" }, { status: 403 });
  }

  await query("DELETE FROM assignments WHERE id = $1", [id]);
  return Response.json({ message: "Assignment deleted" });
}
