// NFL Quiz Central — Phase 1 (auth) + Phase 2 (quiz engine) + Phase 3 (attempts & history)
require('dotenv').config();
const path = require('path');
const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { initDb, query } = require('./db');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'qa-only-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 2 * 60 * 60 * 1000
  }
}));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Admin cold-start bootstrap (production path) ----------
async function bootstrapAdminAccount() {
  const { rows } = await query(
    "SELECT COUNT(*)::int AS n FROM users WHERE role = 'admin' AND verification_status = 'verified'"
  );
  if (rows[0].n > 0) return;
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const username = process.env.ADMIN_BOOTSTRAP_USERNAME;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !username || !password) return;
  const hash = await bcrypt.hash(password, 10);
  await query(
    `INSERT INTO users (username, email, password_hash, role, verification_status, verified_at)
     VALUES ($1, $2, $3, 'admin', 'verified', NOW())
     ON CONFLICT (email) DO NOTHING`,
    [username, email, hash]
  );
  console.log('[bootstrap] Admin account provisioned from env secrets.');
}

// ---------- Access-control middleware ----------
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ errors: ['You must be logged in to do that.'] });
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ errors: ['You must be logged in to do that.'] });
    }
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ errors: ['You do not have permission to do that.'] });
    }
    next();
  };
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

// ===================== AUTH ROUTES (Phase 1) =====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, educator_key } = req.body || {};
    const errors = validateRegistration({ username, email, password });
    if (errors.length) return res.status(400).json({ errors });

    const passwordHash = await bcrypt.hash(password, 10);

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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) {
      return res.status(400).json({ errors: ['Enter your email/username and password.'] });
    }
    const result = await query(
      'SELECT id, username, email, password_hash, role, verification_status FROM users WHERE email = $1 OR username = $1',
      [identifier.trim().toLowerCase()]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ errors: ['Invalid email/username or password.'] });
    }
    req.session.user = { id: user.id, username: user.username, role: user.role };
    req.session.save(() => {
      res.json({ username: user.username, role: user.role });
    });
  } catch (err) {
    console.error('[login] unexpected error:', err.message);
    res.status(500).json({ errors: ['Login failed. Please try again.'] });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out.' });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ errors: ['Not logged in.'] });
  const { id, username, role } = req.session.user;
  res.json({ id, username, role });
});

app.get('/api/admin/stats', requireRole('admin', 'teacher'), async (_req, res) => {
  try {
    const { rows } = await query(
      "SELECT role, COUNT(*)::int AS count FROM users GROUP BY role ORDER BY role"
    );
    res.json({ users_by_role: rows });
  } catch (err) {
    console.error('[admin stats] error:', err.message);
    res.status(500).json({ errors: ['Could not load stats.'] });
  }
});

// ===================== QUIZ ROUTES (Phase 2) =====================

