const mongoose = require('mongoose');

class DynamicModel {
  constructor(modelName, schemaDefinition, options = { timestamps: true }) {
    this.modelName = modelName;
    this.schemaDefinition = schemaDefinition;
    this.options = options;
    this._mongooseModel = null;
    this._mockModel = null;
  }

  get target() {
    if (process.env.USE_MOCK_DB === 'true') {
      if (!this._mockModel) {
        const MockModel = require('../config/mockMongoose');
        this._mockModel = new MockModel(this.modelName);
      }
      return this._mockModel;
    } else {
      if (!this._mongooseModel) {
        let schema;
        // // Check if schemaDefinition is already a Mongoose schema
        // if (schemaDefinition instanceof mongoose.Schema) {
        //   schema = schemaDefinition;
        // } else {
        //   schema = new mongoose.Schema(this.schemaDefinition, this.options);
        // }
        // Check if schemaDefinition is already a Mongoose schema
        if (this.schemaDefinition instanceof mongoose.Schema) {
          schema = this.schemaDefinition;
        } else {
          schema = new mongoose.Schema(this.schemaDefinition, this.options);
        }

        // Mongoose registered model check to avoid overwrites
        try {
          this._mongooseModel = mongoose.model(this.modelName);
        } catch (e) {
          this._mongooseModel = mongoose.model(this.modelName, schema);
        }
      }
      return this._mongooseModel;
    }
  }

  find(query) {
    return this.target.find(query);
  }

  findOne(query) {
    return this.target.findOne(query);
  }

  findById(id) {
    return this.target.findById(id);
  }

  findByIdSync(id) {
    if (process.env.USE_MOCK_DB === 'true') {
      return this.target.findByIdSync(id);
    }
    return null;
  }

  create(data) {
    return this.target.create(data);
  }

  findByIdAndUpdate(id, update, options) {
    return this.target.findByIdAndUpdate(id, update, options);
  }

  updateOne(query, update, options) {
    return this.target.updateOne(query, update, options);
  }

  deleteOne(query) {
    return this.target.deleteOne(query);
  }

  deleteMany(query = {}) {
    return this.target.deleteMany(query);
  }

  countDocuments(query = {}) {
    return this.target.countDocuments(query);
  }
}

module.exports = (modelName, schemaDefinition, options) => {
  return new DynamicModel(modelName, schemaDefinition, options);
};
