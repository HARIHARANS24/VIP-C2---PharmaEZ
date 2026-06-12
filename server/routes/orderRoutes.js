const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  placeOrder, getMyOrders, getOrderById, cancelOrder,
  getAllOrders, updateOrderStatus, getDashboardStats,
} = require('../controllers/orderController');

// User routes
router.post('/', protect, placeOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/admin/stats', protect, adminOnly, getDashboardStats);
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.put('/admin/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
