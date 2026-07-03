const User = require('../models/User');
const Order = require('../models/Order');
const TrackingHistory = require('../models/TrackingHistory');
const { sendOrderNotification } = require('../services/notificationService');

/**
 * Get assigned orders for current agent
 * Route: GET /api/agent/orders
 */
const getAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ assignedAgent: req.user._id })
      .populate('customer');
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Toggle agent duty status (Availability)
 * Route: PUT /api/agent/availability
 */
const toggleAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    if (typeof availability !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Availability flag must be a boolean' });
    }

    const agent = await User.findById(req.user._id);
    agent.availability = availability;
    await agent.save();

    res.status(200).json({
      success: true,
      message: `Duty status updated: Agent is now ${availability ? 'Online' : 'Offline'}`,
      data: { availability: agent.availability }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update order status
 * Route: PUT /api/agent/orders/:id/status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const orderId = req.params.id;

    const allowedStatuses = ['Picked Up', 'In Transit', 'Out For Delivery', 'Delivered', 'Failed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition. Agents can only transition to: ${allowedStatuses.join(', ')}`
      });
    }

    if (status === 'Failed' && (!remarks || remarks.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'A remark explaining the delivery failure is mandatory.'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify agent is the one assigned
    if (order.assignedAgent && order.assignedAgent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this order.' });
    }

    // Update status
    order.status = status;
    await order.save();

    // Log tracking milestone
    await TrackingHistory.create({
      order: order._id,
      status: status,
      updatedBy: req.user._id,
      remarks: remarks || `Order status updated to ${status} by delivery agent.`
    });

    // Notify customer
    const customer = await User.findById(order.customer);
    if (customer) {
      await sendOrderNotification(order, status, customer.email, remarks);
    }

    res.status(200).json({
      success: true,
      message: `Order status successfully transitioned to: ${status}`,
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAssignedOrders,
  toggleAvailability,
  updateOrderStatus
};
