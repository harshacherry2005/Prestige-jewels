const Coupon = require('../models/Coupon');

// Get All Coupons (Admin Only)
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.json(coupons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error retrieving coupons' });
  }
};

// Create Coupon (Admin Only)
exports.createCoupon = async (req, res) => {
  const { code, discountType, discountValue, minPurchaseAmount, expirationDate } = req.body;
  try {
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ msg: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minPurchaseAmount: Number(minPurchaseAmount || 0),
      isActive: true,
      expirationDate: expirationDate || ''
    });

    res.status(201).json(coupon);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error creating coupon' });
  }
};

// Validate/Apply Coupon
exports.validateCoupon = async (req, res) => {
  const { code, subtotal } = req.body;
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ msg: 'Invalid or inactive coupon code' });
    }

    // Check expiration date
    if (coupon.expirationDate) {
      const expiry = new Date(coupon.expirationDate);
      if (expiry < new Date()) {
        return res.status(400).json({ msg: 'Coupon code has expired' });
      }
    }

    // Check minimum purchase amount
    if (subtotal < coupon.minPurchaseAmount) {
      return res.status(400).json({ 
        msg: `Minimum purchase of $${coupon.minPurchaseAmount} required for this coupon.` 
      });
    }

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error validating coupon' });
  }
};

// Delete Coupon (Admin Only)
exports.deleteCoupon = async (req, res) => {
  try {
    const deleted = await Coupon.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: 'Coupon not found' });
    res.json({ msg: 'Coupon deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error deleting coupon' });
  }
};
