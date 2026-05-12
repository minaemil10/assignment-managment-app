import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password, role_requested } = await req.json();

    // 1. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Insert user (Role defaults to STUDENT in DB schema)
    const userRes = await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hashedPassword]
    );

    const userId = userRes.rows[0].id;

    // 3. If they requested COORDINATOR, create a request for approval
    if (role_requested === "COORDINATOR") {
      await query(
        'INSERT INTO coordinator_requests (user_id) VALUES ($1)',
        [userId]
      );
    }

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
