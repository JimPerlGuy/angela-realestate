const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'angela-db.c6p2ge6ask6j.us-east-1.rds.amazonaws.com',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'angela_db',
  user:     process.env.DB_USER     || 'angela_admin',
  password: process.env.DB_PASSWORD || '9XkOnMUDZBb3TayjMezBZefB',
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => console.error('Unexpected DB pool error:', err));

// ── Listings ─────────────────────────────────────────────────────────────────

async function getListings({ status = 'active' } = {}) {
  const { rows } = await pool.query(
    `SELECT l.*, COALESCE(
       (SELECT json_agg(p ORDER BY p."isPrimary" DESC, p."uploadedAt")
        FROM photos p WHERE p."listingId" = l.id), '[]'
     ) AS photos
     FROM listings l
     WHERE l.status = $1
     ORDER BY l."createdAt" DESC`,
    [status]
  );
  return rows;
}

async function getListingById(id) {
  const { rows } = await pool.query(
    `SELECT l.*, COALESCE(
       (SELECT json_agg(p ORDER BY p."isPrimary" DESC, p."uploadedAt")
        FROM photos p WHERE p."listingId" = l.id), '[]'
     ) AS photos
     FROM listings l WHERE l.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function createListing({ address, price, bedrooms, bathrooms, sqft, description, features, status = 'draft' }) {
  const { rows } = await pool.query(
    `INSERT INTO listings (address, price, bedrooms, bathrooms, sqft, description, features, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [address, price, bedrooms, bathrooms, sqft, description, features, status]
  );
  return rows[0];
}

async function updateListing(id, fields) {
  const allowed = ['address', 'price', 'bedrooms', 'bathrooms', 'sqft', 'description', 'features', 'status'];
  const keys = Object.keys(fields).filter(k => allowed.includes(k));
  if (keys.length === 0) throw new Error('No valid fields to update');

  const sets = keys.map((k, i) => `"${k}" = $${i + 2}`).join(', ');
  const values = keys.map(k => fields[k]);
  const { rows } = await pool.query(
    `UPDATE listings SET ${sets} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return rows[0] || null;
}

async function deleteListing(id) {
  const { rowCount } = await pool.query(`DELETE FROM listings WHERE id = $1`, [id]);
  return rowCount > 0;
}

// ── Photos ───────────────────────────────────────────────────────────────────

async function addPhoto(listingId, { s3Key, url, isPrimary = false }) {
  if (isPrimary) {
    await pool.query(`UPDATE photos SET "isPrimary" = FALSE WHERE "listingId" = $1`, [listingId]);
  }
  const { rows } = await pool.query(
    `INSERT INTO photos ("listingId", "s3Key", url, "isPrimary")
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [listingId, s3Key, url, isPrimary]
  );
  return rows[0];
}

async function deletePhoto(id) {
  const { rows } = await pool.query(`DELETE FROM photos WHERE id = $1 RETURNING "s3Key"`, [id]);
  return rows[0] || null;
}

async function setPrimaryPhoto(listingId, photoId) {
  await pool.query(`UPDATE photos SET "isPrimary" = FALSE WHERE "listingId" = $1`, [listingId]);
  const { rows } = await pool.query(
    `UPDATE photos SET "isPrimary" = TRUE WHERE id = $1 AND "listingId" = $2 RETURNING *`,
    [photoId, listingId]
  );
  return rows[0] || null;
}

// ── Leads ────────────────────────────────────────────────────────────────────

async function createLead({ listingId = null, name, email, phone, message }) {
  const { rows } = await pool.query(
    `INSERT INTO leads ("listingId", name, email, phone, message)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [listingId, name, email, phone, message]
  );
  return rows[0];
}

async function getLeads({ listingId } = {}) {
  if (listingId) {
    const { rows } = await pool.query(
      `SELECT * FROM leads WHERE "listingId" = $1 ORDER BY "createdAt" DESC`, [listingId]
    );
    return rows;
  }
  const { rows } = await pool.query(`SELECT * FROM leads ORDER BY "createdAt" DESC`);
  return rows;
}

// ── Health check ─────────────────────────────────────────────────────────────

async function testConnection() {
  const { rows } = await pool.query('SELECT NOW() AS now, current_database() AS db');
  return rows[0];
}

module.exports = {
  pool,
  testConnection,
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  addPhoto,
  deletePhoto,
  setPrimaryPhoto,
  createLead,
  getLeads,
};
