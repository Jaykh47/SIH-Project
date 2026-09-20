const express = require('express');
const router = express.Router();
const {
  getAiAlerts, getQualityAlerts, verifyAiAlert, resolveQualityAlert, getAlertSummary
} = require('../controllers/alertsController');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { validateBody, schemas } = require('../middleware/validate');

router.get('/summary', requireAuth, requirePermission('view:dashboard'), getAlertSummary);
router.get('/ai', requireAuth, requirePermission('view:sensitive'), getAiAlerts);
router.get('/quality', requireAuth, requirePermission('view:sensitive'), getQualityAlerts);
router.patch('/ai/:alertId/verify', requireAuth, requirePermission('verify:alerts'), validateBody(schemas.alertVerify), verifyAiAlert);
router.patch('/quality/:alertId/resolve', requireAuth, requirePermission('verify:alerts'), validateBody(schemas.alertVerify), resolveQualityAlert);

module.exports = router;
