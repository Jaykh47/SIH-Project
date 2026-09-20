const express = require('express');
const router = express.Router();
const {
  submitApplication, getMyApplications, getApplicationById,
  getAllApplications, updateApplicationStatus
} = require('../controllers/applicationsController');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { validateBody, schemas } = require('../middleware/validate');

// Citizen routes
router.post('/', requireAuth, requirePermission('submit:applications'), validateBody(schemas.applicationSubmit), submitApplication);
router.get('/my', requireAuth, getMyApplications);

// Officer/Admin routes
router.get('/', requireAuth, requirePermission('process:applications'), getAllApplications);
router.patch('/:id/status', requireAuth, requirePermission('process:applications'), updateApplicationStatus);

// Shared — auth required, authorization checked inside controller
router.get('/:id', requireAuth, getApplicationById);

module.exports = router;
