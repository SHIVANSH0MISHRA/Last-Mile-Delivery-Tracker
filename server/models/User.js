const modelFactory = require('./modelFactory');

const userSchemaObj = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin', 'agent'], default: 'customer' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  
  // Agent-specific fields
  availability: { type: Boolean, default: true },
  currentZone: { type: String, default: '' },
  currentLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  }
};

module.exports = modelFactory('User', userSchemaObj);
