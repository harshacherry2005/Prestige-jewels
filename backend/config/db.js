const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isMongoConnected = false;

// Directory for local JSON data fallback
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper to get local JSON database path
const getLocalDbPath = (collectionName) => {
  return path.join(dataDir, `${collectionName}.json`);
};

// Read local JSON file
const readLocalDb = (collectionName) => {
  const filePath = getLocalDbPath(collectionName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading local db for ${collectionName}:`, err);
    return [];
  }
};

// Write local JSON file
const writeLocalDb = (collectionName, data) => {
  const filePath = getLocalDbPath(collectionName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing local db for ${collectionName}:`, err);
    return false;
  }
};

// Connect to Database (with Fallback)
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/prestige-jewelry';
  console.log('Connecting to database...');
  try {
    mongoose.set('strictQuery', false);
    // Timeout quickly (3 seconds) so the app startup isn't delayed if MongoDB isn't running
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    isMongoConnected = true;
    console.log('✔ MongoDB connected successfully.');
  } catch (error) {
    isMongoConnected = false;
    console.warn('⚠️ MongoDB connection failed. Falling back to local JSON file-based database.');
    console.warn(`Local database files are located at: ${dataDir}`);
  }
};

// Database Model Interface that works for both MongoDB and JSON Fallback
class LocalModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  async find(query = {}) {
    const data = readLocalDb(this.collectionName);
    return data.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const results = await this.find(query);
    return results[0] || null;
  }

  async findById(id) {
    const data = readLocalDb(this.collectionName);
    return data.find(item => item._id === id || item.id === id) || null;
  }

  async create(doc) {
    const data = readLocalDb(this.collectionName);
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    data.push(newDoc);
    writeLocalDb(this.collectionName, data);
    return newDoc;
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    const data = readLocalDb(this.collectionName);
    const index = data.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    
    data[index] = {
      ...data[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    writeLocalDb(this.collectionName, data);
    return data[index];
  }

  async findByIdAndDelete(id) {
    const data = readLocalDb(this.collectionName);
    const index = data.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    
    const deleted = data.splice(index, 1)[index] || null;
    writeLocalDb(this.collectionName, data);
    return deleted;
  }
}

// Get model wrapper based on DB connection state
const getModel = (name, schema, collectionName) => {
  const localModel = new LocalModel(collectionName);
  
  return {
    isMongo: () => isMongoConnected,
    getMongooseModel: () => mongoose.model(name, schema),
    getLocalModel: () => localModel,
    
    // Abstracted CRUD methods
    find: async (query) => {
      if (isMongoConnected) {
        return mongoose.model(name).find(query);
      }
      return localModel.find(query);
    },
    findOne: async (query) => {
      if (isMongoConnected) {
        return mongoose.model(name).findOne(query);
      }
      return localModel.findOne(query);
    },
    findById: async (id) => {
      if (isMongoConnected) {
        return mongoose.model(name).findById(id);
      }
      return localModel.findById(id);
    },
    create: async (doc) => {
      if (isMongoConnected) {
        return mongoose.model(name).create(doc);
      }
      return localModel.create(doc);
    },
    findByIdAndUpdate: async (id, update, options) => {
      if (isMongoConnected) {
        return mongoose.model(name).findByIdAndUpdate(id, update, options);
      }
      return localModel.findByIdAndUpdate(id, update, options);
    },
    findByIdAndDelete: async (id) => {
      if (isMongoConnected) {
        return mongoose.model(name).findByIdAndDelete(id);
      }
      return localModel.findByIdAndDelete(id);
    }
  };
};

module.exports = {
  connectDB,
  getModel,
  isMongo: () => isMongoConnected
};
