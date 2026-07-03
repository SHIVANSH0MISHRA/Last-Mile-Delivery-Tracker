const mongoose = require('mongoose');
const modelFactory = require('./modelFactory');

const trackingHistorySchemaObj = {
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  status: { type: String, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  remarks: { type: String, default: '' }
};

module.exports = modelFactory('TrackingHistory', trackingHistorySchemaObj, { timestamps: false });
