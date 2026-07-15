// API Wrapper with Automatic Standalone (Mock) Mode Fallback
const BASE_URL = 'http://localhost:5000/api';

// Live Metal Rates used for client-side pricing fallback
let metalRates = {
  gold24K: 7500,
  gold22K: 7000,
  gold18K: 5800,
  silver: 90,
  platinum: 3800
};

// Check backend availability
let isBackendAvailable = true;

const checkBackendStatus = async () => {
  try {
    const res = await fetch(`${BASE_URL.replace('/api', '')}/`, { method: 'GET', signal: AbortSignal.timeout(1500) });
    isBackendAvailable = res.ok;
  } catch (err) {
    isBackendAvailable = false;
    console.warn('âš ï¸ Prestige Backend API is offline. Running frontend in Standalone Mode (using LocalStorage & Mock API).');
  }
};

// Initialize connection status check
checkBackendStatus();

// Helper: load local mock database
const getMockDb = (key, defaultVal = []) => {
  const data = localStorage.getItem(`mock_db_${key}`);
  if (!data) {
    localStorage.setItem(`mock_db_${key}`, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(data);
};

const saveMockDb = (key, data) => {
  localStorage.setItem(`mock_db_${key}`, JSON.stringify(data));
};

// Programmatic mock product generator â€” 100 products Ã— 12 categories = 1200 total
const loadDefaultProductsMock = () => {
  const categories = [
    { name: 'Premium Necklaces', collection: 'Premium', metal: 'Gold', baseWeight: 35, weightVar: 3.5, sizeType: 'neck' },
    { name: 'Premium Chains', collection: 'Premium', metal: 'Gold', baseWeight: 18, weightVar: 2.2, sizeType: 'chain' },
    { name: 'Premium Bangles', collection: 'Premium', metal: 'Gold', baseWeight: 24, weightVar: 2.8, sizeType: 'bangle' },
    { name: 'Premium Rings', collection: 'Premium', metal: 'Gold', baseWeight: 4.5, weightVar: 0.6, sizeType: 'ring' },
    { name: 'Premium Earrings', collection: 'Premium', metal: 'Gold', baseWeight: 6.2, weightVar: 0.8, sizeType: 'ear' },
    { name: 'Premium Bridal Sets', collection: 'Premium', metal: 'Gold', baseWeight: 68, weightVar: 5.5, sizeType: 'bridal' },
    { name: 'Chains', collection: 'Ordinary', metal: 'Silver', baseWeight: 4.5, weightVar: 0.5, sizeType: 'chain' },
    { name: 'Bangles', collection: 'Ordinary', metal: 'Silver', baseWeight: 8.5, weightVar: 0.8, sizeType: 'bangle' },
    { name: 'Rings', collection: 'Ordinary', metal: 'Silver', baseWeight: 2.2, weightVar: 0.3, sizeType: 'ring' },
    { name: 'Earrings', collection: 'Ordinary', metal: 'Silver', baseWeight: 2.8, weightVar: 0.4, sizeType: 'ear' },
    { name: 'Pendants', collection: 'Ordinary', metal: 'Silver', baseWeight: 3.2, weightVar: 0.4, sizeType: 'pendant' },
    { name: 'Anklets', collection: 'Ordinary', metal: 'Silver', baseWeight: 5.0, weightVar: 0.6, sizeType: 'anklet' }
  ];

  const namePrefixes = [
    'Aura', 'Prestige', 'Royal', 'Imperial', 'Empress', 'Gilded', 'Heritage', 'Sovereign', 'Ethereal', 'Majestic',
    'Aria', 'Seraphina', 'Ophelia', 'Celeste', 'Nova', 'Lumina', 'Regis', 'Dorado', 'Elysian', 'Solas'
  ];

  const nameMains = [
    'Solitaire', 'Emerald Cut', 'Princess Cut', 'Filigree', 'Halo Sparkle', 'Infinity Link', 'Tear-Drop',
    'Classic Rope', 'Deco Flower', 'Vintage Twist', 'Marquise Shimmer', 'Ornate Crown', 'Pave Cluster',
    'Milgrain Edge', 'Blossom Petal', 'Luna Crescent', 'Aurora Beam', 'Solis Glow', 'Gemma Bead', 'Vera Band'
  ];

  const premiumStones = [
    'VVS1 Certified Diamond (0.5 ct)', 'Natural Emerald (1.2 ct)', 'Royal Blue Sapphire (0.8 ct)',
    'AAA Burmese Ruby (1.5 ct)', 'South Sea Cultured Pearl', 'None (Pure Metal)',
    'VVS2 Marquise Diamond (0.75 ct)', 'Natural Pink Tourmaline'
  ];

  const ordinaryStones = [
    'Premium Cubic Zirconia', 'Swarovski Crystal Accents', 'None (Sterling Silver)',
    'Polished Onyx Bead', 'Synthetic Turquoise Accent', 'None (High Shine)'
  ];

  const imgMap = {
    ring: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
           'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80'],
    neck: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
           'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80'],
    chain:['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=600&q=80',
           'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80'],
    ear:  ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=600&q=80',
           'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'],
    bangle:['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80'],
    bridal:['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80'],
    pendant:['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=600&q=80',
             'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'],
    anklet:['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80'],
  };

  const getSizes = (sizeType) => {
    switch (sizeType) {
      case 'ring': return ['5','6','7','8','9'];
      case 'bangle': return ['2.4','2.6','2.8'];
      case 'chain': return ['16 inch','18 inch','20 inch','22 inch'];
      case 'neck': case 'bridal': return ['Standard','Adjustable'];
      default: return ['Standard'];
    }
  };

  const all = [];
  let id = 1;

  for (const cat of categories) {
    for (let i = 1; i <= 100; i++) {
      const prefix = namePrefixes[(i + id) % namePrefixes.length];
      const main = nameMains[(i * 3 + id) % nameMains.length];
      const baseName = cat.name.replace('Premium ', '');

      let purity;
      if (cat.collection === 'Premium') {
        purity = ['22K Gold','18K Gold','Platinum 950','24K Gold'][i % 4];
      } else {
        purity = i % 2 === 0 ? '925 Silver' : '14K Gold';
      }
      const metalType = purity.includes('Gold') ? 'Gold' : (purity.includes('Silver') ? 'Silver' : 'Platinum');
      const weight = parseFloat((cat.baseWeight + (i % 12) * cat.weightVar).toFixed(2));
      const stoneDetails = cat.collection === 'Premium'
        ? premiumStones[i % premiumStones.length]
        : ordinaryStones[i % ordinaryStones.length];
      const makingCharge = cat.collection === 'Premium' ? 1500 + (i % 10) * 600 : 150 + (i % 8) * 75;
      const discountPercent = [0,0,0,5,0,0,10,0,15,0,0][i % 11];
      const imgList = imgMap[cat.sizeType] || imgMap.chain;

      all.push({
        _id: `mock_${id}`,
        name: `${prefix} ${main} ${baseName.slice(0,-1)} No.${i}`,
        description: `Exquisitely crafted ${purity} ${baseName.toLowerCase()} weighing ${weight}g. Adorned with ${stoneDetails}. BIS Hallmark certified.`,
        images: [imgList[i % imgList.length]],
        category: cat.name,
        collectionType: cat.collection,
        metalType,
        purity,
        weight,
        stoneDetails,
        sizes: getSizes(cat.sizeType),
        basePrice: cat.collection === 'Ordinary' ? 800 + i * 200 : 0,
        makingCharge,
        isPriceDynamic: true,
        discountPercent,
        gstPercent: 3,
        inventory: 2 + (i % 15),
        rating: parseFloat((4.0 + (i % 11) * 0.09).toFixed(1)),
        reviewsCount: 0,
        reviews: []
      });
      id++;
    }
  }
  return all;
};


