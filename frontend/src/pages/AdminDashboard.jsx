import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { api } from '../utils/api';
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle, Scale, Plus, Edit3, Trash2, CheckCircle2, Ticket, Settings, ArrowLeftRight } from 'lucide-react';

export default function AdminDashboard() {
  const { user, token, navigate, loadCatalog } = useContext(ShopContext);

  // Tab Selection
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'products', 'orders', 'rates', 'coupons'

  // Dashboard Metrics
  const [metrics, setMetrics] = useState(null);
  
  // Products Management
  const [adminProducts, setAdminProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  
  // Product Form Fields
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pCat, setPCat] = useState('Premium Necklaces');
  const [pColl, setPColl] = useState('Premium');
  const [pMetal, setPMetal] = useState('Gold');
  const [pPurity, setPPurity] = useState('22K Gold');
  const [pWeight, setPWeight] = useState('');
  const [pStone, setPStone] = useState('None');
  const [pSizes, setPSizes] = useState('Standard');
  const [pBasePrice, setPBasePrice] = useState(0);
  const [pMakingCharge, setPMakingCharge] = useState('');
  const [pDynamic, setPDynamic] = useState(true);
  const [pDiscount, setPDiscount] = useState(0);
  const [pInventory, setPInventory] = useState(10);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Orders Management
  const [adminOrders, setAdminOrders] = useState([]);
  
  // Live Rates fields
  const [gold24K, setGold24K] = useState(7500);
  const [gold22K, setGold22K] = useState(7000);
  const [gold18K, setGold18K] = useState(5800);
  const [silver, setSilver] = useState(90);
  const [platinum, setPlatinum] = useState(3800);

  // Coupons fields
  const [coupons, setCoupons] = useState([]);
  const [cCode, setCCode] = useState('');
  const [cType, setCType] = useState('percentage');
  const [cVal, setCVal] = useState('');
  const [cMin, setCMin] = useState(0);

  // Load All Admin Data
  const loadAdminData = async () => {
    try {
      const stats = await api.get('/orders/stats');
      setMetrics(stats);
      
      const prods = await api.get('/products');
      setAdminProducts(prods);

      const ords = await api.get('/orders/all');
      setAdminOrders(ords);

      const rates = await api.get('/products/rates');
      setGold24K(rates.gold24K);
      setGold22K(rates.gold22K);
      setGold18K(rates.gold18K);
      setSilver(rates.silver);
      setPlatinum(rates.platinum);

      const coups = await api.get('/coupons');
      setCoupons(coups);
    } catch (err) {
      console.error('Error fetching admin details:', err);
    }
  };

  useEffect(() => {
    if (!token || (user && user.role !== 'admin')) {
      navigate('home');
      return;
    }
    loadAdminData();
  }, [token, user]);

  // Product Add / Edit Submission
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', pName);
    formData.append('description', pDesc);
    formData.append('category', pCat);
    formData.append('collectionType', pColl);
    formData.append('metalType', pMetal);
    formData.append('purity', pPurity);
    formData.append('weight', pWeight);
    formData.append('stoneDetails', pStone);
    formData.append('sizes', pSizes);
    formData.append('basePrice', pBasePrice);
    formData.append('makingCharge', pMakingCharge);
    formData.append('isPriceDynamic', pDynamic);
    formData.append('discountPercent', pDiscount);
    formData.append('inventory', pInventory);

    if (selectedFiles.length > 0) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('images', selectedFiles[i]);
      }
    }

    try {
      if (editingProductId) {
        await api.updateProductWithUpload(editingProductId, formData);
        alert('Product updated successfully!');
      } else {
        await api.uploadProduct(formData);
        alert('Product added successfully!');
      }
      
      resetProductForm();
      loadCatalog();
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Error processing product');
    }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product._id);
    setPName(product.name);
    setPDesc(product.description || '');
    setPCat(product.category);
    setPColl(product.collectionType);
    setPMetal(product.metalType);
    setPPurity(product.purity);
    setPWeight(product.weight);
    setPStone(product.stoneDetails || 'None');
    setPSizes(product.sizes?.join(', ') || 'Standard');
    setPBasePrice(product.basePrice || 0);
    setPMakingCharge(product.makingCharge || 0);
    setPDynamic(product.isPriceDynamic);
    setPDiscount(product.discountPercent || 0);
    setPInventory(product.inventory || 10);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      alert('Product deleted.');
      loadCatalog();
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setPName('');
    setPDesc('');
    setPWeight('');
    setPMakingCharge('');
    setPDiscount(0);
    setPInventory(10);
    setSelectedFiles([]);
    setShowProductForm(false);
  };

  // Rates Update
  const handleRatesUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/products/rates', {
        gold24K, gold22K, gold18K, silver, platinum
      });
      alert('Dynamic metal rates updated! All store items recalculated.');
      loadCatalog();
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Rates update failed');
    }
  };

  // Order Status Update
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { orderStatus: newStatus });
      alert(`Order status updated to ${newStatus}`);
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update order');
    }
  };

  // Add Coupon
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', {
        code: cCode,
        discountType: cType,
        discountValue: Number(cVal),
        minPurchaseAmount: Number(cMin)
      });
      alert('Coupon created successfully!');
      setCCode('');
      setCVal('');
      setCMin(0);
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Coupon creation failed');
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id) => {
    try {
      await api.delete(`/coupons/${id}`);
      alert('Coupon deleted');
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Dashboard title banner */}
      <div className="bg-stone-900 text-white p-6 sm:p-8 flex justify-between items-center relative overflow-hidden border border-gold/25">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-10" />
        <div className="relative">
          <h2 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wider">Boutique Owner Dashboard</h2>
          <p className="text-[10px] text-stone-400 tracking-wider flex items-center gap-1.5 uppercase mt-0.5">
            <Settings className="w-3.5 h-3.5 text-gold" /> Admin Console
          </p>
        </div>
      </div>

      {/* Tab select layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Navigation list */}
        <nav className="w-full lg:w-1/5 bg-white dark:bg-stone-900/60 border border-stone-150 dark:border-stone-850 p-4 h-fit flex flex-row lg:flex-col gap-1 select-none">
          {[
            { id: 'stats', label: 'Boutique Stats', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'products', label: 'Products Catalog', icon: <ShoppingBag className="w-4 h-4" /> },
            { id: 'orders', label: 'Client Orders', icon: <DollarSign className="w-4 h-4" /> },
            { id: 'rates', label: 'Live Metal Rates', icon: <Scale className="w-4 h-4" /> },
            { id: 'coupons', label: 'Discounts & Coupons', icon: <Ticket className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-2.5 px-4 py-3 text-[10px] uppercase tracking-wider font-bold border-b-2 lg:border-b-0 lg:border-l-2 transition-all duration-300 ${
                activeTab === tab.id
                  ? 'text-gold border-gold bg-gold/5 dark:bg-gold/10'
                  : 'text-stone-400 border-transparent hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Tab Detail panels */}
        <main className="flex-1 min-w-0">
          
          {/* TAB 1: BOUTIQUE STATS */}
          {activeTab === 'stats' && metrics && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Stat grid summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: 'Total Revenue', value: formatPrice(metrics.summary.totalRevenue), icon: <DollarSign className="w-4 h-4 text-emerald-500" /> },
                  { title: 'Total Orders', value: metrics.summary.totalOrders, icon: <ShoppingBag className="w-4 h-4 text-gold" /> },
                  { title: 'Average Order', value: formatPrice(metrics.summary.averageOrderValue), icon: <TrendingUp className="w-4 h-4 text-sky-500" /> },
                  { title: 'Low Stock warnings', value: metrics.summary.lowStockCount, icon: <AlertTriangle className="w-4 h-4 text-red-500" /> }
                ].map((card, i) => (
                  <div key={i} className="bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-4 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">{card.title}</p>
                      <p className="font-bold text-stone-900 dark:text-white mt-1 text-sm sm:text-base">{card.value}</p>
                    </div>
                    <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-full">{card.icon}</div>
                  </div>
                ))}
              </div>

              {/* Gold/Silver metals summary & sales chart */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Metals breakdown */}
                <div className="bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-6 space-y-4">
                  <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-gold" /> Total Materials Sold
                  </h3>
                  <div className="space-y-3 pt-2 text-xs">
                    <div className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                      <span className="text-stone-450">Hallmarked Pure Gold</span>
                      <span className="font-bold text-gold">{metrics.summary.goldWeightSold} grams</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                      <span className="text-stone-450">Fine Sterling Silver</span>
                      <span className="font-bold text-stone-600 dark:text-stone-300">{metrics.summary.silverWeightSold} grams</span>
                    </div>
                  </div>
                </div>

                {/* Sales Chart Mock */}
                <div className="bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-6 md:col-span-2 space-y-4">
                  <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                    Sales Revenue Chart
                  </h3>
                  <div className="flex items-end justify-between h-40 pt-4 px-2 border-b border-stone-200 dark:border-stone-800">
                    {metrics.salesChart.map((col, idx) => (
                      <div key={idx} className="flex flex-col items-center w-12 sm:w-16 space-y-2">
                        <span className="text-[9px] font-bold text-gold">{formatPrice(col.sales)}</span>
                        {/* height calculated proportionally */}
                        <div
                          style={{ height: `${Math.min(100, Math.max(15, (col.sales / (metrics.summary.totalRevenue || 1)) * 120))}px` }}
                          className="w-full bg-gold border border-gold/40"
                        />
                        <span className="text-[10px] text-stone-400 font-bold uppercase">{col.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Low stock Warnings */}
              <div className="bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-6 space-y-4">
                <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Low Inventory Alerts
                </h3>
                {metrics.lowStockItems.length === 0 ? (
                  <p className="text-stone-400 italic text-xs">All products catalog inventory levels are healthy.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {metrics.lowStockItems.map((item, idx) => (
                      <div key={idx} className="border border-red-200 bg-red-50/5 p-3 text-xs flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-stone-900 dark:text-white">{item.name}</p>
                          <p className="text-[10px] text-stone-400 uppercase mt-0.5">{item.category}</p>
                        </div>
                        <span className="font-bold text-red-600 bg-red-100 dark:bg-red-950 px-2 py-0.5 text-[10px]">
                          {item.stock} left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div className="bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-6 space-y-6 animate-fade-in">
              <div className="flex justify-between items-center pb-3 border-b border-stone-100 dark:border-stone-850">
                <h3 className="font-serif text-sm font-semibold tracking-wider text-stone-900 dark:text-white uppercase">
                  Manage Jewelry Catalog ({adminProducts.length} items)
                </h3>
                {!showProductForm && (
                  <button
                    onClick={() => setShowProductForm(true)}
                    className="text-gold font-bold uppercase tracking-wider text-[10px] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Product
                  </button>
                )}
              </div>

              {/* Product Form Drawer */}
              {showProductForm && (
                <form onSubmit={handleProductSubmit} className="border border-stone-200 dark:border-stone-800 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 dark:bg-stone-900/15">
                  <h4 className="sm:col-span-2 font-serif text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white border-b border-stone-200 dark:border-stone-800 pb-2">
                    {editingProductId ? 'Edit Product Details' : 'Add New Jewelry Product'}
                  </h4>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-stone-400 uppercase tracking-wider">Product Name</label>
                    <input
                      type="text"
                      required
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-stone-400 uppercase tracking-wider">Description</label>
                    <textarea
                      rows="2"
                      value={pDesc}
                      onChange={(e) => setPDesc(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    ></textarea>
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">Category</label>
                    <select
                      value={pCat}
                      onChange={(e) => setPCat(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    >
                      <option value="Premium Necklaces">Premium Necklaces</option>
                      <option value="Premium Chains">Premium Chains</option>
                      <option value="Premium Bangles">Premium Bangles</option>
                      <option value="Premium Rings">Premium Rings</option>
                      <option value="Premium Earrings">Premium Earrings</option>
                      <option value="Premium Bridal Sets">Premium Bridal Sets</option>
                      <option value="Chains">Everyday Chains</option>
                      <option value="Bangles">Everyday Bangles</option>
                      <option value="Rings">Everyday Rings</option>
                      <option value="Earrings">Everyday Earrings</option>
                      <option value="Pendants">Everyday Pendants</option>
                      <option value="Anklets">Everyday Anklets</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">Range Segment</label>
                    <select
                      value={pColl}
                      onChange={(e) => setPColl(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    >
                      <option value="Premium">Premium Jewellery Collection</option>
                      <option value="Ordinary">Affordable Everyday Jewellery</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">Metal Type</label>
                    <select
                      value={pMetal}
                      onChange={(e) => setPMetal(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    >
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">Purity Purity</label>
                    <select
                      value={pPurity}
                      onChange={(e) => setPPurity(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    >
                      <option value="22K Gold">22K Gold</option>
                      <option value="18K Gold">18K Gold</option>
                      <option value="24K Gold">24K Gold</option>
                      <option value="925 Silver">925 Silver</option>
                      <option value="Platinum 950">Platinum 950</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">Net Weight (grams)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={pWeight}
                      onChange={(e) => setPWeight(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">Stone Details</label>
                    <input
                      type="text"
                      value={pStone}
                      onChange={(e) => setPStone(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">Available Sizes (Comma Sep)</label>
                    <input
                      type="text"
                      value={pSizes}
                      onChange={(e) => setPSizes(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">Making Charges (₹ Total)</label>
                    <input
                      type="number"
                      required
                      value={pMakingCharge}
                      onChange={(e) => setPMakingCharge(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">Fixed Base Price (If Not Dynamic)</label>
                    <input
                      type="number"
                      value={pBasePrice}
                      onChange={(e) => setPBasePrice(e.target.value)}
                      disabled={pDynamic}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">Stock Inventory Count</label>
                    <input
                      type="number"
                      required
                      value={pInventory}
                      onChange={(e) => setPInventory(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">Discount Percent (%)</label>
                    <input
                      type="number"
                      value={pDiscount}
                      onChange={(e) => setPDiscount(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    />
                  </div>

                  {/* Toggle Pricing Dynamic */}
                  <label className="flex items-center gap-2 text-stone-700 dark:text-stone-300 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pDynamic}
                      onChange={(e) => setPDynamic(e.target.checked)}
                      className="accent-gold w-4 h-4"
                    />
                    <span>Dynamic Metal Spot Pricing</span>
                  </label>

                  {/* Image Uploader */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-stone-400 uppercase tracking-wider block">Product Images Upload</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setSelectedFiles(e.target.files)}
                      className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2 w-full text-stone-500"
                    />
                  </div>

                  {/* Submit / Cancel Buttons */}
                  <div className="sm:col-span-2 flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="border border-stone-300 dark:border-stone-700 text-stone-750 dark:text-stone-300 font-semibold px-4 py-2 uppercase tracking-wider text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold px-6 py-2 uppercase tracking-wider text-[10px] hover:bg-gold dark:hover:bg-gold dark:hover:text-white transition-colors duration-200"
                    >
                      Save Product details
                    </button>
                  </div>

                </form>
              )}

              {/* Products Table grid view */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Image</th>
                      <th className="pb-3 font-semibold">Product Name</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Metal / Spec</th>
                      <th className="pb-3 font-semibold">Price</th>
                      <th className="pb-3 font-semibold">Stock</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                    {adminProducts.map((p) => (
                      <tr key={p._id} className="hover:bg-stone-50/5">
                        <td className="py-3">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-10 h-10 object-cover border border-stone-200 dark:border-stone-800"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=100&q=80'; }}
                          />
                        </td>
                        <td className="py-3 font-medium text-stone-900 dark:text-white max-w-[150px] truncate" title={p.name}>
                          {p.name}
                        </td>
                        <td className="py-3">{p.category}</td>
                        <td className="py-3">
                          {p.purity} | {p.weight}g
                        </td>
                        <td className="py-3 font-semibold text-gold">
                          {formatPrice(p.calculatedPrice?.total || 0)}
                        </td>
                        <td className={`py-3 font-bold ${p.inventory < 5 ? 'text-red-500' : ''}`}>
                          {p.inventory}
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="text-stone-400 hover:text-gold inline-flex p-1"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="text-stone-400 hover:text-red-500 inline-flex p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: CLIENT ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-6 space-y-6 animate-fade-in">
              <h3 className="font-serif text-sm font-semibold tracking-wider text-stone-900 dark:text-white uppercase pb-3 border-b border-stone-100 dark:border-stone-850">
                Manage Client Orders History
              </h3>

              {adminOrders.length === 0 ? (
                <p className="text-stone-400 italic text-xs text-center py-10">No orders registered in store database.</p>
              ) : (
                <div className="space-y-6">
                  {adminOrders.map((ord) => (
                    <div
                      key={ord._id}
                      className="border border-stone-200 dark:border-stone-800 p-4 space-y-4 text-xs bg-stone-50/50 dark:bg-stone-900/10"
                    >
                      {/* Top Header metadata */}
                      <div className="flex flex-col sm:flex-row justify-between border-b border-stone-200 dark:border-stone-800 pb-3 gap-3">
                        <div>
                          <p className="font-bold text-stone-900 dark:text-white">Order ID: #{ord._id}</p>
                          <p className="text-stone-400 text-[10px] mt-0.5">Date: {new Date(ord.createdAt).toLocaleString()}</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Payment status badge */}
                          <span className={`px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                            ord.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.paymentStatus} ({ord.paymentMethod})
                          </span>

                          {/* Order status select dropdown */}
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => handleOrderStatusUpdate(ord._id, e.target.value)}
                            className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:border-gold"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Items and Address list */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Items */}
                        <div className="space-y-2">
                          <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-1">Purchased Ornaments</p>
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-8 h-8 object-cover border border-stone-200 dark:border-stone-800"
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=50&q=80'; }}
                              />
                              <p className="truncate flex-1 font-semibold">{item.name} (x{item.quantity})</p>
                              <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>

                        {/* Address */}
                        <div className="text-stone-500 border-l border-transparent sm:border-stone-200 dark:sm:border-stone-800 pl-0 sm:pl-4 space-y-1">
                          <p className="text-[10px] text-stone-450 uppercase font-bold tracking-wider mb-1">Shipping Details</p>
                          <p className="font-bold text-stone-900 dark:text-white">{ord.shippingAddress.fullName}</p>
                          <p>{ord.shippingAddress.street}</p>
                          <p>{ord.shippingAddress.city}, {ord.shippingAddress.state} - {ord.shippingAddress.zipCode}</p>
                          <p>Phone: {ord.shippingAddress.phone}</p>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LIVE RATES EDITOR */}
          {activeTab === 'rates' && (
            <div className="bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-6 space-y-6 animate-fade-in">
              <h3 className="font-serif text-sm font-semibold tracking-wider text-stone-900 dark:text-white uppercase pb-3 border-b border-stone-100 dark:border-stone-850">
                Update Live Dynamic Metal Spot Rates
              </h3>

              <form onSubmit={handleRatesUpdate} className="space-y-4 max-w-md text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider block">Gold 24K Rate (₹/g)</label>
                    <input
                      type="number"
                      required
                      value={gold24K}
                      onChange={(e) => setGold24K(Number(e.target.value))}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 dark:text-white font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider block">Gold 22K Rate (₹/g)</label>
                    <input
                      type="number"
                      required
                      value={gold22K}
                      onChange={(e) => setGold22K(Number(e.target.value))}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 dark:text-white font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider block">Gold 18K Rate (₹/g)</label>
                    <input
                      type="number"
                      required
                      value={gold18K}
                      onChange={(e) => setGold18K(Number(e.target.value))}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 dark:text-white font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider block">Silver Rate (₹/g)</label>
                    <input
                      type="number"
                      required
                      value={silver}
                      onChange={(e) => setSilver(Number(e.target.value))}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 dark:text-white font-bold"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-stone-400 uppercase tracking-wider block">Platinum Rate (₹/g)</label>
                    <input
                      type="number"
                      required
                      value={platinum}
                      onChange={(e) => setPlatinum(Number(e.target.value))}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 dark:text-white font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn-gold py-3.5 tracking-widest font-semibold flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Recalculate Boutique Catalog Prices
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: DISCOUNTS & COUPONS */}
          {activeTab === 'coupons' && (
            <div className="bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-6 space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Form to Add Coupon */}
                <div className="space-y-4">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white pb-2 border-b border-stone-200 dark:border-stone-800">
                    Add New Promo Code
                  </h4>
                  <form onSubmit={handleAddCoupon} className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-stone-400 uppercase tracking-wider block">Promo Code</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. WELCOME30"
                        value={cCode}
                        onChange={(e) => setCCode(e.target.value.toUpperCase())}
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 dark:text-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-stone-400 uppercase tracking-wider block">Discount Type</label>
                        <select
                          value={cType}
                          onChange={(e) => setCType(e.target.value)}
                          className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="flat">Flat Amount (₹)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-stone-400 uppercase tracking-wider block">Value</label>
                        <input
                          type="number"
                          required
                          value={cVal}
                          onChange={(e) => setCVal(e.target.value)}
                          className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-stone-400 uppercase tracking-wider block">Min Purchase (₹)</label>
                      <input
                        type="number"
                        value={cMin}
                        onChange={(e) => setCMin(e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-stone-900 hover:bg-gold text-white font-semibold uppercase py-3 tracking-widest text-[10px] transition-colors duration-200"
                    >
                      Save Promo Code
                    </button>
                  </form>
                </div>

                {/* List Coupons */}
                <div className="space-y-4">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white pb-2 border-b border-stone-200 dark:border-stone-800">
                    Active Boutique Coupons
                  </h4>
                  
                  {coupons.length === 0 ? (
                    <p className="text-stone-400 italic text-xs">No active coupons exist.</p>
                  ) : (
                    <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                      {coupons.map((c) => (
                        <div
                          key={c._id}
                          className="border border-stone-150 dark:border-stone-800 p-3 flex justify-between items-center text-xs"
                        >
                          <div>
                            <p className="font-bold text-gold uppercase tracking-wider">{c.code}</p>
                            <p className="text-stone-400 mt-0.5 text-[10px]">
                              Value: {c.discountType === 'percentage' ? `${c.discountValue}%` : formatPrice(c.discountValue)} | Min: {formatPrice(c.minPurchaseAmount)}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteCoupon(c._id)}
                            className="text-stone-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
