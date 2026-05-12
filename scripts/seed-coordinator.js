const { Client } = require('pg');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function seedCoordinator() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to database. Seeding coordinator test data...");

    // 1. Create a coordinator user
    const passwordHash = await bcrypt.hash('coord123', 10);
    const userRes = await client.query(`
      INSERT INTO users (name, email, password_hash, role, is_active)
      VALUES ('Dr. Sarah Chen', 'coordinator@university.edu', $1, 'COORDINATOR', true)
      ON CONFLICT (email) DO UPDATE SET role = 'COORDINATOR'
      RETURNING id;
    `, [passwordHash]);
    const coordinatorId = userRes.rows[0].id;
    console.log(`Coordinator user created (id: ${coordinatorId})`);

    // 2. Create terms
    const term1Res = await client.query(`
      INSERT INTO terms (number, level, department_id)
      VALUES (1, 1, NULL)
      RETURNING id;
    `);
    const prepTermId = term1Res.rows[0].id;

    // Get CS department id
    const deptRes = await client.query(`SELECT id FROM departments WHERE name = 'Computer Science'`);
    const csDeptId = deptRes.rows[0].id;

    const term2Res = await client.query(`
      INSERT INTO terms (number, level, department_id)
      VALUES (1, 2, $1)
      RETURNING id;
    `, [csDeptId]);
    const csTermId = term2Res.rows[0].id;
    console.log(`Terms created (prep: ${prepTermId}, CS L2: ${csTermId})`);

    // 3. Create courses
    const course1Res = await client.query(`
      INSERT INTO courses (code, name, is_elective, term_id, department_id)
      VALUES ('CS101', 'Introduction to Programming', false, $1, $2)
      RETURNING id;
    `, [prepTermId, csDeptId]);
    const cs101Id = course1Res.rows[0].id;

    const course2Res = await client.query(`
      INSERT INTO courses (code, name, is_elective, term_id, department_id)
      VALUES ('CS201', 'Data Structures & Algorithms', false, $1, $2)
      RETURNING id;
    `, [csTermId, csDeptId]);
    const cs201Id = course2Res.rows[0].id;
    console.log(`Courses created (CS101: ${cs101Id}, CS201: ${cs201Id})`);

    // 4. Assign coordinator to both courses
    await client.query(`
      INSERT INTO course_coordinators (course_id, user_id) VALUES ($1, $2), ($3, $2)
      ON CONFLICT DO NOTHING;
    `, [cs101Id, coordinatorId, cs201Id]);
    console.log("Coordinator assigned to both courses");

    // 5. Create sections (2 per course)
    const sectionsRes = await client.query(`
      INSERT INTO sections (course_id, name) VALUES
        ($1, 'Section A'),
        ($1, 'Section B'),
        ($2, 'Section A'),
        ($2, 'Section B')
      RETURNING id, course_id, name;
    `, [cs101Id, cs201Id]);
    console.log(`Sections created: ${sectionsRes.rows.map(r => `${r.name} (course ${r.course_id})`).join(', ')}`);

    // Get section IDs for CS101
    const cs101SectionB = sectionsRes.rows.find(r => r.course_id === cs101Id && r.name === 'Section B');

    // 6. Create lab groups (1 per course)
    await client.query(`
      INSERT INTO lab_groups (course_id, name) VALUES
        ($1, 'Lab Group 1'),
        ($2, 'Lab Group 1');
    `, [cs101Id, cs201Id]);
    console.log("Lab groups created");

    // 7. Create sample assignments
    const now = new Date();
    const inOneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const inThreeWeeks = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

    const assign1Res = await client.query(`
      INSERT INTO assignments (course_id, title, type, description, due_date, resource_link, submission_link, team_size)
      VALUES ($1, 'Lab 1: Hello World', 'LAB', 'Write your first Python program that prints Hello World and takes user input.', $2, 'https://docs.python.org/3/tutorial/', 'https://forms.google.com/submit-lab1', 1)
      RETURNING id;
    `, [cs101Id, inOneWeek.toISOString()]);
    const assign1Id = assign1Res.rows[0].id;

    await client.query(`
      INSERT INTO assignments (course_id, title, type, description, due_date, resource_link, team_size)
      VALUES ($1, 'Sheet 1: Arrays & Linked Lists', 'SHEET', 'Solve problems 1-10 from the textbook chapter on linear data structures.', $2, 'https://textbook.cs201.edu/chapter3', 2);
    `, [cs201Id, inTwoWeeks.toISOString()]);
    console.log("Sample assignments created");

    // 8. Create an override (Section B of CS101 gets extra time)
    await client.query(`
      INSERT INTO assignment_overrides (assignment_id, section_id, due_date)
      VALUES ($1, $2, $3);
    `, [assign1Id, cs101SectionB.id, inThreeWeeks.toISOString()]);
    console.log("Override created: CS101 Section B gets 2 extra weeks for Lab 1");

    console.log("\n✅ Coordinator seed data inserted successfully!");
    console.log("Coordinator account: coordinator@university.edu / coord123");

  } catch (error) {
    console.error("Error seeding coordinator data:", error);
  } finally {
    await client.end();
  }
}

seedCoordinator();
