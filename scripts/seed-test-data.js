const { Client } = require('pg');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function seedTestData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to database. Inserting test data...\n");

    const hash = await bcrypt.hash('password123', 10);

    // ── 1. Departments (may already exist from seed.js) ───────────────
    await client.query(`
      INSERT INTO departments (name) VALUES
        ('Computer Science'),
        ('Mechanical Engineering'),
        ('Electrical Engineering')
      ON CONFLICT DO NOTHING;
    `);
    console.log("✓ Departments");

    // ── 2. Users ──────────────────────────────────────────────────────
    //   admin  → id will be 1 (or already exists)
    //   coord  → coordinator
    //   students → student1, student2
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, department_id, term, is_active) VALUES
        ('System Admin',   'admin@university.edu',    $1, 'ADMIN',       1, NULL, true),
        ('Dr. Sara Ahmed', 'sara@university.edu',     $1, 'COORDINATOR', 1, NULL, true),
        ('Daniel Student', 'daniel@university.edu',   $1, 'STUDENT',     1, 8,    true),
        ('Mina Student',   'mina@university.edu',     $1, 'STUDENT',     1, 8,    true)
      ON CONFLICT (email) DO NOTHING;
    `, [hash]);
    console.log("✓ Users  (password for all: password123)");

    // Get inserted user IDs by email so the rest is safe regardless of order
    const { rows: users } = await client.query(
      `SELECT id, email, role FROM users ORDER BY id`
    );
    const userMap = Object.fromEntries(users.map(u => [u.email, u.id]));
    const coordId   = userMap['sara@university.edu'];
    const student1  = userMap['daniel@university.edu'];
    const student2  = userMap['mina@university.edu'];

    // ── 3. Terms ──────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO terms (number, level, department_id) VALUES
        (1, 1, 1),
        (2, 1, 1),
        (3, 2, 1),
        (4, 2, 1),
        (5, 3, 1),
        (6, 3, 1),
        (7, 4, 1),
        (8, 4, 1)
      ON CONFLICT DO NOTHING;
    `);
    console.log("✓ Terms");

    // Fetch term 8 id
    const { rows: termRows } = await client.query(
      `SELECT id FROM terms WHERE number = 8 AND department_id = 1 LIMIT 1`
    );
    const term8Id = termRows[0].id;

    // ── 4. Courses ────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO courses (code, name, is_elective, term_id, department_id) VALUES
        ('CS401', 'Software Engineering',      false, $1, 1),
        ('CS402', 'Machine Learning',           false, $1, 1),
        ('CS403', 'Distributed Systems',        true,  $1, 1)
      ON CONFLICT DO NOTHING;
    `, [term8Id]);
    console.log("✓ Courses");

    const { rows: courseRows } = await client.query(
      `SELECT id, code FROM courses WHERE term_id = $1 ORDER BY code`, [term8Id]
    );
    const courseMap = Object.fromEntries(courseRows.map(c => [c.code, c.id]));
    const cs401 = courseMap['CS401'];
    const cs402 = courseMap['CS402'];
    const cs403 = courseMap['CS403'];

    // ── 5. Course coordinators ────────────────────────────────────────
    await client.query(`
      INSERT INTO course_coordinators (course_id, user_id) VALUES
        ($1, $3), ($2, $3)
      ON CONFLICT DO NOTHING;
    `, [cs401, cs402, coordId]);
    console.log("✓ Course coordinators");

    // ── 6. Sections ───────────────────────────────────────────────────
    await client.query(`
      INSERT INTO sections (course_id, name) VALUES
        ($1, 'Section A'), ($1, 'Section B'),
        ($2, 'Section A'),
        ($3, 'Section A')
      ON CONFLICT DO NOTHING;
    `, [cs401, cs402, cs403]);
    console.log("✓ Sections");

    const { rows: secRows } = await client.query(`SELECT id, course_id, name FROM sections ORDER BY id`);
    // cs401-A, cs401-B, cs402-A, cs403-A
    const sec401A = secRows.find(s => s.course_id === cs401 && s.name === 'Section A').id;
    const sec402A = secRows.find(s => s.course_id === cs402 && s.name === 'Section A').id;
    const sec403A = secRows.find(s => s.course_id === cs403 && s.name === 'Section A').id;

    // ── 7. Lab groups ─────────────────────────────────────────────────
    await client.query(`
      INSERT INTO lab_groups (course_id, name) VALUES
        ($1, 'Lab Group 1'), ($1, 'Lab Group 2'),
        ($2, 'Lab Group 1')
      ON CONFLICT DO NOTHING;
    `, [cs401, cs402]);
    console.log("✓ Lab groups");

    const { rows: labRows } = await client.query(`SELECT id, course_id, name FROM lab_groups ORDER BY id`);
    const lab401_1 = labRows.find(l => l.course_id === cs401 && l.name === 'Lab Group 1').id;
    const lab402_1 = labRows.find(l => l.course_id === cs402 && l.name === 'Lab Group 1').id;

    // ── 8. Enrollments ────────────────────────────────────────────────
    await client.query(`
      INSERT INTO enrollments (student_id, section_id, lab_group_id) VALUES
        ($1, $3, $5),
        ($1, $4, $6),
        ($1, $7, NULL),
        ($2, $3, $5),
        ($2, $4, $6)
    `, [student1, student2, sec401A, sec402A, lab401_1, lab402_1, sec403A]);
    console.log("✓ Enrollments");

    // ── 9. Assignments ────────────────────────────────────────────────
    const now = new Date();
    const d = (daysFromNow) => new Date(now.getTime() + daysFromNow * 86400000).toISOString();

    await client.query(`
      INSERT INTO assignments (course_id, title, type, description, due_date, resource_link, submission_link, team_size) VALUES
        ($1, 'Lab 5 – Unit Testing',          'LAB',           'Write unit tests for the authentication module using Jest.',                           $4,  'https://docs.google.com/lab5',   'https://submit.example.com/lab5',   1),
        ($1, 'Sheet 3 – Design Patterns',      'SHEET',         'Solve the exercises on Observer, Strategy, and Factory patterns.',                     $5,  'https://docs.google.com/sheet3', 'https://submit.example.com/sheet3', 1),
        ($1, 'Final Project – AMS',            'FINAL_PROJECT', 'Build an Assignment Management System. Teams of 3-4.',                                 $6,  NULL,                              'https://submit.example.com/fp',    4),
        ($2, 'Quiz 2 – Neural Networks',       'QUIZ',          'In-class quiz covering perceptrons, backpropagation, and activation functions.',       $7,  NULL,                              NULL,                                1),
        ($2, 'Midterm Exam',                   'MIDTERM',       'Covers lectures 1-7: regression, classification, SVMs.',                              $8,  'https://docs.google.com/review', NULL,                                1),
        ($2, 'Lab 3 – Scikit-learn Pipeline',  'LAB',           'Create an ML pipeline using Scikit-learn: preprocessing, training, evaluation.',       $9,  'https://colab.google.com/lab3',  'https://submit.example.com/ml3',   2),
        ($3, 'Sheet 1 – Consensus Algorithms', 'SHEET',         'Compare Raft and Paxos. Prove safety properties for both.',                            $10, 'https://docs.google.com/ds1',    'https://submit.example.com/ds1',   1)
    `, [cs401, cs402, cs403,
        d(3), d(7), d(30), d(2), d(14), d(5), d(10)]);
    console.log("✓ Assignments (7 total, various types)");

    // Fetch assignment IDs
    const { rows: asnRows } = await client.query(`SELECT id, title FROM assignments ORDER BY id`);

    // ── 10. Assignment overrides (section-specific deadlines) ─────────
    const lab5Id = asnRows.find(a => a.title.includes('Lab 5')).id;
    await client.query(`
      INSERT INTO assignment_overrides (assignment_id, section_id, due_date) VALUES
        ($1, $2, $3)
    `, [lab5Id, sec401A, d(5)]);  // Section A gets 2 extra days
    console.log("✓ Assignment overrides");

    // ── 11. Student submissions (mark some as done) ───────────────────
    const sheet3Id = asnRows.find(a => a.title.includes('Sheet 3')).id;
    const quiz2Id  = asnRows.find(a => a.title.includes('Quiz 2')).id;
    await client.query(`
      INSERT INTO student_submissions (student_id, assignment_id, is_done) VALUES
        ($1, $2, true),
        ($1, $3, true)
    `, [student1, sheet3Id, quiz2Id]);
    console.log("✓ Student submissions (2 marked as done for daniel)");

    console.log("\n══════════════════════════════════════════════");
    console.log("  Test data seeded successfully!");
    console.log("══════════════════════════════════════════════");
    console.log("\n  Login credentials:");
    console.log("  ─────────────────────────────────────────");
    console.log("  Admin:       admin@university.edu    / password123");
    console.log("  Coordinator: sara@university.edu     / password123");
    console.log("  Student 1:   daniel@university.edu   / password123");
    console.log("  Student 2:   mina@university.edu     / password123");
    console.log("");
  } catch (error) {
    console.error("Error seeding test data:", error);
  } finally {
    await client.end();
  }
}

seedTestData();
