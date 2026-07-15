const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/profile', auth, authController.getProfile);
router.put('/wishlist', auth, authController.updateWishlist);
router.put('/addresses', auth, authController.updateAddresses);

module.exports = router;
