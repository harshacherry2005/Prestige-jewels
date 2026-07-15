const mongoose = require('mongoose');
const { getModel } = require('../config/db');

const orderSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    size: { type: String, default: 'Standard' },
    metalType: { type: String },
    purity: { type: String },
    weight: { type: Number },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentMethod: { type: String, required: true }, // 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'COD'
  paymentStatus: { type: String, default: 'Pending' }, // 'Pending', 'Paid', 'Failed'
  orderStatus: { type: String, default: 'Pending' }, // 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
  
  // Financial summary
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  total: { type: Number, required: true }
}, { timestamps: true });

module.exports = getModel('Order', orderSchema, 'orders');
