const mongoose = require('mongoose');
const modelFactory = require('./modelFactory');

const orderSchemaObj = {
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickupAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    zone: { type: String, required: true }
  },
  dropAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    zone: { type: String, required: true }
  },
  packageDetails: {
    length: { type: Number, required: true },
    breadth: { type: Number, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true }
  },
  pricingDetails: {
    billableWeight: { type: Number, required: true },
    baseRate: { type: Number, required: true },
    incrementalRate: { type: Number, required: true },
    codCharge: { type: Number, default: 0 },
    totalRate: { type: Number, required: true }
  },
  paymentMethod: { type: String, enum: ['COD', 'Prepaid'], required: true },
  customerType: { type: String, enum: ['B2B', 'B2C'], required: true },
  status: {
    type: String,
    enum: ['Created', 'Assigned', 'Picked Up', 'In Transit', 'Out For Delivery', 'Delivered', 'Failed', 'Rescheduled', 'Completed'],
    default: 'Created'
  },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  rescheduledDetails: {
    originalOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    rescheduleDate: { type: Date, default: null },
    attemptCount: { type: Number, default: 0 }
  }
};

module.exports = modelFactory('Order', orderSchemaObj);
