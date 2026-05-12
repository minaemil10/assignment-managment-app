import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { requireCoordinator, coordinatorOwnsCourse } from "@/lib/auth-helpers";

/**
 * GET /api/assignments
 * List assignments for courses the coordinator manages.
 * Optional query param: ?course_id=X to filter by course.
 */
export async function GET(request: NextRequest) {
  const { user, response } = await requireCoordinator();
  if (response) return response;

  const courseId = request.nextUrl.searchParams.get("course_id");

  let sql: string;
  let params: any[];

  if (courseId) {
    // Verify coordinator owns this course
    const owns = await coordinatorOwnsCourse(user.id, parseInt(courseId));
    if (!owns) {
      return Response.json({ error: "You don't coordinate this course" }, { status: 403 });
    }

    sql = `
      SELECT a.*,
        COALESCE(
          json_agg(
            json_build_object('id', ao.id, 'assignment_id', ao.assignment_id, 'section_id', ao.section_id, 'due_date', ao.due_date)
          ) FILTER (WHERE ao.id IS NOT NULL),
          '[]'
        ) AS overrides
      FROM assignments a
      LEFT JOIN assignment_overrides ao ON ao.assignment_id = a.id
      WHERE a.course_id = $1
      GROUP BY a.id
      ORDER BY a.due_date ASC
    `;
    params = [courseId];
  } else {
    // All assignments for all courses this coordinator manages
    sql = `
      SELECT a.*,
        COALESCE(
          json_agg(
            json_build_object('id', ao.id, 'assignment_id', ao.assignment_id, 'section_id', ao.section_id, 'due_date', ao.due_date)
          ) FILTER (WHERE ao.id IS NOT NULL),
          '[]'
        ) AS overrides
      FROM assignments a
      INNER JOIN course_coordinators cc ON cc.course_id = a.course_id
      LEFT JOIN assignment_overrides ao ON ao.assignment_id = a.id
      WHERE cc.user_id = $1
      GROUP BY a.id
      ORDER BY a.due_date ASC
    `;
    params = [user.id];
  }

  const result = await query(sql, params);
  return Response.json(result.rows);
}

/**
 * POST /api/assignments
 * Create a new assignment.
 * Body: { course_id, title, type, due_date, description?, resource_link?, submission_link?, team_size? }
 */
export async function POST(request: NextRequest) {
  const { user, response } = await requireCoordinator();
  if (response) return response;

  try {
    const body = await request.json();
    const { course_id, title, type, due_date, description, resource_link, submission_link, team_size } = body;

    // Validate required fields
    if (!course_id || !title || !type || !due_date) {
      return Response.json(
        { error: "Missing required fields: course_id, title, type, due_date" },
        { status: 400 }
      );
    }

    // Verify coordinator owns this course
    const owns = await coordinatorOwnsCourse(user.id, course_id);
    if (!owns) {
      return Response.json({ error: "You don't coordinate this course" }, { status: 403 });
    }

    const result = await query(
      `INSERT INTO assignments (course_id, title, type, description, due_date, resource_link, submission_link, team_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [course_id, title, type, description || null, due_date, resource_link || null, submission_link || null, team_size || 1]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("Error creating assignment:", error);
    return Response.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}
