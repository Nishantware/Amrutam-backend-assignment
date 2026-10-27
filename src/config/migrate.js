require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('./db');
(async () => { try { const sql = fs.readFileSync(path.join(__dirname, '../../db/schema.sql'), 'utf8'); await pool.query(sql); console.log('Database schema applied'); } catch (e) { console.error(e); process.exitCode = 1; } finally { await pool.end(); } })();