const calculateMockPricing = (product, rates) => {
  if (!product.isPriceDynamic) {
    const base = product.basePrice || 0;
    const disc = product.discountPercent || 0;
    const gstPct = product.gstPercent || 3;
    const discBase = base * (1 - disc / 100);
    const gstAmt = discBase * (gstPct / 100);
    return {
      metalValue: 0,
      makingCharge: 0,
      discountAmount: base * (disc / 100),
      gstAmount: Math.round(gstAmt),
      total: Math.round(discBase + gstAmt)
    };
  }

  let rate = 0;
  const metal = product.metalType.toLowerCase();
  const purity = product.purity.toUpperCase();
  if (metal === 'gold') {
    if (purity.includes('22K')) rate = rates.gold22K;
    else if (purity.includes('18K')) rate = rates.gold18K;
    else rate = rates.gold24K;
  } else if (metal === 'silver') {
    rate = rates.silver;
  } else if (metal === 'platinum') {
    rate = rates.platinum;
  }

  const metalVal = product.weight * rate;
  const charge = product.makingCharge || 0;
  const sub = metalVal + charge;
  const discAmt = sub * ((product.discountPercent || 0) / 100);
  const taxable = sub - discAmt;
  const gstAmt = taxable * ((product.gstPercent || 3) / 100);
  return {
    metalValue: Math.round(metalVal),
    makingCharge: Math.round(charge),
    discountAmount: Math.round(discAmt),
    gstAmount: Math.round(gstAmt),
    total: Math.round(taxable + gstAmt)
  };
};

