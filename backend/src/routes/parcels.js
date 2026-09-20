const express = require('express');
const router = express.Router();
const {
  getAllParcels, searchParcels, getParcelByUlpin,
  getUnifiedParcelView, getNearbyParcels
} = require('../controllers/parcelController');
const { optionalAuth } = require('../middleware/auth');

// All parcel routes use optional auth (public data visible to all, sensitive requires role)
router.get('/', optionalAuth, getAllParcels);
router.get('/search', optionalAuth, searchParcels);
router.get('/:ulpin/unified', optionalAuth, getUnifiedParcelView);
router.get('/:ulpin/nearby', optionalAuth, getNearbyParcels);
router.get('/:ulpin', optionalAuth, getParcelByUlpin);

module.exports = router;
