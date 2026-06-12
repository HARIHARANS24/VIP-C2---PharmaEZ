const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllUsers, toggleUserStatus,
  getPrescriptions, updatePrescriptionStatus,
  getAdminConfig, updateAdminConfig,
  getInventoryReport,
} = require('../controllers/adminController');

router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/toggle', protect, adminOnly, toggleUserStatus);
router.get('/prescriptions', protect, adminOnly, getPrescriptions);
router.put('/prescriptions/:userId/:prescriptionId', protect, adminOnly, updatePrescriptionStatus);
router.get('/config', getAdminConfig);
router.put('/config', protect, adminOnly, updateAdminConfig);
router.get('/inventory', protect, adminOnly, getInventoryReport);

module.exports = router;
