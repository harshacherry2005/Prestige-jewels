const Order = require('../models/Order');
const Product = require('../models/Product');

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, discount, gst, shipping, total } = req.body;
    const userId = req.user ? req.user.id : 'guest';

    // Verify stock and update inventory
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const currentStock = product.inventory || 0;
        const newStock = Math.max(0, currentStock - item.quantity);
        await Product.findByIdAndUpdate(item.productId, { inventory: newStock });
      }
    }

    const newOrder = await Order.create({
      userId,
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      orderStatus: 'Pending',
      subtotal,
      discount,
      gst,
      shipping,
      total
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error creating order' });
  }
};

// Get Current User's Orders
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error retrieving user orders' });
  }
};

// Get All Orders (Admin Only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({});
    // Sort by newest first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error retrieving all orders' });
  }
};

// Update Order Status (Admin Only)
exports.updateOrderStatus = async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    const updateFields = {};
    if (orderStatus) updateFields.orderStatus = orderStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    const updated = await Order.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error updating order' });
  }
};

// Get Admin Dashboard Stats (Admin Only)
exports.getDashboardStats = async (req, res) => {
  try {
    const orders = await Order.find({});
    const products = await Product.find({});
    
    // Total Revenue (Only sum Paid or Pending COD)
    const totalSales = orders.reduce((sum, order) => {
      if (order.paymentStatus === 'Paid' || order.paymentMethod === 'COD') {
        return sum + order.total;
      }
      return sum;
    }, 0);

    // Filter successful orders
    const completedOrders = orders.filter(o => o.orderStatus !== 'Cancelled');

    // Total gold/silver weight sold
    let totalWeightGold = 0;
    let totalWeightSilver = 0;
    completedOrders.forEach(o => {
      o.items.forEach(item => {
        if (item.metalType && item.weight) {
          const type = item.metalType.toLowerCase();
          if (type === 'gold') totalWeightGold += item.weight * item.quantity;
          else if (type === 'silver') totalWeightSilver += item.weight * item.quantity;
        }
      });
    });

    // Simple monthly sales breakdown
    const salesByMonth = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      salesByMonth[monthYear] = (salesByMonth[monthYear] || 0) + order.total;
    });

    const salesChart = Object.keys(salesByMonth).map(key => ({
      name: key,
      sales: salesByMonth[key]
    }));

    // Inventory warning: items below 3 pieces
    const lowStockItems = products.filter(p => (p.inventory || 0) < 5).map(p => ({
      id: p._id,
      name: p.name,
      stock: p.inventory,
      category: p.category
    }));

    res.json({
      summary: {
        totalRevenue: totalSales,
        totalOrders: orders.length,
        averageOrderValue: orders.length > 0 ? Math.round(totalSales / orders.length) : 0,
        lowStockCount: lowStockItems.length,
        goldWeightSold: parseFloat(totalWeightGold.toFixed(2)),
        silverWeightSold: parseFloat(totalWeightSilver.toFixed(2))
      },
      salesChart,
      lowStockItems
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error generating stats' });
  }
};
