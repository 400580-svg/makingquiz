const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Apply schema.sql idempotently at startup (safe CREATE IF NOT EXISTS only).
async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
}

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, initDb, query };
