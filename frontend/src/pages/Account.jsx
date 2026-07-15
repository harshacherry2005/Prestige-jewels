import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { api } from '../utils/api';
import { Heart, MapPin, History, LogOut, ShieldCheck, ShoppingCart, User, Plus, Trash2, ArrowRight } from 'lucide-react';

export default function Account() {
  const {
    user,
    token,
    login,
    signUp,
    logout,
    wishlist,
    toggleWishlist,
    addToCart,
    products,
    saveAddresses,
    navigate
  } = useContext(ShopContext);

  // Tab Selection
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'wishlist', 'addresses'
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');

  // Orders History State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // New Address Form Modal/Toggles
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');
  const [addrPhone, setAddrPhone] = useState('');

  // Load orders history on mount or when token updates
  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      try {
        setLoadingOrders(true);
        const data = await api.get('/orders/mine');
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [token]);

  // Auth Submissions
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signUp(name, email, password);
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert(`Reset instructions sent to ${email} (simulated).`);
    setShowForgot(false);
    setIsLogin(true);
  };

  // Add Address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    const newAddr = {
      fullName: addrName,
      street: addrStreet,
      city: addrCity,
      state: addrState,
      zipCode: addrZip,
      phone: addrPhone,
      isDefault: user.addresses?.length === 0
    };

    const currentAddresses = user.addresses || [];
    const updated = [...currentAddresses, newAddr];
    await saveAddresses(updated);
    
    // Clear forms
    setAddrName('');
    setAddrStreet('');
    setAddrCity('');
    setAddrState('');
    setAddrZip('');
    setAddrPhone('');
    setShowAddressForm(false);
  };

  // Delete Address
  const handleDeleteAddress = async (index) => {
    const currentAddresses = user.addresses || [];
    const updated = currentAddresses.filter((_, idx) => idx !== index);
    await saveAddresses(updated);
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Wishlist products query
  const wishlistProducts = products.filter(p => wishlist.includes(p._id));

  // 1. AUTH SCREEN (LOGIN / SIGN UP / FORGOT)
  if (!token) {
    if (showForgot) {
      return (
        <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-850">
          <div className="text-center mb-8 space-y-2 select-none">
            <h2 className="font-serif text-2xl uppercase tracking-wider text-stone-900 dark:text-white font-semibold">Reset Password</h2>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest">Enter email to restore credentials</p>
          </div>
          <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-stone-400 uppercase tracking-wider block">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patron@prestige.com"
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2.5 focus:outline-none focus:border-gold dark:text-white"
              />
            </div>
            <button type="submit" className="w-full btn-gold py-3.5 tracking-widest font-semibold">
              Send Instructions
            </button>
            <button
              type="button"
              onClick={() => { setShowForgot(false); setIsLogin(true); }}
              className="w-full text-center text-stone-400 hover:text-gold uppercase tracking-wider text-[9px] font-bold block pt-2"
            >
              Back to Login
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-850 shadow-md">
        
        {/* Toggle Switch */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 pb-4 mb-6 text-xs font-bold uppercase tracking-widest">
          <button
            onClick={() => { setIsLogin(true); setAuthError(''); }}
            className={`flex-1 pb-2 border-b-2 transition-all duration-200 ${
              isLogin ? 'text-gold border-gold' : 'text-stone-400 border-transparent hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setAuthError(''); }}
            className={`flex-1 pb-2 border-b-2 transition-all duration-200 ${
              !isLogin ? 'text-gold border-gold' : 'text-stone-400 border-transparent hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-stone-400 uppercase tracking-wider block">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2.5 focus:outline-none focus:border-gold dark:text-white"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-stone-400 uppercase tracking-wider block">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patron@prestige.com"
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2.5 focus:outline-none focus:border-gold dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-baseline">
              <label className="text-stone-400 uppercase tracking-wider">Password</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-stone-400 hover:text-gold uppercase text-[9px] font-bold"
                >
                  Forgot?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2.5 focus:outline-none focus:border-gold dark:text-white"
            />
          </div>

          <button type="submit" className="w-full btn-gold py-3.5 tracking-widest font-semibold mt-2">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {authError && <p className="text-[10px] text-red-500 font-semibold text-center mt-4">{authError}</p>}
      </div>
    );
  }

  // 2. LOGGED IN MEMBER PROFILE SCREEN
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* User Header */}
      <div className="bg-stone-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden border border-gold/25">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-10" />
        <div className="relative flex items-center gap-4">
          <div className="p-3.5 bg-gold/15 rounded-full border border-gold/40 text-gold">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold uppercase tracking-wider">{user?.name}</h2>
            <p className="text-[10px] text-stone-400 tracking-wider flex items-center gap-1.5 uppercase mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" /> Prestige Patron Member ({user?.role})
            </p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="relative flex items-center gap-1.5 bg-stone-800 hover:bg-red-650 hover:text-white text-stone-300 font-bold uppercase text-[10px] tracking-wider px-4 py-2.5 transition-colors duration-200"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {/* Main Tabbed Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column navigation tab menu */}
        <aside className="w-full lg:w-1/4 bg-white dark:bg-stone-900/60 border border-stone-150 dark:border-stone-850 p-4 h-fit flex flex-row lg:flex-col gap-1 select-none">
          {[
            { id: 'orders', label: 'Order History', icon: <History className="w-4 h-4" /> },
            { id: 'wishlist', label: 'Wishlist Catalog', icon: <Heart className="w-4 h-4" /> },
            { id: 'addresses', label: 'Saved Addresses', icon: <MapPin className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-2.5 px-4 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 lg:border-b-0 lg:border-l-2 transition-all duration-300 ${
                activeTab === tab.id
                  ? 'text-gold border-gold bg-gold/5 dark:bg-gold/10'
                  : 'text-stone-400 border-transparent hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Right Column tab details */}
        <main className="flex-1 min-w-0">
          
          {/* TAB 1: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-6 space-y-6">
              <h3 className="font-serif text-sm font-semibold tracking-wider text-stone-900 dark:text-white uppercase pb-3 border-b border-stone-100 dark:border-stone-850">
                Order History History
              </h3>

              {loadingOrders ? (
                <p className="text-stone-400 italic text-xs text-center py-10">Retrieving order database...</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <p className="text-stone-400 italic text-xs">You haven't placed any jewelry orders yet.</p>
                  <button onClick={() => navigate('shop')} className="btn-outline-gold px-6 py-2.5 text-xs font-semibold">
                    Explore Jewelry
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="border border-stone-200 dark:border-stone-800 p-4 space-y-4 text-xs bg-stone-50 dark:bg-stone-900/10"
                    >
                      {/* Top Header details */}
                      <div className="flex flex-col sm:flex-row justify-between border-b border-stone-200 dark:border-stone-800 pb-3 gap-2">
                        <div className="flex flex-wrap gap-4 text-stone-500">
                          <div>
                            <p className="text-[10px] text-stone-450 uppercase font-bold tracking-wider">Date Placed</p>
                            <p className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-stone-450 uppercase font-bold tracking-wider">Order Code</p>
                            <p className="font-medium text-stone-850 dark:text-stone-200 uppercase mt-0.5">
                              #{order._id}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-stone-450 uppercase font-bold tracking-wider">Total Sum</p>
                            <p className="font-bold text-gold mt-0.5">
                              {formatPrice(order.total)}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] text-stone-450 uppercase font-bold tracking-wider text-left sm:text-right">Shipping Status</p>
                          <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mt-1 rounded-none ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>

                      {/* Items loop */}
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-4 items-center">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover border border-stone-200 dark:border-stone-800"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=100&q=80'; }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-stone-900 dark:text-white truncate">{item.name}</p>
                              <p className="text-[10px] text-stone-400 mt-0.5">Size: {item.size} | Qty: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-stone-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-6 space-y-6">
              <h3 className="font-serif text-sm font-semibold tracking-wider text-stone-900 dark:text-white uppercase pb-3 border-b border-stone-100 dark:border-stone-850">
                Your Wishlist ({wishlistProducts.length} items)
              </h3>

              {wishlistProducts.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <p className="text-stone-400 italic text-xs">Your wishlist is currently empty.</p>
                  <button onClick={() => navigate('shop')} className="btn-outline-gold px-6 py-2.5 text-xs font-semibold">
                    Browse Collections
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((p) => {
                    const pricing = p.calculatedPrice || { total: 0 };
                    return (
                      <div
                        key={p._id}
                        className="border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/10 p-3 flex gap-4 items-center relative"
                      >
                        <button
                          onClick={() => toggleWishlist(p._id)}
                          className="absolute top-2 right-2 text-stone-400 hover:text-red-500 p-0.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-16 h-16 object-cover border border-stone-200 dark:border-stone-850"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=100&q=80'; }}
                        />
                        <div className="min-w-0">
                          <h4
                            onClick={() => navigate('product', p._id)}
                            className="text-xs font-bold text-stone-900 dark:text-white hover:text-gold cursor-pointer truncate pr-4"
                          >
                            {p.name}
                          </h4>
                          <p className="text-xs text-gold font-bold mt-1">{formatPrice(pricing.total)}</p>
                          <button
                            onClick={() => { addToCart(p, p.sizes[0] || 'Standard', 1); alert(`${p.name} added to cart.`); }}
                            className="mt-2 text-[10px] text-stone-900 dark:text-white uppercase font-bold tracking-wider hover:text-gold flex items-center gap-1"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-6 space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-stone-100 dark:border-stone-850">
                <h3 className="font-serif text-sm font-semibold tracking-wider text-stone-900 dark:text-white uppercase">
                  Saved Address Locations
                </h3>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-gold font-bold uppercase tracking-wider text-[10px] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Location
                  </button>
                )}
              </div>

              {/* Address Form inline drawer */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-stone-200 dark:border-stone-800 p-4 text-xs bg-stone-50 dark:bg-stone-900/10">
                  <h4 className="sm:col-span-2 font-serif text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                    New Shipping Destination
                  </h4>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-stone-400 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-stone-400 uppercase tracking-wider">Street address</label>
                    <input
                      type="text"
                      required
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      required
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">State / Province</label>
                    <input
                      type="text"
                      required
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">Zip / Postal Code</label>
                    <input
                      type="text"
                      required
                      value={addrZip}
                      onChange={(e) => setAddrZip(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">Phone</label>
                    <input
                      type="tel"
                      required
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2"
                    />
                  </div>
                  <div className="sm:col-span-2 pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="border border-stone-300 dark:border-stone-750 text-stone-750 dark:text-stone-300 font-semibold px-4 py-2 uppercase tracking-wider text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold px-6 py-2 uppercase tracking-wider text-[10px] hover:bg-gold dark:hover:bg-gold dark:hover:text-white transition-colors duration-200"
                    >
                      Save Destination
                    </button>
                  </div>
                </form>
              )}

              {/* List addresses */}
              {(!user.addresses || user.addresses.length === 0) ? (
                <p className="text-stone-400 italic text-xs">No address locations have been saved.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr, idx) => (
                    <div
                      key={idx}
                      className="border border-stone-200 dark:border-stone-800 p-4 text-xs relative flex flex-col justify-between"
                    >
                      <button
                        onClick={() => handleDeleteAddress(idx)}
                        className="absolute top-2 right-2 text-stone-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="space-y-1 pr-6">
                        <p className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                          {addr.fullName} {addr.isDefault && <span className="bg-gold/10 text-gold border border-gold/20 text-[9px] px-1.5 py-0.2 uppercase font-semibold">Default</span>}
                        </p>
                        <p className="text-stone-500 dark:text-stone-400">{addr.street}</p>
                        <p className="text-stone-500 dark:text-stone-400">{addr.city}, {addr.state} - {addr.zipCode}</p>
                        <p className="text-stone-500 dark:text-stone-400">Phone: {addr.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