// Unified API Caller
const request = async (url, options = {}) => {
  // If headers contains Token, load it
  const token = localStorage.getItem('prestige_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  await checkBackendStatus();

  if (isBackendAvailable) {
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'API Request Failed');
      }
      return data;
    } catch (err) {
      if (err.message && err.message !== 'Failed to fetch') {
        throw err;
      }
      // If network fetch fails, automatically slide into Mock API below
    }
  }

  // MOCK API SIMULATION LAYER (STANDALONE MODE)
  return handleMockRequest(url, options);
};

// Mock Request Handler
const handleMockRequest = async (url, options) => {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : null;
  
  // Initialize mock databases
  const products = getMockDb('products', loadDefaultProductsMock());
  const users = getMockDb('users', []);
  const orders = getMockDb('orders', []);
  const coupons = getMockDb('coupons', [
    { code: 'GOLD20', discountType: 'percentage', discountValue: 20, minPurchaseAmount: 1000, isActive: true },
    { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minPurchaseAmount: 100, isActive: true },
    { code: 'FLAT500', discountType: 'flat', discountValue: 500, minPurchaseAmount: 3000, isActive: true }
  ]);
  const rates = getMockDb('rates', metalRates);

  // Helper to extract JWT token identity
  const getMockUserFromToken = () => {
    const activeToken = localStorage.getItem('prestige_token');
    if (!activeToken) return null;
    return users.find(u => u.token === activeToken) || null;
  };

  // DELAY SIMULATOR
  await new Promise(r => setTimeout(r, 300));

  // 1. AUTH ROUTES
  if (url === '/auth/signup') {
    const existing = users.find(u => u.email === body.email);
    if (existing) throw new Error('User already exists');
    
    const role = users.length === 0 ? 'admin' : 'user';
    const mockUser = {
      _id: `u_${Math.random().toString(36).substring(2, 9)}`,
      name: body.name,
      email: body.email,
      role,
      wishlist: [],
      addresses: [],
      token: `token_${Math.random().toString(36).substring(2, 15)}`
    };
    users.push(mockUser);
    saveMockDb('users', users);
    localStorage.setItem('prestige_token', mockUser.token);
    return { token: mockUser.token, user: mockUser };
  }

  if (url === '/auth/login') {
    // Admin override for quick sandbox access
    if (body.email === 'admin@prestige.com' && body.password === 'admin123') {
      let admin = users.find(u => u.email === body.email);
      if (!admin) {
        admin = {
          _id: 'admin_id',
          name: 'Prestige Admin',
          email: 'admin@prestige.com',
          role: 'admin',
          wishlist: [],
          addresses: [],
          token: 'admin_token'
        };
        users.push(admin);
        saveMockDb('users', users);
      }
      localStorage.setItem('prestige_token', admin.token);
      return { token: admin.token, user: admin };
    }

    const user = users.find(u => u.email === body.email);
    if (!user) throw new Error('Invalid credentials');
    // Simplified: Accept any password in mock mode
    user.token = `token_${Math.random().toString(36).substring(2, 15)}`;
    saveMockDb('users', users);
    localStorage.setItem('prestige_token', user.token);
    return { token: user.token, user };
  }

  if (url === '/auth/profile') {
    const user = getMockUserFromToken();
    if (!user) throw new Error('Unauthorized');
    return user;
  }

  if (url === '/auth/wishlist') {
    const user = getMockUserFromToken();
    if (!user) throw new Error('Unauthorized');
    const { productId } = body;
    let wishlist = user.wishlist || [];
    if (wishlist.includes(productId)) {
      wishlist = wishlist.filter(id => id !== productId);
    } else {
      wishlist.push(productId);
    }
    user.wishlist = wishlist;
    saveMockDb('users', users);
    return { wishlist };
  }

  if (url === '/auth/addresses') {
    const user = getMockUserFromToken();
    if (!user) throw new Error('Unauthorized');
    user.addresses = body.addresses;
    saveMockDb('users', users);
    return { addresses: user.addresses };
  }

  // 2. PRODUCT ROUTES
  if (url === '/products/rates') {
    if (method === 'PUT') {
      const user = getMockUserFromToken();
      if (!user || user.role !== 'admin') throw new Error('Access Denied');
      saveMockDb('rates', body);
      return { msg: 'Metal rates updated', rates: body };
    }
    return rates;
  }

  if (url === '/products') {
    if (method === 'POST') {
      const user = getMockUserFromToken();
      if (!user || user.role !== 'admin') throw new Error('Access Denied');
      
      const newProduct = {
        _id: `p_${Math.random().toString(36).substring(2, 9)}`,
        name: body.name,
        description: body.description,
        images: body.images || ["https://images.unsplash.com/photo-159964343478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"],
        category: body.category,
        collectionType: body.collectionType,
        metalType: body.metalType,
        purity: body.purity,
        weight: Number(body.weight),
        stoneDetails: body.stoneDetails || 'None',
        sizes: body.sizes || ['Standard'],
        basePrice: Number(body.basePrice || 0),
        makingCharge: Number(body.makingCharge || 0),
        isPriceDynamic: body.isPriceDynamic === true,
        discountPercent: Number(body.discountPercent || 0),
        gstPercent: Number(body.gstPercent || 3),
        inventory: Number(body.inventory || 10),
        rating: 4.5,
        reviewsCount: 0,
        reviews: []
      };
      products.push(newProduct);
      saveMockDb('products', products);
      return newProduct;
    }

    // GET products list
    return products.map(p => ({
      ...p,
      calculatedPrice: calculateMockPricing(p, rates)
    }));
  }

  if (url.startsWith('/products/')) {
    const id = url.split('/')[2];
    const index = products.findIndex(p => p._id === id);
    if (index === -1) throw new Error('Product not found');

    if (url.endsWith('/reviews')) {
      const p = products[index];
      const newRev = {
        customerName: body.customerName,
        rating: Number(body.rating),
        text: body.text,
        date: new Date().toISOString()
      };
      p.reviews = p.reviews || [];
      p.reviews.push(newRev);
      p.reviewsCount = p.reviews.length;
      p.rating = parseFloat((p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length).toFixed(1));
      
      saveMockDb('products', products);
      return { ...p, calculatedPrice: calculateMockPricing(p, rates) };
    }

    if (method === 'PUT') {
      const user = getMockUserFromToken();
      if (!user || user.role !== 'admin') throw new Error('Access Denied');
      
      products[index] = {
        ...products[index],
        ...body,
        weight: body.weight !== undefined ? Number(body.weight) : products[index].weight,
        makingCharge: body.makingCharge !== undefined ? Number(body.makingCharge) : products[index].makingCharge,
        discountPercent: body.discountPercent !== undefined ? Number(body.discountPercent) : products[index].discountPercent,
        inventory: body.inventory !== undefined ? Number(body.inventory) : products[index].inventory,
      };
      saveMockDb('products', products);
      return products[index];
    }

    if (method === 'DELETE') {
      const user = getMockUserFromToken();
      if (!user || user.role !== 'admin') throw new Error('Access Denied');
      const deleted = products.splice(index, 1)[0];
      saveMockDb('products', products);
      return { msg: 'Deleted successfully', id: deleted._id };
    }

    // GET single product
    return {
      ...products[index],
      calculatedPrice: calculateMockPricing(products[index], rates)
    };
  }

  // 3. ORDER ROUTES
  if (url === '/orders') {
    const user = getMockUserFromToken();
    const newOrder = {
      _id: `o_${Math.random().toString(36).substring(2, 9)}`,
      userId: user ? user._id : 'guest',
      items: body.items,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentMethod === 'COD' ? 'Pending' : 'Paid',
      orderStatus: 'Pending',
      subtotal: body.subtotal,
      discount: body.discount,
      gst: body.gst,
      shipping: body.shipping,
      total: body.total,
      createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    saveMockDb('orders', orders);

    // Deduct inventory
    body.items.forEach(item => {
      const pIdx = products.findIndex(p => p._id === item.productId);
      if (pIdx !== -1) {
        products[pIdx].inventory = Math.max(0, (products[pIdx].inventory || 0) - item.quantity);
      }
    });
    saveMockDb('products', products);

    return newOrder;
  }

  if (url === '/orders/mine') {
    const user = getMockUserFromToken();
    if (!user) throw new Error('Unauthorized');
    return orders.filter(o => o.userId === user._id);
  }

  if (url === '/orders/all') {
    const user = getMockUserFromToken();
    if (!user || user.role !== 'admin') throw new Error('Access Denied');
    return [...orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (url.startsWith('/orders/') && url.endsWith('/status') || (url.split('/').length === 3 && method === 'PUT')) {
    const id = url.split('/')[2];
    const user = getMockUserFromToken();
    if (!user || user.role !== 'admin') throw new Error('Access Denied');
    
    const oIdx = orders.findIndex(o => o._id === id);
    if (oIdx === -1) throw new Error('Order not found');
    
    if (body.orderStatus) orders[oIdx].orderStatus = body.orderStatus;
    if (body.paymentStatus) orders[oIdx].paymentStatus = body.paymentStatus;
    
    saveMockDb('orders', orders);
    return orders[oIdx];
  }

  if (url === '/orders/stats') {
    const user = getMockUserFromToken();
    if (!user || user.role !== 'admin') throw new Error('Access Denied');

    const totalSales = orders.reduce((sum, o) => {
      if (o.paymentStatus === 'Paid' || o.paymentMethod === 'COD') return sum + o.total;
      return sum;
    }, 0);

    const completed = orders.filter(o => o.orderStatus !== 'Cancelled');
    let goldWeight = 0;
    let silverWeight = 0;
    completed.forEach(o => {
      o.items.forEach(item => {
        if (item.metalType && item.weight) {
          if (item.metalType.toLowerCase() === 'gold') goldWeight += item.weight * item.quantity;
          else if (item.metalType.toLowerCase() === 'silver') silverWeight += item.weight * item.quantity;
        }
      });
    });

    // Mock chart data
    const salesChart = [
      { name: 'May', sales: Math.round(totalSales * 0.3) },
      { name: 'Jun', sales: Math.round(totalSales * 0.4) },
      { name: 'Jul', sales: Math.round(totalSales * 0.3) }
    ];

    const lowStockItems = products.filter(p => (p.inventory || 0) < 5).map(p => ({
      _id: p._id, name: p.name, stock: p.inventory, category: p.category
    }));

    return {
      summary: {
        totalRevenue: totalSales,
        totalOrders: orders.length,
        averageOrderValue: orders.length > 0 ? Math.round(totalSales / orders.length) : 0,
        lowStockCount: lowStockItems.length,
        goldWeightSold: parseFloat(goldWeight.toFixed(2)),
        silverWeightSold: parseFloat(silverWeight.toFixed(2))
      },
      salesChart,
      lowStockItems
    };
  }

  // 4. COUPON ROUTES
  if (url === '/coupons') {
    if (method === 'POST') {
      const user = getMockUserFromToken();
      if (!user || user.role !== 'admin') throw new Error('Access Denied');
      const newC = {
        _id: `c_${Math.random().toString(36).substring(2, 9)}`,
        code: body.code.toUpperCase(),
        discountType: body.discountType,
        discountValue: Number(body.discountValue),
        minPurchaseAmount: Number(body.minPurchaseAmount || 0),
        isActive: true,
        expirationDate: body.expirationDate || ''
      };
      coupons.push(newC);
      saveMockDb('coupons', coupons);
      return newC;
    }
    const user = getMockUserFromToken();
    if (!user || user.role !== 'admin') throw new Error('Access Denied');
    return coupons;
  }

  if (url === '/coupons/validate') {
    const c = coupons.find(cp => cp.code === body.code.toUpperCase());
    if (!c || !c.isActive) throw new Error('Invalid or inactive coupon code');
    if (body.subtotal < c.minPurchaseAmount) {
      throw new Error(`Minimum purchase of $${c.minPurchaseAmount} required.`);
    }
    return {
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue
    };
  }

  if (url.startsWith('/coupons/') && method === 'DELETE') {
    const id = url.split('/')[2];
    const user = getMockUserFromToken();
    if (!user || user.role !== 'admin') throw new Error('Access Denied');
    const cIdx = coupons.findIndex(cp => cp._id === id);
    if (cIdx === -1) throw new Error('Coupon not found');
    coupons.splice(cIdx, 1);
    saveMockDb('coupons', coupons);
    return { msg: 'Coupon deleted' };
  }

  throw new Error('Endpoint mock not found');
};

// Exports API functions
export const api = {
  get: (url) => request(url, { method: 'GET' }),
  post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: 'DELETE' }),
  
  // Custom file upload wrapper (works natively on backend or fallback)
  uploadProduct: async (formData) => {
    await checkBackendStatus();
    if (isBackendAvailable) {
      const token = localStorage.getItem('prestige_token');
      const res = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Upload Failed');
      return data;
    }
    
    // Standalone fallback: Parse formData fields
    const productData = {};
    for (let [key, val] of formData.entries()) {
      productData[key] = val;
    }
    
    // Check sizes array
    if (productData.sizes && typeof productData.sizes === 'string') {
      productData.sizes = productData.sizes.split(',').map(s => s.trim());
    }

    // Set a random luxury unsplash image based on category
    const unsplashPics = {
      'ring': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
      'necklace': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
      'chain': 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=600&q=80',
      'earrings': 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=600&q=80',
      'bangles': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80',
    };

    let matchedPic = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=600&q=80';
    const catLow = (productData.category || '').toLowerCase();
    for (const key in unsplashPics) {
      if (catLow.includes(key)) {
        matchedPic = unsplashPics[key];
        break;
      }
    }
    productData.images = [matchedPic];
    return request('/products', { method: 'POST', body: JSON.stringify(productData) });
  },

  updateProductWithUpload: async (id, formData) => {
    await checkBackendStatus();
    if (isBackendAvailable) {
      const token = localStorage.getItem('prestige_token');
      const res = await fetch(`${BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Update Failed');
      return data;
    }

    const productData = {};
    for (let [key, val] of formData.entries()) {
      productData[key] = val;
    }
    return request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) });
  },
  
  isStandalone: () => !isBackendAvailable
};
