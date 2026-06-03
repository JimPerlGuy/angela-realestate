const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_HOST = process.env.DB_HOST || 'angela-db.c6p2ge6ask6j.us-east-1.rds.amazonaws.com';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME || 'angela_db';
const DB_USER = process.env.DB_USER || 'angela_admin';
const DB_PASSWORD = process.env.DB_PASSWORD || '9XkOnMUDZBb3TayjMezBZefB';

async function ensureDatabase() {
  // Connect to the default postgres db to create angela_db if needed
  const admin = new Client({
    host: DB_HOST, port: DB_PORT,
    database: 'postgres',
    user: DB_USER, password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });
  await admin.connect();
  const { rows } = await admin.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]
  );
  if (rows.length === 0) {
    await admin.query(`CREATE DATABASE ${DB_NAME}`);
    console.log(`Created database: ${DB_NAME}`);
  } else {
    console.log(`Database already exists: ${DB_NAME}`);
  }
  await admin.end();
}

async function runMigrations() {
  await ensureDatabase();

  const client = new Client({
    host: DB_HOST, port: DB_PORT,
    database: DB_NAME,
    user: DB_USER, password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log(`Connected to ${DB_NAME} on ${DB_HOST}`);

  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Running migration: ${file}`);
    await client.query(sql);
    console.log(`  ✓ ${file}`);
  }

  await client.end();
  console.log('All migrations complete.');
}

runMigrations().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
