import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    const res = await query('SELECT * FROM terms ORDER BY number ASC, department_id ASC');
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch terms" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized. Only Admins can create terms." }, { status: 403 });
    }

    const { number, department_id } = await req.json();

    if (!number) {
      return NextResponse.json({ error: "Term number is required" }, { status: 400 });
    }

    const termNum = Number(number);
    
    // Auto-calculate the Level
    // Term 1, 2 -> Math.floor((1-1)/2) = 0
    // Term 3, 4 -> Math.floor((3-1)/2) = 1
    const calculatedLevel = Math.floor((termNum - 1) / 2);

    // Rule 1: Term 1 & 2 (Level 0) CANNOT have a department
    if (termNum <= 2 && department_id) {
      return NextResponse.json({ error: "Terms 1 and 2 are Preparatory and cannot belong to a specific department." }, { status: 400 });
    }

    // Rule 2: Term 3+ (Level 1+) MUST have a department
    if (termNum > 2 && !department_id) {
      return NextResponse.json({ error: `Term ${termNum} requires a specific department. It cannot be Preparatory.` }, { status: 400 });
    }

    const res = await query(
      'INSERT INTO terms (number, level, department_id) VALUES ($1, $2, $3) RETURNING *',
      [termNum, calculatedLevel, department_id || null]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error: any) {
    if (error.code === '23505') {
       return NextResponse.json({ error: "This term already exists for this department" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create term" }, { status: 500 });
  }
}
