const mongoose = require('mongoose');
const { getModel } = require('../config/db');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  images: [{ type: String }], // Array of image URLs/paths
  category: { type: String, required: true }, // e.g., 'Rings', 'Premium Necklaces'
  collectionType: { type: String, required: true }, // 'Premium' or 'Ordinary'
  metalType: { type: String, required: true }, // 'Gold', 'Silver', 'Platinum'
  purity: { type: String, required: true }, // '22K', '18K', '14K', '925 Silver'
  weight: { type: Number, required: true }, // weight in grams
  stoneDetails: { type: String, default: 'None' }, // e.g. '0.5 carat Diamond', 'Cubic Zirconia'
  sizes: [{ type: String }], // e.g. ['6', '7', '8'] or ['Standard']
  
  // Pricing configuration
  basePrice: { type: Number, default: 0 }, // base metal value (if fixed) or base price
  makingCharge: { type: Number, default: 0 }, // making charge in currency or per gram
  isPriceDynamic: { type: Boolean, default: true }, // dynamic metal rate calculation
  discountPercent: { type: Number, default: 0 },
  gstPercent: { type: Number, default: 3 }, // 3% standard GST for jewelry in India, or customizable
  
  inventory: { type: Number, default: 10 },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 0 },
  reviews: [{
    customerName: { type: String, required: true },
    rating: { type: Number, required: true },
    text: { type: String, default: '' },
    date: { type: String, default: () => new Date().toISOString() }
  }]
}, { timestamps: true });

module.exports = getModel('Product', productSchema, 'products');
