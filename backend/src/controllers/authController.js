// Authentication controller
// Handles login, registration, and token refresh

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { JWT_SECRET } = require('../middleware/auth');
const { writeAuditLog } = require('../middleware/audit');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
async function login(req, res) {
  const { email, password } = req.validatedBody;

  try {
    // Fetch user with role name
    const { rows } = await pool.query(
      `SELECT u.user_id, u.email, u.password_hash, u.full_name, u.department,
              u.is_active, r.role_name
       FROM users u
       JOIN roles r ON r.role_id = u.role_id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Account is deactivated. Contact administrator.' });
    }

    // For demo users with placeholder hashes, use demo password check
    let passwordValid = false;
    if (user.password_hash === 'PLACEHOLDER_HASH_RESET_ON_FIRST_RUN') {
      // Demo mode: accept role-based demo passwords
      const demoPasswords = {
        admin:                'Admin@123',
        revenue_officer:      'Officer@123',
        registration_officer: 'Officer@123',
        municipality_officer: 'Officer@123',
        survey_officer:       'Officer@123',
        citizen:              'Citizen@123'
      };
      passwordValid = (password === demoPasswords[user.role_name]);
    } else {
      passwordValid = await bcrypt.compare(password, user.password_hash);
    }

    if (!passwordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // Generate JWT
    const payload = {
      userId:   user.user_id,
      email:    user.email,
      fullName: user.full_name,
      roleName: user.role_name,
      department: user.department
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Update last login
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE user_id = $1',
      [user.user_id]
    );

    // Audit log
    await writeAuditLog({
      userId: user.user_id,
      action: 'LOGIN',
      tableName: 'users',
      recordId: user.user_id,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      data: {
        token,
        user: {
          userId:    user.user_id,
          email:     user.email,
          fullName:  user.full_name,
          roleName:  user.role_name,
          department: user.department
        }
      }
    });

  } catch (err) {
    console.error('[AUTH] Login error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
}

/**
 * GET /api/auth/me
 * Return current authenticated user info
 */
async function getMe(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT u.user_id, u.email, u.full_name, u.phone, u.department, u.employee_id,
              u.last_login_at, r.role_name
       FROM users u
       JOIN roles r ON r.role_id = u.role_id
       WHERE u.user_id = $1`,
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[AUTH] getMe error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
}

module.exports = { login, getMe };
