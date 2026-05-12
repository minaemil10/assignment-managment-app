import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

// GET all coordinator requests (admin only)
export async function GET() {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const res = await query(
      `SELECT cr.id, cr.status, cr.created_at,
              u.id AS user_id, u.name AS user_name, u.email AS user_email,
              reviewer.name AS reviewed_by_name
       FROM coordinator_requests cr
       JOIN users u ON u.id = cr.user_id
       LEFT JOIN users reviewer ON reviewer.id = cr.reviewed_by
       ORDER BY cr.created_at DESC`,
      []
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

// PATCH a request — approve or reject
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { request_id, action } = await req.json();

    if (!request_id || !action) {
      return NextResponse.json({ error: "request_id and action are required" }, { status: 400 });
    }

    if (!["APPROVED", "REJECTED"].includes(action)) {
      return NextResponse.json({ error: "action must be APPROVED or REJECTED" }, { status: 400 });
    }

    const adminId = (session?.user as any)?.id;

    // Fetch the request to get the user_id
    const reqRes = await query("SELECT * FROM coordinator_requests WHERE id = $1", [request_id]);
    if (reqRes.rows.length === 0) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const coordinatorRequest = reqRes.rows[0];

    // Update request status
    await query(
      "UPDATE coordinator_requests SET status = $1, reviewed_by = $2 WHERE id = $3",
      [action, adminId, request_id]
    );

    // If APPROVED, promote the user's role to COORDINATOR
    if (action === "APPROVED") {
      await query("UPDATE users SET role = 'COORDINATOR' WHERE id = $1", [
        coordinatorRequest.user_id,
      ]);
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
