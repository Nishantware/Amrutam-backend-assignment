const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 3000, ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: true } : undefined });
pool.on('error', (err) => console.error('Unexpected idle PostgreSQL client error', err));
module.exports = { pool, query: (...args) => pool.query(...args) };
