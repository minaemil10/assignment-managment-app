const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

async function addTestUsers() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    console.log("Connected to DB. Adding test users...");

    const passwordHash = await bcrypt.hash('password123', 10);

    // Add a Student
    await client.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ('Test Student', 'student@university.edu', $1, 'STUDENT')
      ON CONFLICT DO NOTHING;
    `, [passwordHash]);

    // Add a Coordinator
    await client.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ('Test Coordinator', 'coordinator@university.edu', $1, 'COORDINATOR')
      ON CONFLICT DO NOTHING;
    `, [passwordHash]);

    console.log("Test users added successfully!");
  } catch (err) {
    console.error("Error adding test users:", err);
  } finally {
    await client.end();
  }
}

addTestUsers();
