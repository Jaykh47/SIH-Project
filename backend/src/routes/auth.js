const express = require('express');
const router = express.Router();
const { login, getMe, register, sendOtp, verifyOtp } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { validateBody, schemas } = require('../middleware/validate');

router.post('/login', validateBody(schemas.login), login);
router.post('/register', validateBody(schemas.register), register);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', requireAuth, getMe);

module.exports = router;

