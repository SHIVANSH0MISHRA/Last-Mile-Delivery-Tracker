const Order = require('../models/Order');
const TrackingHistory = require('../models/TrackingHistory');
const User = require('../models/User');
const { calculatePrice } = require('../services/pricingEngine');
const { sendOrderNotification } = require('../services/notificationService');
const { autoAssignOrder } = require('./adminController');

/**
 * Place delivery order
 * Route: POST /api/orders
 */
const createOrder = async (req, res) => {
  try {
    const {
      pickupAddress,
      dropAddress,
      packageDetails,
      paymentMethod,
      customerType
    } = req.body;

    if (!pickupAddress || !dropAddress || !packageDetails || !paymentMethod || !customerType) {
      return res.status(400).json({ success: false, message: 'Please provide all order details' });
    }

    const { street: pStreet, city: pCity, pincode: pPincode } = pickupAddress;
    const { street: dStreet, city: dCity, pincode: dPincode } = dropAddress;
    const { length, breadth, height, weight } = packageDetails;

    if (!pStreet || !pCity || !pPincode || !dStreet || !dCity || !dPincode || !length || !breadth || !height || !weight) {
      return res.status(400).json({ success: false, message: 'Please provide complete address and package details' });
    }

    // 1. Calculate pricing
    let pricingResult;
    try {
      pricingResult = await calculatePrice({
        pickupPincode: pPincode,
        dropPincode: dPincode,
        length,
        breadth,
        height,
        weight,
        customerType,
        paymentMethod
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    // 2. Generate unique tracking number (order number)
    const timestampStr = Date.now().toString().slice(-6);
    const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const orderNumber = `LMD-${datePrefix}-${timestampStr}`;

    // 3. Create order
    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      pickupAddress: {
        street: pStreet,
        city: pCity,
        pincode: pPincode,
        zone: pricingResult.pickupZone
      },
      dropAddress: {
        street: dStreet,
        city: dCity,
        pincode: dPincode,
        zone: pricingResult.dropZone
      },
      packageDetails: {
        length,
        breadth,
        height,
        weight
      },
      pricingDetails: {
        billableWeight: pricingResult.billableWeight,
        baseRate: pricingResult.baseRate,
        incrementalRate: pricingResult.incrementalRate,
        codCharge: pricingResult.codCharge,
        totalRate: pricingResult.totalRate
      },
      paymentMethod,
      customerType,
      status: 'Created'
    });

    // 4. Log initial tracking milestone
    await TrackingHistory.create({
      order: order._id,
      status: 'Created',
      updatedBy: req.user._id,
      remarks: 'Order submitted by customer. Awaiting agent assignment.'
    });

    // Notify customer
    await sendOrderNotification(order, 'Created', req.user.email, 'Awaiting agent assignment.');

    // 5. Attempt auto-assignment immediately
    console.log(`🤖 Attempting auto-assignment for order: ${order.orderNumber}...`);
    const assignResult = await autoAssignOrder(order, req.user._id);
    if (assignResult.success) {
      console.log(`🤖 Order ${order.orderNumber} successfully auto-assigned to ${assignResult.agent.name}`);
    } else {
      console.log(`⚠️ Auto-assignment deferred: ${assignResult.message}`);
    }

    // Reload order with assigned agent details if any
    const finalOrder = await Order.findById(order._id).populate('assignedAgent');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: finalOrder
    });
  } catch (error) {
    console.error('Create Order Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * List orders (All for Admin, User-specific for Customer)
 * Route: GET /api/orders
 */
const getOrders = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'agent') {
      query.assignedAgent = req.user._id;
    }

    const orders = await Order.find(query)
      .populate('customer')
      .populate('assignedAgent');

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get detailed order by ID
 * Route: GET /api/orders/:id
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer')
      .populate('assignedAgent');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Role safety checks
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
    }
    if (req.user.role === 'agent' && order.assignedAgent && order.assignedAgent._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Reschedule failed delivery order
 * Route: PUT /api/orders/:id/reschedule
 */
const rescheduleOrder = async (req, res) => {
  try {
    const { rescheduleDate } = req.body;
    if (!rescheduleDate) {
      return res.status(400).json({ success: false, message: 'Please provide a reschedule date.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check permissions
    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to reschedule this order.' });
    }

    // Must be in Failed status to reschedule
    if (order.status !== 'Failed') {
      return res.status(400).json({ success: false, message: `Only orders in 'Failed' status can be rescheduled. Current status: ${order.status}` });
    }

    // Increment attempt count
    const attemptCount = (order.rescheduledDetails ? order.rescheduledDetails.attemptCount || 0 : 0) + 1;

    // Reset status to Rescheduled, wipe out past agent to allow fresh queue matching
    order.status = 'Rescheduled';
    order.assignedAgent = null;
    order.rescheduledDetails = {
      originalOrderId: order._id,
      rescheduleDate: new Date(rescheduleDate),
      attemptCount
    };
    await order.save();

    // Log history
    const dateFormatted = new Date(rescheduleDate).toLocaleDateString();
    await TrackingHistory.create({
      order: order._id,
      status: 'Rescheduled',
      updatedBy: req.user._id,
      remarks: `Rescheduled for delivery attempt #${attemptCount} on ${dateFormatted}`
    });

    // Notify customer
    await sendOrderNotification(order, 'Rescheduled', req.user.email, `Rescheduled for ${dateFormatted}`);

    // Re-trigger auto-assignment
    console.log(`🤖 Re-triggering auto-assignment for rescheduled order: ${order.orderNumber}...`);
    const assignResult = await autoAssignOrder(order, req.user._id);
    if (assignResult.success) {
      console.log(`🤖 Rescheduled order ${order.orderNumber} auto-assigned to ${assignResult.agent.name}`);
    } else {
      console.log(`⚠️ Auto-assignment deferred: ${assignResult.message}`);
    }

    const finalOrder = await Order.findById(order._id).populate('assignedAgent');

    res.status(200).json({
      success: true,
      message: 'Order rescheduled successfully',
      data: finalOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get tracking history for an order
 * Route: GET /api/tracking/:orderId
 */
const getTrackingHistory = async (req, res) => {
  try {
    const history = await TrackingHistory.find({ order: req.params.orderId })
      .populate('updatedBy')
      .exec();
    
    // Sort tracking items by timestamp ascending
    const sortedHistory = history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.status(200).json({ success: true, data: sortedHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Dynamic pricing calculation helper endpoint
 * Route: POST /api/orders/calculate-quote
 */
const getQuote = async (req, res) => {
  try {
    const { pickupPincode, dropPincode, length, breadth, height, weight, customerType, paymentMethod } = req.body;
    
    if (!pickupPincode || !dropPincode || !length || !breadth || !height || !weight || !customerType || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Please provide all details for calculation.' });
    }

    const result = await calculatePrice({
      pickupPincode,
      dropPincode,
      length: parseFloat(length),
      breadth: parseFloat(breadth),
      height: parseFloat(height),
      weight: parseFloat(weight),
      customerType,
      paymentMethod
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  rescheduleOrder,
  getTrackingHistory,
  getQuote
};
