import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

// GET: This function automatically handles all GET requests to /api/departments
export async function GET() {
  try {
    // 1. We execute a simple SQL query to select everything from the departments table
    // The query() function comes from our lib/db.ts file
    const res = await query('SELECT * FROM departments ORDER BY name ASC');
    
    // 2. We return the rows (the data) as a JSON response to the frontend
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

// POST: This function automatically handles all POST requests to /api/departments
export async function POST(req: Request) {
  try {
    // 1. Security Check: Grab the session to see who is making this request
    const session = await auth();
    
    // If they aren't logged in, or their role isn't ADMIN, we reject the request
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized. Only Admins can create departments." }, { status: 403 });
    }

    // 2. Read the JSON body sent from the frontend
    const { name } = await req.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: "Department name is required" }, { status: 400 });
    }

    // 3. Insert the new department into the database
    // The $1 is a placeholder. We pass `[name]` as the second argument.
    // This is CRITICAL because it prevents SQL Injection hackers!
    // RETURNING * tells Postgres to give us back the newly created row instantly.
    const res = await query(
      'INSERT INTO departments (name) VALUES ($1) RETURNING *',
      [name]
    );

    // 4. Return the newly created department data back to the frontend
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error: any) {
    // Error code 23505 means "Unique constraint violation" (name al.ready exists)
    if (error.code === '23505') {
      return NextResponse.json({ error: "Department already exists" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}
