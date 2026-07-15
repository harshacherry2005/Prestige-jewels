const mongoose = require('mongoose');
const { getModel } = require('../config/db');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, default: 'percentage' }, // 'percentage', 'flat'
  discountValue: { type: Number, required: true },
  minPurchaseAmount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  expirationDate: { type: String, default: '' }
}, { timestamps: true });

module.exports = getModel('Coupon', couponSchema, 'coupons');
