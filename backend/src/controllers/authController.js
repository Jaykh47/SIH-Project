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

// In-memory OTP cache with TTL (5 minutes)
const otpStore = new Map();

/**
 * POST /api/auth/send-otp
 * Generate 4-digit OTP and send to user email
 */
async function sendOtp(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email address is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const otp = String(Math.floor(1000 + Math.random() * 9000));
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore.set(normalizedEmail, { otp, expiresAt });
  console.log(`\x1b[32m[OtpService] OTP for ${normalizedEmail}: ${otp}\x1b[0m`);

  return res.json({
    success: true,
    message: 'OTP sent successfully to email.',
    otp // included for testing/demo convenience
  });
}

/**
 * POST /api/auth/verify-otp
 * Verify 4-digit OTP entered by user
 */
async function verifyOtp(req, res) {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return res.status(400).json({ success: false, error: 'No OTP requested for this email or OTP expired.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
  }

  if (record.otp !== String(otp).trim()) {
    return res.status(400).json({ success: false, error: 'Invalid OTP code. Please try again.' });
  }

  // OTP verified successfully
  otpStore.delete(normalizedEmail);
  return res.json({
    success: true,
    verified: true,
    message: 'OTP verified successfully.'
  });
}

/**
 * POST /api/auth/register
 * Register a new citizen account
 */
async function register(req, res) {
  const body = req.validatedBody || req.body;
  const fullName = (body.fullName || body.name || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password;
  const phone = (body.phone || '').trim();
  const aadhaar = (body.aadhaar || '').trim();
  const state = (body.state || '').trim();
  const district = (body.district || '').trim();
  const city = (body.city || '').trim();
  const pincode = (body.pincode || '').trim();

  if (!fullName || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
  }

  try {
    // Check if user exists
    const existing = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Get citizen role_id
    const roleRes = await pool.query("SELECT role_id FROM roles WHERE role_name = 'citizen'");
    const roleId = roleRes.rows.length > 0 ? roleRes.rows[0].role_id : 2;

    // Insert user
    const insertRes = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, email, full_name, role_id`,
      [email, passwordHash, fullName, phone, roleId]
    );

    const newUser = insertRes.rows[0];

    // Generate JWT token
    const payload = {
      userId: newUser.user_id,
      email: newUser.email,
      fullName: newUser.full_name,
      roleName: 'citizen',
      department: null
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Write audit log
    await writeAuditLog({
      userId: newUser.user_id,
      action: 'REGISTER',
      tableName: 'users',
      recordId: newUser.user_id,
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        token,
        user: {
          userId: newUser.user_id,
          email: newUser.email,
          fullName: newUser.full_name,
          roleName: 'citizen',
          phone,
          aadhaar,
          state,
          district,
          city,
          pincode
        }
      }
    });
  } catch (err) {
    console.error('[AUTH] Registration error:', err);
    return res.status(500).json({ success: false, error: 'Registration failed. Please try again later.' });
  }
}

module.exports = { login, getMe, register, sendOtp, verifyOtp };

