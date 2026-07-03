const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function matches(item, query) {
  if (!query || Object.keys(query).length === 0) return true;
  for (let key in query) {
    const val = query[key];
    const itemVal = item[key];

    // Check for operator objects
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if ('$ne' in val) {
        if (itemVal === val.$ne) return false;
        continue;
      }
      if ('$in' in val) {
        const inArr = val.$in || [];
        if (!inArr.includes(itemVal)) return false;
        continue;
      }
      if ('$nin' in val) {
        const ninArr = val.$nin || [];
        if (ninArr.includes(itemVal)) return false;
        continue;
      }
    }

    // Array containing element logic (e.g. pincodes array includes '110001')
    if (Array.isArray(itemVal)) {
      if (!itemVal.includes(val)) return false;
      continue;
    }

    // Regular matching
    if (itemVal !== val) {
      // If we are checking ObjectId or ID as string
      if (itemVal && val && itemVal.toString() === val.toString()) {
        continue;
      }
      return false;
    }
  }
  return true;
}

class DocumentInstance {
  constructor(obj, model) {
    Object.assign(this, JSON.parse(JSON.stringify(obj))); // Deep clone
    Object.defineProperty(this, '_model', {
      value: model,
      enumerable: false,
      writable: true
    });
  }

  async save() {
    const list = this._model._read();
    const idx = list.findIndex(x => x._id === this._id);
    
    // Convert to plain object for writing
    const plainObj = { ...this };
    plainObj.updatedAt = new Date().toISOString();
    
    if (idx !== -1) {
      list[idx] = plainObj;
    } else {
      plainObj.createdAt = new Date().toISOString();
      list.push(plainObj);
    }
    
    this._model._write(list);
    return this;
  }

  toObject() {
    const obj = { ...this };
    return obj;
  }
}

class QueryChain {
  constructor(data, modelInstance) {
    this.data = data;
    this.modelInstance = modelInstance;
  }

  populate(field) {
    const isArray = Array.isArray(this.data);
    const items = isArray ? this.data : (this.data ? [this.data] : []);

    for (let item of items) {
      if (!item) continue;
      
      let refModelName = '';
      if (field === 'customer' || field === 'assignedAgent' || field === 'updatedBy' || field === 'user') {
        refModelName = 'User';
      } else if (field === 'order') {
        refModelName = 'Order';
      }

      if (refModelName && item[field]) {
        const refId = typeof item[field] === 'object' ? (item[field]._id || item[field]) : item[field];
        if (refId) {
          try {
            const MockRefModel = require('../models/' + refModelName);
            const refDoc = MockRefModel.findByIdSync(refId.toString());
            if (refDoc) {
              item[field] = refDoc;
            }
          } catch (err) {
            console.error(`Failed to populate field ${field} on Mock DB`, err.message);
          }
        }
      }
    }

    this.data = isArray ? items : items[0];
    return this;
  }

  exec() {
    return Promise.resolve(this.data);
  }

  then(onSuccess, onError) {
    return Promise.resolve(this.data).then(onSuccess, onError);
  }
}

class MockModel {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name.toLowerCase()}s.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  _read() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      return [];
    }
  }

  _write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  _generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  find(query = {}) {
    const list = this._read();
    const filtered = list.filter(item => matches(item, query));
    const docs = filtered.map(item => new DocumentInstance(item, this));
    return new QueryChain(docs, this);
  }

  findOne(query = {}) {
    const list = this._read();
    const found = list.find(item => matches(item, query));
    const doc = found ? new DocumentInstance(found, this) : null;
    return new QueryChain(doc, this);
  }

  findById(id) {
    return this.findOne({ _id: id });
  }

  findByIdSync(id) {
    const list = this._read();
    const found = list.find(item => item._id === id);
    return found ? new DocumentInstance(found, this) : null;
  }

  async create(docData) {
    const list = this._read();
    const newDoc = {
      _id: this._generateId(),
      ...docData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newDoc);
    this._write(list);
    return new DocumentInstance(newDoc, this);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const list = this._read();
    const idx = list.findIndex(item => item._id === id);
    if (idx === -1) return null;

    let doc = list[idx];
    const updateData = update.$set || update;

    // Apply updates
    for (let key in updateData) {
      doc[key] = updateData[key];
    }
    doc.updatedAt = new Date().toISOString();
    list[idx] = doc;
    this._write(list);
    return new DocumentInstance(doc, this);
  }

  async updateOne(query, update, options = {}) {
    const list = this._read();
    const idx = list.findIndex(item => matches(item, query));
    if (idx === -1) return { nModified: 0 };

    let doc = list[idx];
    const updateData = update.$set || update;

    for (let key in updateData) {
      doc[key] = updateData[key];
    }
    doc.updatedAt = new Date().toISOString();
    list[idx] = doc;
    this._write(list);
    return { nModified: 1 };
  }

  async deleteOne(query) {
    const list = this._read();
    const idx = list.findIndex(item => matches(item, query));
    if (idx === -1) return { deletedCount: 0 };
    list.splice(idx, 1);
    this._write(list);
    return { deletedCount: 1 };
  }

  async deleteMany(query = {}) {
    const list = this._read();
    const beforeCount = list.length;
    const kept = list.filter(item => !matches(item, query));
    this._write(kept);
    return { deletedCount: beforeCount - kept.length };
  }

  async countDocuments(query = {}) {
    const list = this._read();
    return list.filter(item => matches(item, query)).length;
  }
}

module.exports = MockModel;
