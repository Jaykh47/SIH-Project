// JWT authentication middleware
// Verifies JWT token from Authorization header
// Attaches user data to req.user for downstream use

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'landstack-dev-secret-change-in-production';

/**
 * Middleware: require authenticated user
 * Rejects requests without a valid JWT token
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Provide Bearer token in Authorization header.'
    });
  }

  const token = authHeader.slice(7); // Remove 'Bearer '
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, email, role, roleName }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }
}

/**
 * Middleware: optional authentication
 * Attaches user if token present, continues even if not
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.slice(7), JWT_SECRET);
    } catch (err) {
      // Invalid token — continue as unauthenticated
      req.user = null;
    }
  }
  next();
}

module.exports = { requireAuth, optionalAuth, JWT_SECRET };
