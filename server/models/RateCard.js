const modelFactory = require('./modelFactory');

const rateCardSchemaObj = {
  pickupZone: { type: String, required: true },
  dropZone: { type: String, required: true },
  customerType: { type: String, enum: ['B2B', 'B2C'], required: true },
  paymentMethod: { type: String, enum: ['COD', 'Prepaid'], required: true },
  baseWeightLimit: { type: Number, required: true },
  baseRate: { type: Number, required: true },
  perKgIncrementalRate: { type: Number, required: true },
  extraCharge: { type: Number, default: 0 }
};

module.exports = modelFactory('RateCard', rateCardSchemaObj);
