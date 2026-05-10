import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 1. Hash the password so we never store plain text passwords
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Insert into the database. Note the $1, $2 variables protect against SQL injection!
    await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
      [name, email, hashedPassword]
    );

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error: any) {
    // Error code 23505 in Postgres means "Unique constraint violation" (email already exists)
    if (error.code === '23505') {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
