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

// ── Agents ──────────────────────────────────────────────────────────────────

async function getAgents() {
  const { rows } = await pool.query(`SELECT * FROM agents ORDER BY "isPrimary" DESC, "createdAt" ASC`);
  return rows;
}

async function getPrimaryAgent() {
  const { rows } = await pool.query(`SELECT * FROM agents WHERE "isPrimary" = TRUE LIMIT 1`);
  return rows[0] || null;
}

async function createAgent({ name, title, bio, photoUrl, yearsExperience, propertiesSold, activeMarkets }) {
  const { rows } = await pool.query(
    `INSERT INTO agents (name, title, bio, "photoUrl", "yearsExperience", "propertiesSold", "activeMarkets")
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, title, bio, photoUrl, yearsExperience, propertiesSold, activeMarkets]
  );
  return rows[0];
}

async function updateAgent(id, { name, title, bio, photoUrl, yearsExperience, propertiesSold, activeMarkets, isPrimary }) {
  if (isPrimary) {
    await pool.query(`UPDATE agents SET "isPrimary" = FALSE WHERE "isPrimary" = TRUE`);
  }
  const { rows } = await pool.query(
    `UPDATE agents SET name = $2, title = $3, bio = $4, "photoUrl" = $5, "yearsExperience" = $6, "propertiesSold" = $7, "activeMarkets" = $8, "isPrimary" = $9 WHERE id = $1 RETURNING *`,
    [id, name, title, bio, photoUrl, yearsExperience, propertiesSold, activeMarkets, isPrimary || false]
  );
  return rows[0] || null;
}

async function deleteAgent(id) {
  const { rowCount } = await pool.query(`DELETE FROM agents WHERE id = $1`, [id]);
  return rowCount > 0;
}

// ── Testimonials ────────────────────────────────────────────────────────────

async function getTestimonials() {
  const { rows } = await pool.query(`SELECT * FROM testimonials ORDER BY "createdAt" DESC`);
  return rows;
}

async function createTestimonial({ rating, text, name, contactType }) {
  const { rows } = await pool.query(
    `INSERT INTO testimonials (rating, text, name, "contactType")
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [rating, text, name, contactType]
  );
  return rows[0];
}

async function updateTestimonial(id, { rating, text, name, contactType }) {
  const { rows } = await pool.query(
    `UPDATE testimonials SET rating = $2, text = $3, name = $4, "contactType" = $5 WHERE id = $1 RETURNING *`,
    [id, rating, text, name, contactType]
  );
  return rows[0] || null;
}

async function deleteTestimonial(id) {
  const { rowCount } = await pool.query(`DELETE FROM testimonials WHERE id = $1`, [id]);
  return rowCount > 0;
}

// ── Market Updates ───────────────────────────────────────────────────────────

async function getMarketUpdates() {
  const { rows } = await pool.query(`SELECT * FROM market_updates ORDER BY "date" DESC`);
  return rows;
}

async function createMarketUpdate({ sourceName, date, title, previewText, sourceUrl }) {
  const { rows } = await pool.query(
    `INSERT INTO market_updates ("sourceName", "date", title, "previewText", "sourceUrl")
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [sourceName, date, title, previewText, sourceUrl]
  );
  return rows[0];
}

async function updateMarketUpdate(id, { sourceName, date, title, previewText, sourceUrl }) {
  const { rows } = await pool.query(
    `UPDATE market_updates SET "sourceName" = $2, "date" = $3, title = $4, "previewText" = $5, "sourceUrl" = $6 WHERE id = $1 RETURNING *`,
    [id, sourceName, date, title, previewText, sourceUrl]
  );
  return rows[0] || null;
}

async function deleteMarketUpdate(id) {
  const { rowCount } = await pool.query(`DELETE FROM market_updates WHERE id = $1`, [id]);
  return rowCount > 0;
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
  getAgents,
  getPrimaryAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getMarketUpdates,
  createMarketUpdate,
  updateMarketUpdate,
  deleteMarketUpdate,
};
