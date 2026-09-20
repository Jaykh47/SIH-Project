// Database connection pool
// Uses node-postgres (pg) with a connection pool for efficiency
// PostGIS queries are executed as standard SQL through this pool

const { Pool } = require('pg');

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME     || 'landstack',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      // Pool settings
      max:                    10,
      idleTimeoutMillis:      30000,
      connectionTimeoutMillis: 10000,  // 10 seconds — enough for local DB
    };

const pool = new Pool(poolConfig);

// Test connection on startup (async, non-blocking)
setTimeout(async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT PostGIS_Version()');
    client.release();
    const ver = result.rows[0].postgis_version.split(' ')[0];
    console.log('[DB] Connected — PostgreSQL + PostGIS', ver);
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    console.error('[DB] Check DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD in .env');
  }
}, 500);

module.exports = pool;
