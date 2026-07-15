const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', productController.getAllProducts);
router.get('/rates', productController.getRates);
router.put('/rates', adminAuth, productController.updateRates);
router.get('/:id', productController.getProductById);
router.post('/', adminAuth, upload.array('images', 5), productController.createProduct);
router.put('/:id', adminAuth, upload.array('images', 5), productController.updateProduct);
router.delete('/:id', adminAuth, productController.deleteProduct);
router.post('/:id/reviews', productController.addReview);

module.exports = router;
