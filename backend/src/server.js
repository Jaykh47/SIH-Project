// LANDSTACK Backend Server
// Node.js + Express.js REST API
// Connects to PostgreSQL + PostGIS database

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security Middleware ────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,   // Allow GeoJSON/map resources
  contentSecurityPolicy: false        // Handled by frontend separately
}));

// CORS — allow frontend origins including local dev and deployed cloud frontends
const configuredOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim().replace(/\/$/, ''))
  : ['http://localhost:5173'];

const allowedOrigins = [
  ...configuredOrigins,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, health checks)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com')
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true
}));

// Rate limiting — prevent abuse
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),  // 15 min
  max:      parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200'),   // requests per window
  message:  { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// ─── General Middleware ─────────────────────────────────────────
app.use(morgan('dev'));                 // Request logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ───────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const pool = require('./db/pool');
  try {
    await pool.query('SELECT 1');
    const postgisResult = await pool.query('SELECT PostGIS_Version()');
    return res.json({
      status: 'healthy',
      service: 'LANDSTACK Backend',
      version: '1.0.0',
      database: 'connected',
      postgis: postgisResult.rows[0].postgis_version,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(503).json({
      status: 'unhealthy',
      service: 'LANDSTACK Backend',
      database: 'error',
      error: err.message
    });
  }
});

// ─── API Routes ─────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/parcels',      require('./routes/parcels'));
app.use('/api/map',          require('./routes/parcels')); // /api/map alias for GIS clients
app.use('/api/alerts',       require('./routes/alerts'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/dashboard',    require('./routes/dashboard'));
app.use('/mock',             require('./routes/mock'));

// ─── 404 Handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`
  });
});

// ─── Global Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// ─── Start Server ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║          LANDSTACK BACKEND                ║');
  console.log('║  A Parcel-Centric Land Governance API     ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log(`[SERVER] Running on http://localhost:${PORT}`);
  console.log(`[SERVER] Health: http://localhost:${PORT}/health`);
  console.log(`[SERVER] Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
});

module.exports = app;
