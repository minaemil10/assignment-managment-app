const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to database. Running schema...");

    const schemaPath = path.join(__dirname, '../lib/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log("Schema created successfully.");

    // Insert base departments and grab their IDs
    const deptRes = await client.query(`
      INSERT INTO departments (name) VALUES 
      ('Computer Science'),
      ('Mechanical Engineering'),
      ('Electrical Engineering')
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);

    // Prepare Term generation
    const termsToInsert = [];
    
    // 1. Add Prep Terms (Term 1 and 2, Level 0, No Department)
    termsToInsert.push(`(1, 0, NULL)`, `(2, 0, NULL)`);

    // 2. Loop through the created departments and generate Terms 3 through 10
    const deptIds = deptRes.rows.map(row => row.id);
    for (const deptId of deptIds) {
      for (let termNum = 3; termNum <= 10; termNum++) {
        const level = Math.floor((termNum - 1) / 2);
        termsToInsert.push(`(${termNum}, ${level}, ${deptId})`);
      }
    }

    // Bulk insert all terms
    if (termsToInsert.length > 0) {
      await client.query(`
        INSERT INTO terms (number, level, department_id) 
        VALUES ${termsToInsert.join(', ')}
        ON CONFLICT DO NOTHING;
      `);
    }

    // Insert admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, is_active)
      VALUES ('System Admin', 'admin@university.edu', $1, 'ADMIN', true)
      ON CONFLICT (email) DO NOTHING;
    `, [passwordHash]);

    console.log("Seed data inserted successfully.");
    console.log("Admin account: admin@university.edu / admin123");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.end();
  }
}

seed();
