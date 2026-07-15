const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { adminAuth } = require('../middleware/auth');

router.get('/', adminAuth, couponController.getAllCoupons);
router.post('/', adminAuth, couponController.createCoupon);
router.post('/validate', couponController.validateCoupon);
router.delete('/:id', adminAuth, couponController.deleteCoupon);

module.exports = router;
