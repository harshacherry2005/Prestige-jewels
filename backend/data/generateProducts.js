// Run this script once to generate products.json with 100 products per category
const fs = require('fs');
const path = require('path');
const { generateProducts } = require('./productGenerator');

const products = generateProducts();
const outputPath = path.join(__dirname, 'products.json');

fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
console.log(`✔ Generated ${products.length} products (100 per category × 12 categories)`);
console.log(`✔ Saved to: ${outputPath}`);
