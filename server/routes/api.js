const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middleware/authMiddleware');

// Controller Imports
const {
  registerUser,
  loginUser,
  getMe
} = require('../controllers/authController');

const {
  createOrder,
  getOrders,
  getOrderById,
  rescheduleOrder,
  getTrackingHistory,
  getQuote
} = require('../controllers/orderController');

const {
  createZone,
  getZones,
  createRateCard,
  getRateCards,
  updateRateCard,
  deleteRateCard,
  getAgents,
  assignAgent,
  triggerAutoAssign,
  overrideOrderStatus
} = require('../controllers/adminController');

const {
  getAssignedOrders,
  toggleAvailability,
  updateOrderStatus
} = require('../controllers/agentController');

// ==========================================
// 1. Authentication Routes
// ==========================================
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.get('/auth/me', protect, getMe);

// ==========================================
// 2. Order Routes
// ==========================================
router.post('/orders', protect, createOrder);
router.post('/orders/calculate-quote', getQuote);
router.get('/orders', protect, getOrders);
router.get('/orders/:id', protect, getOrderById);
router.put('/orders/:id/reschedule', protect, rescheduleOrder);

// ==========================================
// 3. Tracking Routes
// ==========================================
router.get('/tracking/:orderId', protect, getTrackingHistory);

// ==========================================
// 4. Admin Management Routes
// ==========================================
router.post('/admin/zones', protect, restrictTo('admin'), createZone);
router.get('/admin/zones', protect, restrictTo('admin'), getZones);

router.post('/admin/ratecards', protect, restrictTo('admin'), createRateCard);
router.get('/admin/ratecards', protect, restrictTo('admin'), getRateCards);
router.put('/admin/ratecards/:id', protect, restrictTo('admin'), updateRateCard);
router.delete('/admin/ratecards/:id', protect, restrictTo('admin'), deleteRateCard);

router.get('/admin/agents', protect, restrictTo('admin'), getAgents);
router.post('/admin/assign', protect, restrictTo('admin'), assignAgent);
router.post('/admin/assign/auto/:orderId', protect, restrictTo('admin'), triggerAutoAssign);
router.put('/admin/orders/:id/override', protect, restrictTo('admin'), overrideOrderStatus);

// ==========================================
// 5. Agent Duty Routes
// ==========================================
router.get('/agent/orders', protect, restrictTo('agent'), getAssignedOrders);
router.put('/agent/availability', protect, restrictTo('agent'), toggleAvailability);
router.put('/agent/orders/:id/status', protect, restrictTo('agent'), updateOrderStatus);

module.exports = router;
