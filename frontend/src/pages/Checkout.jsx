import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { api } from '../utils/api';
import { ShieldCheck, Truck, CreditCard, ChevronRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Checkout() {
  const {
    cart,
    clearCart,
    user,
    token,
    login,
    navigate
  } = useContext(ShopContext);

  const [summary, setSummary] = useState(null);
  
  // Checkout Steps
  const [activeStep, setActiveStep] = useState(1); // 1: Shipping/Address, 2: Payment, 3: Success

  // Auth fields for inline checkout sign-in
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Shipping Address Fields
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  
  // Confetti celebration variables
  const [createdOrder, setCreatedOrder] = useState(null);

  // Load summary state
  useEffect(() => {
    const saved = localStorage.getItem('prestige_checkout_summary');
    if (saved) {
      setSummary(JSON.parse(saved));
    } else {
      // Fallback calculations if not found
      navigate('cart');
    }
  }, []);

  // Pre-populate address if user is logged in
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setFullName(defAddr.fullName || '');
      setStreet(defAddr.street || '');
      setCity(defAddr.city || '');
      setState(defAddr.state || '');
      setZipCode(defAddr.zipCode || '');
      setPhone(defAddr.phone || '');
    }
  }, [user]);

  const handleInlineLogin = async (e) => {
    e.preventDefault();
    try {
      setAuthError('');
      await login(email, password);
    } catch (err) {
      setAuthError(err.message || 'Login failed');
    }
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !street || !city || !state || !zipCode || !phone) {
      alert('Please fill out all address fields.');
      return;
    }
    setActiveStep(2);
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, animate a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handlePlaceOrder = async () => {
    const orderItems = cart.map(item => {
      const pricing = item.product.calculatedPrice || { total: 0 };
      return {
        productId: item.product._id,
        name: item.product.name,
        image: item.product.images[0],
        size: item.size,
        metalType: item.product.metalType,
        purity: item.product.purity,
        weight: item.product.weight,
        price: pricing.total,
        quantity: item.quantity
      };
    });

    const orderData = {
      items: orderItems,
      shippingAddress: { fullName, street, city, state, zipCode, phone },
      paymentMethod,
      subtotal: summary.subtotal,
      discount: summary.discount,
      gst: summary.gst,
      shipping: summary.shipping,
      total: summary.total
    };

    try {
      const order = await api.post('/orders', orderData);
      setCreatedOrder(order);
      setActiveStep(3);
      clearCart();
      localStorage.removeItem('prestige_checkout_summary');
      triggerConfetti();
    } catch (err) {
      alert(err.message || 'Error placing order. Please try again.');
    }
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (cart.length === 0 && activeStep !== 3) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-400 font-serif italic text-lg">Your cart is empty. Redirecting...</p>
        <button onClick={() => navigate('home')} className="btn-gold mt-4">Go Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-4 text-xs font-semibold uppercase tracking-wider text-stone-400 select-none">
        <span className={activeStep === 1 ? 'text-gold' : 'text-stone-700 dark:text-stone-300'}>Shipping Address</span>
        <ChevronRight className="w-4 h-4 text-stone-350" />
        <span className={activeStep === 2 ? 'text-gold' : ''}>Secure Payment</span>
        <ChevronRight className="w-4 h-4 text-stone-355" />
        <span className={activeStep === 3 ? 'text-gold' : ''}>Order Confirmation</span>
      </div>

      {/* STEP 1 & 2 DUAL LAYOUT */}
      {activeStep < 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT 2 COLUMNS: ADRESS OR PAYMENT FORM */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Inline Login Option for Guests */}
            {!token && activeStep === 1 && (
              <div className="bg-stone-50 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-800 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-sm font-semibold tracking-wider text-stone-900 dark:text-white uppercase">
                    Returning Patron? Login to auto-fill address
                  </h3>
                </div>
                <form onSubmit={handleInlineLogin} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <input
                    type="email"
                    required
                    placeholder="patron@prestige.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 px-3 py-2"
                  />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 px-3 py-2"
                  />
                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-gold text-white font-semibold uppercase tracking-wider py-2 transition-colors duration-300"
                  >
                    Log In
                  </button>
                </form>
                {authError && <p className="text-[10px] text-red-500 font-semibold">{authError}</p>}
              </div>
            )}

            {/* Address Form (Step 1) */}
            {activeStep === 1 && (
              <div className="bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-6 space-y-6">
                <h3 className="font-serif text-md tracking-wider text-stone-900 dark:text-white uppercase pb-3 border-b border-stone-100 dark:border-stone-800">
                  Shipping Destination
                </h3>
                
                <form onSubmit={handleAddressSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2.5 focus:outline-none focus:border-gold dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">Street Address</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Apt, Suite, Street address"
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2.5 focus:outline-none focus:border-gold dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Los Angeles"
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2.5 focus:outline-none focus:border-gold dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">State / Province</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="California"
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2.5 focus:outline-none focus:border-gold dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">Zip / Postal Code</label>
                    <input
                      type="text"
                      required
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/\D/g,''))}
                      placeholder="90001"
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2.5 focus:outline-none focus:border-gold dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g,''))}
                      placeholder="10 digit number"
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2.5 focus:outline-none focus:border-gold dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="sm:col-span-2 w-full btn-gold py-3.5 tracking-widest font-semibold flex items-center justify-center gap-1.5"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {/* Payment Panel (Step 2) */}
            {activeStep === 2 && (
              <div className="bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-6 space-y-6">
                <h3 className="font-serif text-md tracking-wider text-stone-900 dark:text-white uppercase pb-3 border-b border-stone-100 dark:border-stone-800">
                  Secure Checkout Payment
                </h3>
                
                {/* Delivery details brief */}
                <div className="text-xs border-b border-stone-100 dark:border-stone-800 pb-4 text-stone-550 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-stone-900 dark:text-white">Shipping to:</p>
                    <p className="mt-0.5">{fullName}, {street}, {city}, {state} - {zipCode}</p>
                  </div>
                  <button onClick={() => setActiveStep(1)} className="text-gold font-bold uppercase tracking-wider text-[10px]">
                    Change Destination
                  </button>
                </div>

                {/* Selection lists */}
                <div className="space-y-3">
                  {[
                    { id: 'Credit Card', label: 'Credit Card', desc: 'Secure visa, mastercard, or amex details.' },
                    { id: 'Debit Card', label: 'Debit Card', desc: 'Secure direct checking card checkout.' },
                    { id: 'UPI', label: 'UPI / Instant Banking', desc: 'Scan and pay instantly using GooglePay or PhonePe.' },
                    { id: 'Net Banking', label: 'Net Banking', desc: 'Secure authentication transfer from major banks.' },
                    { id: 'COD', label: 'Cash on Delivery (COD)', desc: 'Pay with cash upon package receipt.' }
                  ].map(opt => (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-4 p-4 border cursor-pointer select-none transition-all duration-300 ${
                        paymentMethod === opt.id
                          ? 'border-gold bg-gold/5 dark:bg-gold/10 shadow-sm'
                          : 'border-stone-200 dark:border-stone-800 hover:border-gold'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.id}
                        checked={paymentMethod === opt.id}
                        onChange={() => setPaymentMethod(opt.id)}
                        className="mt-1 accent-gold"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-stone-900 dark:text-white uppercase tracking-wider">{opt.label}</p>
                        <p className="text-stone-400 mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="pt-2 flex gap-4">
                  <button
                    onClick={() => setActiveStep(1)}
                    className="border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold uppercase tracking-wider py-3.5 px-6 text-xs hover:border-gold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="flex-1 btn-gold py-3.5 tracking-widest font-semibold flex items-center justify-center gap-1.5"
                  >
                    Complete Checkout Payment ({formatPrice(summary?.total)})
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: SUMMARY BRIEF */}
          <div className="bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-6 h-fit space-y-6">
            <h3 className="font-serif text-sm font-semibold tracking-wider text-stone-900 dark:text-white uppercase pb-3 border-b border-stone-100 dark:border-stone-800">
              Order Items
            </h3>
            
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-4 text-xs items-center">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover border border-stone-200 dark:border-stone-800"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=100&q=80'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 dark:text-white truncate">{item.product.name}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">Size: {item.size} | Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-stone-900 dark:text-white">
                    {formatPrice((item.product.calculatedPrice?.total || 0) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {summary && (
              <div className="border-t border-stone-200 dark:border-stone-850 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(summary.subtotal)}</span>
                </div>
                {summary.discount > 0 && (
                  <div className="flex justify-between text-red-500 font-semibold">
                    <span>Discount Code Applied</span>
                    <span>-{formatPrice(summary.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-500">
                  <span>GST (3%)</span>
                  <span>{formatPrice(summary.gst)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Fully Insured Shipping</span>
                  <span>{summary.shipping === 0 ? 'FREE' : formatPrice(summary.shipping)}</span>
                </div>
                <div className="border-t border-stone-200 dark:border-stone-800 pt-3 flex justify-between font-bold text-stone-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-gold text-base">{formatPrice(summary.total)}</span>
                </div>
              </div>
            )}

            <div className="text-[10px] text-stone-400 space-y-2 select-none">
              <p className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-gold" /> SSL Encrypted Gateway.</p>
              <p className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-gold" /> Free fully-insured shipping.</p>
            </div>
          </div>

        </div>
      )}

      {/* STEP 3: ORDER SUCCESS CONGRATS */}
      {activeStep === 3 && createdOrder && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-10 text-center space-y-6 select-none">
          <div className="inline-flex p-4 bg-gold/10 rounded-full text-gold mb-2 animate-bounce">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="font-serif text-3xl text-stone-900 dark:text-white uppercase tracking-wider font-semibold">
            Order Placed Successfully!
          </h2>
          <p className="text-stone-400 text-xs uppercase tracking-widest leading-relaxed">
            Thank you for shopping with Prestige. Your order has been registered, <br /> and a hallmark certificate will be dispatched with your shipment package.
          </p>

          <div className="border-y border-stone-200 dark:border-stone-800 py-6 text-xs text-stone-600 dark:text-stone-300 space-y-2.5 max-w-md mx-auto">
            <div className="flex justify-between">
              <span>Order Reference ID</span>
              <span className="font-bold text-stone-900 dark:text-white uppercase">{createdOrder._id}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Address</span>
              <span className="font-medium text-stone-900 dark:text-white truncate max-w-[250px]">{street}, {city}</span>
            </div>
            <div className="flex justify-between">
              <span>Grand Total</span>
              <span className="font-bold text-gold">{formatPrice(createdOrder.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shipping Time</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">3-5 Business Days</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('account')}
              className="btn-gold px-8 py-3.5 text-xs font-semibold"
            >
              View Order History
            </button>
            <button
              onClick={() => navigate('shop')}
              className="btn-outline-gold px-8 py-3.5 text-xs font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
