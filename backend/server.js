const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { connectDB } = require('./config/db');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const couponRoutes = require('./routes/coupon');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Static Folder for Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Setup fallback placeholder image in uploads directory
const setupPlaceholderImages = () => {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Create a minimal 1x1 pixel PNG placeholder if it doesn't exist
  const placeholderPath = path.join(uploadsDir, 'placeholder.jpg');
  if (!fs.existsSync(placeholderPath)) {
    // base64 for a 1x1 grey pixel jpeg
    const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    fs.writeFileSync(placeholderPath, Buffer.from(base64Data, 'base64'));
  }
};

// Seed Database
const seedDatabase = async () => {
  try {
    const productsCount = await Product.find({});
    // Force re-seed if catalog is smaller than 1200 (100 per category × 12)
    if (productsCount.length < 1200) {
      if (productsCount.length > 0) {
        console.log(`Found only ${productsCount.length} products. Re-seeding full 1200-product catalog...`);
        // Clear existing products from local JSON
        const { isMongo } = require('./config/db');
        if (!isMongo()) {
          const dbPath = require('path').join(__dirname, 'data', 'products.json');
          require('fs').writeFileSync(dbPath, JSON.stringify([], null, 2));
        }
      } else {
        console.log('No products found. Seeding full catalog...');
      }
      const allProducts = require('./data/products.json');
      let seeded = 0;
      for (const p of allProducts) {
        await Product.create(p);
        seeded++;
      }
      console.log(`✔ Seeded ${seeded} products (100 per category × 12 categories).`);
    } else {
      console.log(`✔ Catalog ready: ${productsCount.length} products loaded.`);
    }

    const couponsCount = await Coupon.find({});
    if (couponsCount.length === 0) {
      console.log('Seeding default coupons...');
      await Coupon.create({
        code: 'GOLD20',
        discountType: 'percentage',
        discountValue: 20,
        minPurchaseAmount: 1000,
        isActive: true
      });
      await Coupon.create({
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minPurchaseAmount: 100,
        isActive: true
      });
      await Coupon.create({
        code: 'FLAT500',
        discountType: 'flat',
        discountValue: 500,
        minPurchaseAmount: 3000,
        isActive: true
      });
      console.log('✔ Seeded default coupons.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Prestige Jewelry API running successfully.');
});

// Start Server
const startServer = async () => {
  setupPlaceholderImages();
  await connectDB();
  await seedDatabase();
  
  app.listen(PORT, () => {
    console.log(`✔ Server running on port ${PORT}`);
  });
};

startServer();
