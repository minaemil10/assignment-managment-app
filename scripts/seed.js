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

    // Insert base departments
    await client.query(`
      INSERT INTO departments (name) VALUES 
      ('Computer Science'),
      ('Mechanical Engineering'),
      ('Electrical Engineering')
      ON CONFLICT DO NOTHING;
    `);

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
