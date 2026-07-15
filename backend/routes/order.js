const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// Optional authentication middleware for guest checkouts
const optionalAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return next();
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(); // Proceed as guest
  }
};

router.post('/', optionalAuth, orderController.createOrder);
router.get('/mine', auth, orderController.getMyOrders);
router.get('/all', adminAuth, orderController.getAllOrders);
router.put('/:id', adminAuth, orderController.updateOrderStatus);
router.get('/stats', adminAuth, orderController.getDashboardStats);

module.exports = router;
