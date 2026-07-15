const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

const metalRatesFile = path.join(__dirname, '../data/metalRates.json');

// Default metal rates (per gram)
const defaultMetalRates = {
  gold24K: 7500,
  gold22K: 7000,
  gold18K: 5800,
  silver: 90,
  platinum: 3800
};

// Helper to get metal rates
const getMetalRates = () => {
  if (!fs.existsSync(metalRatesFile)) {
    // Create directory if missing
    const dir = path.dirname(metalRatesFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(metalRatesFile, JSON.stringify(defaultMetalRates, null, 2));
    return defaultMetalRates;
  }
  try {
    const data = fs.readFileSync(metalRatesFile, 'utf8');
    return JSON.parse(data || JSON.stringify(defaultMetalRates));
  } catch (err) {
    return defaultMetalRates;
  }
};

// Helper to save metal rates
const saveMetalRates = (rates) => {
  try {
    fs.writeFileSync(metalRatesFile, JSON.stringify(rates, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving metal rates:', err);
    return false;
  }
};

// Pricing calculator
const calculateProductPrice = (product, rates) => {
  if (!product.isPriceDynamic) {
    // Fixed price base
    const basePrice = product.basePrice || 0;
    const discount = product.discountPercent || 0;
    const gstPercent = product.gstPercent || 3;
    
    const discountedBase = basePrice * (1 - discount / 100);
    const gstAmount = discountedBase * (gstPercent / 100);
    const total = discountedBase + gstAmount;

    return {
      metalValue: 0,
      makingCharge: 0,
      gstAmount,
      discountAmount: basePrice * (discount / 100),
      total: Math.round(total)
    };
  }

  // Dynamic pricing
  let ratePerGram = 0;
  const metal = product.metalType.toLowerCase();
  const purity = product.purity.toUpperCase();

  if (metal === 'gold') {
    if (purity.includes('22K')) ratePerGram = rates.gold22K;
    else if (purity.includes('18K')) ratePerGram = rates.gold18K;
    else ratePerGram = rates.gold24K; // default fallback
  } else if (metal === 'silver') {
    ratePerGram = rates.silver;
  } else if (metal === 'platinum') {
    ratePerGram = rates.platinum;
  }

  const metalValue = product.weight * ratePerGram;
  const makingCharge = product.makingCharge || 0; // Total making charge or per gram, let's treat as total
  
  const subtotalBeforeGst = metalValue + makingCharge;
  const discountAmount = subtotalBeforeGst * ((product.discountPercent || 0) / 100);
  const taxableValue = subtotalBeforeGst - discountAmount;
  const gstAmount = taxableValue * ((product.gstPercent || 3) / 100);
  const total = taxableValue + gstAmount;

  return {
    metalValue: Math.round(metalValue),
    makingCharge: Math.round(makingCharge),
    discountAmount: Math.round(discountAmount),
    gstAmount: Math.round(gstAmount),
    total: Math.round(total)
  };
};

// Get All Products (with dynamic price calculation)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    const rates = getMetalRates();
    
    const calculatedProducts = products.map(p => {
      // Handle standard JS objects or Mongoose documents
      const prodObj = p.toObject ? p.toObject() : p;
      const pricing = calculateProductPrice(prodObj, rates);
      return {
        ...prodObj,
        calculatedPrice: pricing
      };
    });

    res.json(calculatedProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error retrieving products' });
  }
};

// Get Single Product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    
    const rates = getMetalRates();
    const prodObj = product.toObject ? product.toObject() : product;
    const pricing = calculateProductPrice(prodObj, rates);

    res.json({
      ...prodObj,
      calculatedPrice: pricing
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error retrieving product' });
  }
};

// Create Product (Admin Only)
exports.createProduct = async (req, res) => {
  try {
    const {
      name, description, category, collectionType, metalType,
      purity, weight, stoneDetails, sizes, basePrice,
      makingCharge, isPriceDynamic, discountPercent, gstPercent, inventory
    } = req.body;

    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Save relative path for serving
        images.push(`/uploads/${file.filename}`);
      });
    }

    const sizesArray = Array.isArray(sizes) ? sizes : (sizes ? sizes.split(',').map(s => s.trim()) : ['Standard']);

    const newProduct = await Product.create({
      name,
      description,
      images: images.length > 0 ? images : ['/uploads/placeholder.jpg'], // default placeholder
      category,
      collectionType,
      metalType,
      purity,
      weight: Number(weight),
      stoneDetails: stoneDetails || 'None',
      sizes: sizesArray,
      basePrice: Number(basePrice || 0),
      makingCharge: Number(makingCharge || 0),
      isPriceDynamic: isPriceDynamic === 'true' || isPriceDynamic === true,
      discountPercent: Number(discountPercent || 0),
      gstPercent: Number(gstPercent || 3),
      inventory: Number(inventory || 10),
      rating: 4.5,
      reviewsCount: 0,
      reviews: []
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error creating product' });
  }
};

// Update Product (Admin Only)
exports.updateProduct = async (req, res) => {
  try {
    const {
      name, description, category, collectionType, metalType,
      purity, weight, stoneDetails, sizes, basePrice,
      makingCharge, isPriceDynamic, discountPercent, gstPercent, inventory
    } = req.body;

    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) return res.status(404).json({ msg: 'Product not found' });

    let images = existingProduct.images || [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      images = [...images, ...newImages];
    }

    const sizesArray = Array.isArray(sizes) ? sizes : (sizes ? sizes.split(',').map(s => s.trim()) : existingProduct.sizes);

    const updateFields = {
      name: name || existingProduct.name,
      description: description !== undefined ? description : existingProduct.description,
      category: category || existingProduct.category,
      collectionType: collectionType || existingProduct.collectionType,
      metalType: metalType || existingProduct.metalType,
      purity: purity || existingProduct.purity,
      weight: weight !== undefined ? Number(weight) : existingProduct.weight,
      stoneDetails: stoneDetails !== undefined ? stoneDetails : existingProduct.stoneDetails,
      sizes: sizesArray,
      basePrice: basePrice !== undefined ? Number(basePrice) : existingProduct.basePrice,
      makingCharge: makingCharge !== undefined ? Number(makingCharge) : existingProduct.makingCharge,
      isPriceDynamic: isPriceDynamic !== undefined ? (isPriceDynamic === 'true' || isPriceDynamic === true) : existingProduct.isPriceDynamic,
      discountPercent: discountPercent !== undefined ? Number(discountPercent) : existingProduct.discountPercent,
      gstPercent: gstPercent !== undefined ? Number(gstPercent) : existingProduct.gstPercent,
      inventory: inventory !== undefined ? Number(inventory) : existingProduct.inventory,
      images
    };

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error updating product' });
  }
};

// Delete Product (Admin Only)
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: 'Product not found' });
    res.json({ msg: 'Product deleted successfully', id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error deleting product' });
  }
};

// Get Metal Rates
exports.getRates = (req, res) => {
  const rates = getMetalRates();
  res.json(rates);
};

// Update Metal Rates (Admin Only)
exports.updateRates = (req, res) => {
  const { gold24K, gold22K, gold18K, silver, platinum } = req.body;
  const rates = {
    gold24K: Number(gold24K),
    gold22K: Number(gold22K),
    gold18K: Number(gold18K),
    silver: Number(silver),
    platinum: Number(platinum)
  };

  const success = saveMetalRates(rates);
  if (success) {
    res.json({ msg: 'Metal rates updated successfully', rates });
  } else {
    res.status(500).json({ msg: 'Failed to update metal rates' });
  }
};

// Add Review
exports.addReview = async (req, res) => {
  const { customerName, rating, text } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    const newReview = {
      customerName,
      rating: Number(rating),
      text,
      date: new Date().toISOString()
    };

    const reviews = product.reviews || [];
    reviews.push(newReview);

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        reviews,
        reviewsCount: reviews.length,
        rating: averageRating
      },
      { new: true }
    );

    res.status(201).json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error adding review' });
  }
};