// Quiz selection list
app.get('/api/quizzes', requireAuth, async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT q.id, q.title, q.category, q.description,
              COUNT(DISTINCT qs.id)::int AS question_count
       FROM quizzes q
       JOIN questions qs ON qs.quiz_id = q.id AND qs.is_active = TRUE
       WHERE q.is_public = TRUE
       GROUP BY q.id
       ORDER BY q.created_at`
    );
    res.json({ quizzes: rows });
  } catch (err) {
    console.error('[quizzes] error:', err.message);
    res.status(500).json({ errors: ['Could not load quizzes.'] });
  }
});

// Quiz detail: questions with options; is_correct is NEVER sent to the client
app.get('/api/quizzes/:id', requireAuth, async (req, res) => {
  try {
    const quiz = await query(
      'SELECT id, title, category, description FROM quizzes WHERE id = $1 AND is_public = TRUE',
      [req.params.id]
    );
    if (quiz.rows.length === 0) return res.status(404).json({ errors: ['Quiz not found.'] });

    const questions = await query(
      `SELECT qs.id, qs.question_text
       FROM questions qs
       WHERE qs.quiz_id = $1 AND qs.is_active = TRUE
       ORDER BY qs.created_at`,
      [req.params.id]
    );
    const options = await query(
      `SELECT o.id, o.question_id, o.option_text
       FROM options o
       JOIN questions qs ON qs.id = o.question_id
       WHERE qs.quiz_id = $1
       ORDER BY qs.created_at, o.created_at`,
      [req.params.id]
    );

    const byQuestion = {};
    for (const o of options.rows) {
      (byQuestion[o.question_id] = byQuestion[o.question_id] || []).push({ id: o.id, text: o.option_text });
    }
    // Shuffle each question's options so the correct answer position is
    // unpredictable. Seed data inserts the correct option FIRST, so without
    // this the first choice would always be the right answer.
    for (const qid of Object.keys(byQuestion)) {
      const arr = byQuestion[qid];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    res.json({
      quiz: quiz.rows[0],
      questions: questions.rows.map(q => ({
        id: q.id,
        question_text: q.question_text,
        options: byQuestion[q.id] || []
      }))
    });
  } catch (err) {
    console.error('[quiz detail] error:', err.message);
    res.status(500).json({ errors: ['Could not load this quiz.'] });
  }
});

// Submit answers: graded server-side. Unanswered or invalid selections count as incorrect.
// Phase 3: every completed (submitted) attempt is saved to quiz_attempts.
app.post('/api/quizzes/:id/submit', requireAuth, async (req, res) => {
  try {
    const quiz = await query(
      'SELECT id FROM quizzes WHERE id = $1 AND is_public = TRUE',
      [req.params.id]
    );
    if (quiz.rows.length === 0) {
      return res.status(404).json({ errors: ['Quiz not found.'] });
    }

    const answers = (req.body && req.body.answers) || {};
    const questions = await query(
      `SELECT qs.id, qs.question_text, qs.is_active
       FROM questions qs
       WHERE qs.quiz_id = $1 AND qs.is_active = TRUE`,
      [req.params.id]
    );
    if (questions.rows.length === 0) {
      return res.status(404).json({ errors: ['Quiz not found or has no questions.'] });
    }

    const opts = await query(
      `SELECT o.id, o.question_id, o.option_text, o.is_correct
       FROM options o
       JOIN questions qs ON qs.id = o.question_id
       WHERE qs.quiz_id = $1 AND qs.is_active = TRUE`,
      [req.params.id]
    );
    const optByQ = {};
    for (const o of opts.rows) {
      (optByQ[o.question_id] = optByQ[o.question_id] || []).push(o);
    }

    let score = 0;
    const total = questions.rows.length;
    const details = [];
    for (const q of questions.rows) {
      const qOptions = optByQ[q.id] || [];
      const selectedId = answers[q.id];
      const selected = qOptions.find(o => o.id === selectedId);
      const correct = !!(selected && selected.is_correct);
      if (correct) score += 1;
      details.push({
        question_id: q.id,
        question_text: q.question_text,
        selected_option_id: selected ? selected.id : null,
        selected_text: selected ? selected.option_text : null,
        correct_text: (qOptions.find(o => o.is_correct) || {}).option_text || null,
        is_correct: correct
      });
    }

    const percentage = Math.round((score / total) * 1000) / 10;

    // Phase 3: save this COMPLETED attempt (user, quiz, score, count, time).
    // Unfinished attempts (page closed, never submitted) never reach this
    // code, so they never count as completions.
    const attempt = await query(
      `INSERT INTO quiz_attempts (user_id, quiz_id, score, total_questions, status, completed_at)
       VALUES ($1, $2, $3, $4, 'completed', NOW())
       RETURNING id`,
      [req.session.user.id, req.params.id, score, total]
    );

    res.json({
      score,
      total_questions: total,
      percentage,
      attempt_id: attempt.rows[0].id,
      details
    });
  } catch (err) {
    console.error('[submit] error:', err.message);
    res.status(500).json({ errors: ['Could not grade this attempt.'] });
  }
});

// ===================== HISTORY ROUTES (Phase 3) =====================

// Personal attempt history: ONLY the logged-in player's completed attempts.
app.get('/api/history', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT qa.id, qa.score, qa.total_questions, qa.status, qa.completed_at,
              q.title AS quiz_title, q.category AS quiz_category
       FROM quiz_attempts qa
       JOIN quizzes q ON q.id = qa.quiz_id
       WHERE qa.user_id = $1 AND qa.status = 'completed'
       ORDER BY qa.completed_at DESC`,
      [req.session.user.id]
    );
    res.json({ attempts: rows.map(r => ({
      id: r.id,
      quiz_title: r.quiz_title,
      quiz_category: r.quiz_category,
      score: r.score,
      total_questions: r.total_questions,
      percentage: r.total_questions ? Math.round((r.score / r.total_questions) * 1000) / 10 : 0,
      completed_at: r.completed_at
    })) });
  } catch (err) {
    console.error('[history] error:', err.message);
    res.status(500).json({ errors: ['Could not load your history.'] });
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
