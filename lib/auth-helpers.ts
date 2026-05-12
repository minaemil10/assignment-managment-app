import { auth } from "@/auth";

/**
 * Checks the session and returns the user if they are a COORDINATOR.
 * If not authenticated or not a coordinator, returns an appropriate error response.
 */
export async function requireCoordinator() {
  const session = await auth();

  if (!session?.user) {
    return {
      user: null,
      response: Response.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }

  const user = session.user as any;

  if (user.role !== "COORDINATOR") {
    return {
      user: null,
      response: Response.json({ error: "Forbidden: Coordinator access required" }, { status: 403 }),
    };
  }

  return { user, response: null };
}

/**
 * Checks whether a coordinator is assigned to a specific course.
 * Returns true if the coordinator owns the course.
 */
export async function coordinatorOwnsCourse(userId: string, courseId: number): Promise<boolean> {
  const { query } = await import("@/lib/db");
  const result = await query(
    "SELECT 1 FROM course_coordinators WHERE user_id = $1 AND course_id = $2",
    [userId, courseId]
  );
  return result.rows.length > 0;
}
