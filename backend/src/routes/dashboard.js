const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentActivity } = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

router.get('/stats', requireAuth, requirePermission('view:dashboard'), getDashboardStats);
router.get('/activity', requireAuth, requirePermission('view:dashboard'), getRecentActivity);

module.exports = router;
