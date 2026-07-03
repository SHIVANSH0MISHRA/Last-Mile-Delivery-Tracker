const User = require('../models/User');
const Zone = require('../models/Zone');
const RateCard = require('../models/RateCard');
const Order = require('../models/Order');
const TrackingHistory = require('../models/TrackingHistory');
const { sendOrderNotification } = require('../services/notificationService');

/**
 * Helper to auto-assign an order
 */
async function autoAssignOrder(order, triggerId) {
  const pickupZone = order.pickupAddress.zone;
  if (!pickupZone) return { success: false, message: 'Order pickup zone is missing' };

  // Find active and available agents in pickup zone
  const agents = await User.find({
    role: 'agent',
    status: 'active',
    availability: true,
    currentZone: pickupZone
  });

  if (agents.length === 0) {
    return { success: false, message: `No available agents found in ${pickupZone}` };
  }

  // Select first available agent (GPS distance can be calculated if agent coordinates are present, 
  // but as GPS API is a future enhancement, selecting the first matching agent is standard)
  const chosenAgent = agents[0];

  // Assign agent and advance status
  order.assignedAgent = chosenAgent._id;
  order.status = 'Assigned';
  await order.save();

  // Create immutable tracking history
  await TrackingHistory.create({
    order: order._id,
    status: 'Assigned',
    updatedBy: triggerId,
    remarks: `System auto-assigned order to agent: ${chosenAgent.name}`
  });

  // Notify customer
  const customer = await User.findById(order.customer);
  if (customer) {
    await sendOrderNotification(order, 'Assigned', customer.email, `Assigned to Agent: ${chosenAgent.name}`);
  }

  return { success: true, agent: chosenAgent };
}

/**
 * Manage Zones
 */
const createZone = async (req, res) => {
  try {
    const { name, pincodes } = req.body;
    if (!name || !Array.isArray(pincodes)) {
      return res.status(400).json({ success: false, message: 'Please provide zone name and array of pincodes' });
    }

    const existingZone = await Zone.findOne({ name });
    if (existingZone) {
      return res.status(400).json({ success: false, message: 'Zone name already exists' });
    }

    const zone = await Zone.create({ name, pincodes });
    res.status(201).json({ success: true, data: zone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getZones = async (req, res) => {
  try {
    const zones = await Zone.find({});
    res.status(200).json({ success: true, data: zones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Manage Rate Cards
 */
const createRateCard = async (req, res) => {
  try {
    const { pickupZone, dropZone, customerType, paymentMethod, baseWeightLimit, baseRate, perKgIncrementalRate, extraCharge } = req.body;
    
    // Check if configuration already exists
    const duplicate = await RateCard.findOne({ pickupZone, dropZone, customerType, paymentMethod });
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'A rate card with this combination already exists' });
    }

    const rateCard = await RateCard.create({
      pickupZone,
      dropZone,
      customerType,
      paymentMethod,
      baseWeightLimit,
      baseRate,
      perKgIncrementalRate,
      extraCharge: extraCharge || 0
    });
    res.status(201).json({ success: true, data: rateCard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRateCards = async (req, res) => {
  try {
    const rateCards = await RateCard.find({});
    res.status(200).json({ success: true, data: rateCards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateRateCard = async (req, res) => {
  try {
    const rateCard = await RateCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rateCard) {
      return res.status(404).json({ success: false, message: 'Rate Card not found' });
    }
    res.status(200).json({ success: true, data: rateCard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteRateCard = async (req, res) => {
  try {
    const rateCard = await RateCard.findById(req.params.id);
    if (!rateCard) {
      return res.status(404).json({ success: false, message: 'Rate Card not found' });
    }
    await RateCard.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: 'Rate Card removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Manage Agents
 */
const getAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' });
    res.status(200).json({ success: true, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Assign Agent manually
 */
const assignAgent = async (req, res) => {
  try {
    const { orderId, agentId } = req.body;
    if (!orderId || !agentId) {
      return res.status(400).json({ success: false, message: 'Please provide orderId and agentId' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      return res.status(400).json({ success: false, message: 'Invalid delivery agent' });
    }

    order.assignedAgent = agent._id;
    order.status = 'Assigned';
    await order.save();

    // Create tracking milestone
    await TrackingHistory.create({
      order: order._id,
      status: 'Assigned',
      updatedBy: req.user._id,
      remarks: `Manually assigned to agent: ${agent.name} by administrator`
    });

    // Send notification
    const customer = await User.findById(order.customer);
    if (customer) {
      await sendOrderNotification(order, 'Assigned', customer.email, `Assigned to Agent: ${agent.name}`);
    }

    res.status(200).json({ success: true, message: `Order successfully assigned to ${agent.name}`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Trigger Auto-Assignment API
 */
const triggerAutoAssign = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const result = await autoAssignOrder(order, req.user._id);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    res.status(200).json({ success: true, message: `Successfully auto-assigned to ${result.agent.name}`, agent: result.agent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin status override
 */
const overrideOrderStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Please provide status for override' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const originalStatus = order.status;
    order.status = status;
    await order.save();

    // Create tracking milestone
    await TrackingHistory.create({
      order: order._id,
      status: status,
      updatedBy: req.user._id,
      remarks: `Status overrode from '${originalStatus}' to '${status}' by Admin. Remarks: ${remarks || 'None'}`
    });

    // Send notification
    const customer = await User.findById(order.customer);
    if (customer) {
      await sendOrderNotification(order, status, customer.email, remarks);
    }

    res.status(200).json({ success: true, message: `Order status overridden to ${status}`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createZone,
  getZones,
  createRateCard,
  getRateCards,
  updateRateCard,
  deleteRateCard,
  getAgents,
  assignAgent,
  triggerAutoAssign,
  overrideOrderStatus,
  autoAssignOrder
};
