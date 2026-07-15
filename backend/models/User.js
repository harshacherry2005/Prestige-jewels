const mongoose = require('mongoose');
const { getModel } = require('../config/db');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // 'user', 'admin'
  wishlist: [{ type: String }], // Array of product ids
  addresses: [{
    fullName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String,
    isDefault: { type: Boolean, default: false }
  }]
}, { timestamps: true });

// Export the database-agnostic model wrapper
module.exports = getModel('User', userSchema, 'users');
