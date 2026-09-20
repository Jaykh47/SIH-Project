const express = require('express');
const router = express.Router();
const {
  getRevenueData, getRegistrationData, getTaxData,
  getMunicipalityData, getPlanningData
} = require('../controllers/mockDeptController');

// Mock department endpoints — publicly accessible for demo
// In production these would require OAuth/API key to department systems
router.get('/revenue/:ulpin', getRevenueData);
router.get('/registration/:ulpin', getRegistrationData);
router.get('/tax/:ulpin', getTaxData);
router.get('/municipality/:ulpin', getMunicipalityData);
router.get('/planning/:ulpin', getPlanningData);

module.exports = router;
