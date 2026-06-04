require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const serverless = require('serverless-http');
const { testConnection, getListings, getListingById, createListing, updateListing, deleteListing, createLead, addPhoto, deletePhoto: dbDeletePhoto, setPrimaryPhoto, getAgents, getPrimaryAgent, createAgent, updateAgent, deleteAgent, getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, getMarketUpdates, createMarketUpdate, updateMarketUpdate, deleteMarketUpdate } = require('./db');
const { requireAuth, generateToken, comparePassword } = require('./auth');
const { uploadPhoto, deletePhoto: s3DeletePhoto } = require('./s3');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const app = express();

app.use(cors());
app.use(express.json());

// ── Health ─────────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    const db = await testConnection();
    res.json({ status: 'ok', db });
  } catch {
    res.json({ status: 'ok' });
  }
});

// ── Public: Listings ───────────────────────────────────────────────────────
app.get('/api/listings', async (req, res) => {
  try {
    const listings = await getListings({ status: 'active' });
    res.json(listings);
  } catch (err) {
    console.error('GET /api/listings error:', err.message);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const listing = await getListingById(req.params.id);
    if (!listing || listing.status !== 'active') return res.status(404).json({ error: 'Not found' });
    res.json(listing);
  } catch (err) {
    console.error('GET /api/listings/:id error:', err.message);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// ── Public: Lead capture ───────────────────────────────────────────────────
app.post('/api/leads', async (req, res) => {
  try {
    const { listingId, name, email, phone, message } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
    const lead = await createLead({ listingId: listingId || null, name, email, phone, message });
    res.status(201).json(lead);
  } catch (err) {
    console.error('POST /api/leads error:', err.message);
    res.status(500).json({ error: 'Failed to submit lead' });
  }
});

// ── Public: Agents ────────────────────────────────────────────────────────
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await getAgents();
    res.json(agents);
  } catch (err) {
    console.error('GET /api/agents error:', err.message);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

app.get('/api/agents/primary', async (req, res) => {
  try {
    const agent = await getPrimaryAgent();
    res.json(agent || {});
  } catch (err) {
    console.error('GET /api/agents/primary error:', err.message);
    res.status(500).json({ error: 'Failed to fetch primary agent' });
  }
});

// ── Public: Testimonials ───────────────────────────────────────────────────
app.get('/api/testimonials', async (req, res) => {
  try {
    const testimonials = await getTestimonials();
    res.json(testimonials);
  } catch (err) {
    console.error('GET /api/testimonials error:', err.message);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// ── Public: Market Updates ────────────────────────────────────────────────
app.get('/api/market-updates', async (req, res) => {
  try {
    const updates = await getMarketUpdates();
    res.json(updates);
  } catch (err) {
    console.error('GET /api/market-updates error:', err.message);
    res.status(500).json({ error: 'Failed to fetch market updates' });
  }
});

// ── Admin: Auth ────────────────────────────────────────────────────────────
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'angela@angelatexasrealtor.com';

app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email !== ADMIN_EMAIL) return res.status(401).json({ error: 'Invalid credentials' });
    if (!ADMIN_PASSWORD_HASH) return res.status(500).json({ error: 'Auth not configured' });
    const ok = await comparePassword(password, ADMIN_PASSWORD_HASH);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = generateToken({ email, role: 'admin' });
    res.json({ token });
  } catch (err) {
    console.error('POST /api/admin/login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── Admin: Listings CRUD ───────────────────────────────────────────────────
app.get('/api/admin/listings', requireAuth, async (req, res) => {
  try {
    const [active, archived, draft] = await Promise.all([
      getListings({ status: 'active' }),
      getListings({ status: 'archived' }),
      getListings({ status: 'draft' }),
    ]);
    res.json([...active, ...draft, ...archived]);
  } catch (err) {
    console.error('GET /api/admin/listings error:', err.message);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

app.post('/api/admin/listings', requireAuth, async (req, res) => {
  try {
    const listing = await createListing(req.body);
    res.status(201).json(listing);
  } catch (err) {
    console.error('POST /api/admin/listings error:', err.message);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

app.patch('/api/admin/listings/:id', requireAuth, async (req, res) => {
  try {
    const listing = await updateListing(req.params.id, req.body);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    res.json(listing);
  } catch (err) {
    console.error('PATCH /api/admin/listings/:id error:', err.message);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

app.delete('/api/admin/listings/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await deleteListing(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/admin/listings/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// ── Admin: Photos ──────────────────────────────────────────────────────────
app.post('/api/admin/listings/:id/photos', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'photo file is required' });
    const listingId = req.params.id;
    const isPrimary = req.body.isPrimary === 'true' || req.body.isPrimary === true;
    const { s3Key, url } = await uploadPhoto(listingId, req.file.buffer, req.file.mimetype);
    const photo = await addPhoto(listingId, { s3Key, url, isPrimary });
    res.status(201).json(photo);
  } catch (err) {
    console.error('POST /api/admin/listings/:id/photos error:', err.message);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

app.patch('/api/admin/listings/:id/photos/:photoId', requireAuth, async (req, res) => {
  try {
    if (!req.body.isPrimary) return res.status(400).json({ error: 'Only isPrimary update is supported' });
    const photo = await setPrimaryPhoto(req.params.id, req.params.photoId);
    if (!photo) return res.status(404).json({ error: 'Not found' });
    res.json(photo);
  } catch (err) {
    console.error('PATCH /api/admin/listings/:id/photos/:photoId error:', err.message);
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

app.delete('/api/admin/listings/:id/photos/:photoId', requireAuth, async (req, res) => {
  try {
    const deleted = await dbDeletePhoto(req.params.photoId);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    await s3DeletePhoto(deleted.s3Key);
    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/admin/listings/:id/photos/:photoId error:', err.message);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// ── Admin: Agents CRUD ────────────────────────────────────────────────────
app.get('/api/admin/agents', requireAuth, async (req, res) => {
  try {
    const agents = await getAgents();
    res.json(agents);
  } catch (err) {
    console.error('GET /api/admin/agents error:', err.message);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

app.post('/api/admin/agents', requireAuth, async (req, res) => {
  try {
    const { name, title, bio, photoUrl, yearsExperience, propertiesSold, activeMarkets } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const agent = await createAgent({ name, title, bio, photoUrl, yearsExperience, propertiesSold, activeMarkets });
    res.status(201).json(agent);
  } catch (err) {
    console.error('POST /api/admin/agents error:', err.message);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

app.patch('/api/admin/agents/:id', requireAuth, async (req, res) => {
  try {
    const { name, title, bio, photoUrl, yearsExperience, propertiesSold, activeMarkets, isPrimary } = req.body;
    const agent = await updateAgent(req.params.id, { name, title, bio, photoUrl, yearsExperience, propertiesSold, activeMarkets, isPrimary });
    if (!agent) return res.status(404).json({ error: 'Not found' });
    res.json(agent);
  } catch (err) {
    console.error('PATCH /api/admin/agents/:id error:', err.message);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

app.delete('/api/admin/agents/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await deleteAgent(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/admin/agents/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

// ── Admin: Testimonials CRUD ───────────────────────────────────────────────
app.get('/api/admin/testimonials', requireAuth, async (req, res) => {
  try {
    const testimonials = await getTestimonials();
    res.json(testimonials);
  } catch (err) {
    console.error('GET /api/admin/testimonials error:', err.message);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

app.post('/api/admin/testimonials', requireAuth, async (req, res) => {
  try {
    const { rating, text, name, contactType } = req.body;
    if (!rating || !text || !name) return res.status(400).json({ error: 'rating, text, and name are required' });
    const testimonial = await createTestimonial({ rating, text, name, contactType });
    res.status(201).json(testimonial);
  } catch (err) {
    console.error('POST /api/admin/testimonials error:', err.message);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

app.patch('/api/admin/testimonials/:id', requireAuth, async (req, res) => {
  try {
    const { rating, text, name, contactType } = req.body;
    const testimonial = await updateTestimonial(req.params.id, { rating, text, name, contactType });
    if (!testimonial) return res.status(404).json({ error: 'Not found' });
    res.json(testimonial);
  } catch (err) {
    console.error('PATCH /api/admin/testimonials/:id error:', err.message);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

app.delete('/api/admin/testimonials/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await deleteTestimonial(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/admin/testimonials/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// ── Admin: Market Updates CRUD ────────────────────────────────────────────────
app.get('/api/admin/market-updates', requireAuth, async (req, res) => {
  try {
    const updates = await getMarketUpdates();
    res.json(updates);
  } catch (err) {
    console.error('GET /api/admin/market-updates error:', err.message);
    res.status(500).json({ error: 'Failed to fetch market updates' });
  }
});

app.post('/api/admin/market-updates', requireAuth, async (req, res) => {
  try {
    const { sourceName, date, title, previewText, sourceUrl } = req.body;
    if (!sourceName || !date || !title) return res.status(400).json({ error: 'sourceName, date, and title are required' });
    const update = await createMarketUpdate({ sourceName, date, title, previewText, sourceUrl });
    res.status(201).json(update);
  } catch (err) {
    console.error('POST /api/admin/market-updates error:', err.message);
    res.status(500).json({ error: 'Failed to create market update' });
  }
});

app.patch('/api/admin/market-updates/:id', requireAuth, async (req, res) => {
  try {
    const { sourceName, date, title, previewText, sourceUrl } = req.body;
    const update = await updateMarketUpdate(req.params.id, { sourceName, date, title, previewText, sourceUrl });
    if (!update) return res.status(404).json({ error: 'Not found' });
    res.json(update);
  } catch (err) {
    console.error('PATCH /api/admin/market-updates/:id error:', err.message);
    res.status(500).json({ error: 'Failed to update market update' });
  }
});

app.delete('/api/admin/market-updates/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await deleteMarketUpdate(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/admin/market-updates/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete market update' });
  }
});

// ── Local dev server ───────────────────────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Angela API listening on port ${PORT}`));
}

// ── Lambda handler ─────────────────────────────────────────────────────────
const handler = serverless(app);
module.exports = { handler };
