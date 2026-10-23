// NFL Quiz Central — Phase 1: Foundation & Authentication (registration)
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const { initDb, query } = require('./db');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.static('public'));

// ---------- Admin cold-start bootstrap (production path) ----------
async function bootstrapAdminAccount() {
  const { rows } = await query(
    "SELECT COUNT(*)::int AS n FROM users WHERE role = 'admin' AND verification_status = 'verified'"
  );
  if (rows[0].n > 0) return;
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const username = process.env.ADMIN_BOOTSTRAP_USERNAME;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !username || !password) return; // QA seeds via seed.sql instead
  const hash = await bcrypt.hash(password, 10);
  await query(
    `INSERT INTO users (username, email, password_hash, role, verification_status, verified_at)
     VALUES ($1, $2, $3, 'admin', 'verified', NOW())
     ON CONFLICT (email) DO NOTHING`,
    [username, email, hash]
  );
  console.log('[bootstrap] Admin account provisioned from env secrets.');
}

// ---------- Validation helpers ----------
const USERNAME_RE = /^[A-Za-z0-9_]{3,50}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateRegistration({ username, email, password }) {
  const errors = [];
  if (!USERNAME_RE.test(username || '')) {
    errors.push('Username must be 3-50 characters (letters, numbers, underscores).');
  }
  if (!EMAIL_RE.test(email || '') || email.length > 100) {
    errors.push('Please enter a valid email address (max 100 characters).');
  }
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters.');
  }
  return errors;
}

// ---------- POST /api/auth/register ----------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, educator_key } = req.body || {};
    const errors = validateRegistration({ username, email, password });
    if (errors.length) return res.status(400).json({ errors });

    const passwordHash = await bcrypt.hash(password, 10);

    // Educator key path: valid key -> teacher/verified; no key -> player.
    let role = 'player';
    let requested_role = null;
    let verification_status = 'unverified';
    if (educator_key && educator_key.trim()) {
      const key = await query(
        `SELECT id FROM educator_keys
         WHERE key_code = $1 AND is_active = TRUE
           AND (expires_at IS NULL OR expires_at > NOW())
           AND times_used < max_uses
         FOR UPDATE`,
        [educator_key.trim()]
      );
      if (key.rows.length === 0) {
        return res.status(400).json({ errors: ['Invalid or expired educator access key.'] });
      }
      role = 'teacher';
      verification_status = 'verified';
      const kid = key.rows[0].id;
      await query('UPDATE educator_keys SET times_used = times_used + 1 WHERE id = $1', [kid]);
    }

    const result = await query(
      `INSERT INTO users (username, email, password_hash, role, requested_role, verification_status, verified_at)
       VALUES ($1, $2, $3, $4, $5, $6, CASE WHEN $6 = 'verified' THEN NOW() ELSE NULL END)
       RETURNING id, username, role`,
      [username.trim(), email.trim().toLowerCase(), passwordHash, role, requested_role, verification_status]
    );
    const user = result.rows[0];
    // 201: no password material in response.
    res.status(201).json({
      message: 'Registration successful. You can now log in.',
      username: user.username,
      role: user.role
    });
  } catch (err) {
    if (err.code === '23505') {
      const field = err.constraint && err.constraint.includes('username') ? 'username' : 'email';
      return res.status(409).json({ errors: [field === 'username' ? 'That username is already taken.' : 'An account with that email already exists.'] });
    }
    console.error('[register] unexpected error:', err.message);
    res.status(500).json({ errors: ['Registration failed. Please try again.'] });
  }
});

// ---------- Health ----------
app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', db: 'unavailable' });
  }
});

(async () => {
  await initDb();
  await bootstrapAdminAccount();
  app.listen(PORT, '0.0.0.0', () => console.log(`NFL Quiz Central listening on port ${PORT}`));
})().catch((err) => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});
