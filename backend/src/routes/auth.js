const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { validateBody, schemas } = require('../middleware/validate');

router.post('/login', validateBody(schemas.login), login);
router.get('/me', requireAuth, getMe);

module.exports = router;
