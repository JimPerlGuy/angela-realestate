require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'angela-db.c6p2ge6ask6j.us-east-1.rds.amazonaws.com',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'angela_db',
  user:     process.env.DB_USER     || 'angela_admin',
  password: process.env.DB_PASSWORD || '9XkOnMUDZBb3TayjMezBZefB',
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  try {
    const sql = fs.readFileSync('./migrations/001_create_testimonials_and_updates.sql', 'utf8');
    await pool.query(sql);
    console.log('✓ Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('✗ Migration failed:', err.message);
    process.exit(1);
  } finally {
    pool.end();
  }
}

runMigration();
