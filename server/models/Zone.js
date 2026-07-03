const modelFactory = require('./modelFactory');

const zoneSchemaObj = {
  name: { type: String, required: true, unique: true },
  pincodes: [{ type: String, required: true }]
};

module.exports = modelFactory('Zone', zoneSchemaObj);
