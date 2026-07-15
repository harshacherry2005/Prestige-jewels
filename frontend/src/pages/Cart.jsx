import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { api } from '../utils/api';
import { Trash2, Heart, ShieldCheck, Ticket, ArrowRight } from 'lucide-react';

export default function Cart() {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    toggleWishlist,
    navigate
  } = useContext(ShopContext);

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Price calculations
  const subtotal = cart.reduce((sum, item) => {
    const pricing = item.product.calculatedPrice || { total: 0 };
    return sum + pricing.total * item.quantity;
  }, 0);

  const discountVal = appliedCoupon
    ? appliedCoupon.discountType === 'percentage'
      ? Math.round(subtotal * (appliedCoupon.discountValue / 100))
      : appliedCoupon.discountValue
    : 0;

  const afterDiscount = Math.max(0, subtotal - discountVal);
  const gstPercent = 3; // 3% dynamic GST
  const gstAmt = Math.round(afterDiscount * (gstPercent / 100));
  const shippingAmt = subtotal > 50000 || subtotal === 0 ? 0 : 500; // Free shipping above 50,000 INR
  const total = afterDiscount + gstAmt + shippingAmt;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setCouponError('');
      const data = await api.post('/coupons/validate', {
        code: couponCode,
        subtotal
      });
      setAppliedCoupon(data);
    } catch (err) {
      setCouponError(err.message || 'Failed to validate coupon');
      setAppliedCoupon(null);
    }
  };

  const handleSaveForLater = (item) => {
    // Add to wishlist
    toggleWishlist(item.product._id);
    // Remove from cart
    removeFromCart(item.product._id, item.size);
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleCheckout = () => {
    // Save calculation state to localStorage to retrieve at Checkout page
    const checkoutSummary = {
      subtotal,
      discount: discountVal,
      gst: gstAmt,
      shipping: shippingAmt,
      total,
      couponApplied: appliedCoupon ? appliedCoupon.code : ''
    };
    localStorage.setItem('prestige_checkout_summary', JSON.stringify(checkoutSummary));
    navigate('checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <h2 className="font-serif text-2xl text-stone-900 dark:text-white">Your Cart is Empty</h2>
        <p className="text-stone-400 text-xs uppercase tracking-widest">Add some timeless treasures to begin your shopping experience</p>
        <button
          onClick={() => navigate('shop')}
          className="btn-gold px-8 py-3 font-semibold"
        >
          Explore Collections
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-850 pb-6">
        <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-white uppercase tracking-wider font-semibold">
          Shopping Cart
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT COLUMN: PRODUCTS LIST */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, idx) => {
            const pricing = item.product.calculatedPrice || { total: 0 };
            return (
              <div
                key={idx}
                className="bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-4 flex flex-col sm:flex-row gap-6 relative"
              >
                {/* Product Image */}
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover border border-stone-200 dark:border-stone-800"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=100&q=80'; }}
                />

                {/* Metadata */}
                <div className="flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-stone-900 dark:text-white">{item.product.name}</h3>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      Metal: {item.product.purity} | Weight: {item.product.weight}g | Size: {item.size}
                    </p>
                  </div>

                  {/* Quantity & Actions row */}
                  <div className="flex items-center justify-between pt-2">
                    {/* Qty Selector */}
                    <div className="flex border border-stone-300 dark:border-stone-700 items-center justify-between w-20">
                      <button
                        onClick={() => updateCartQuantity(item.product._id, item.size, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs dark:text-white"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product._id, item.size, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs dark:text-white"
                      >
                        +
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-stone-400">
                      <button
                        onClick={() => handleSaveForLater(item)}
                        className="hover:text-gold flex items-center gap-1.5"
                      >
                        <Heart className="w-3.5 h-3.5" /> Save For Later
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product._id, item.size)}
                        className="hover:text-red-500 flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right flex sm:flex-col justify-between sm:justify-start items-baseline sm:items-end">
                  <p className="text-xs text-stone-400 block sm:hidden">Price:</p>
                  <p className="font-bold text-stone-900 dark:text-white text-sm">
                    {formatPrice(pricing.total * item.quantity)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-[10px] text-stone-400">
                      ({formatPrice(pricing.total)} / piece)
                    </p>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: PRICE SUMMARY & COUPONS */}
        <div className="space-y-6">
          
          {/* Coupon Entry */}
          <div className="bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-6 space-y-4">
            <h3 className="font-serif text-sm font-semibold tracking-wider text-stone-900 dark:text-white uppercase flex items-center gap-2">
              <Ticket className="w-4 h-4 text-gold" /> Offer Coupon Code
            </h3>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. GOLD20, WELCOME10"
                className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 text-xs focus:outline-none focus:border-gold dark:text-white"
              />
              <button
                type="submit"
                className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-4 text-xs font-bold uppercase tracking-wider hover:bg-gold hover:text-white transition-colors duration-300"
              >
                Apply
              </button>
            </form>
            {appliedCoupon && (
              <p className="text-xs text-emerald-600 font-semibold">
                ✔ Coupon {appliedCoupon.code} applied! Saved {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : formatPrice(appliedCoupon.discountValue)}.
              </p>
            )}
            {couponError && (
              <p className="text-xs text-red-500 font-semibold">{couponError}</p>
            )}
          </div>

          {/* Pricing breakdown summary */}
          <div className="bg-white dark:bg-stone-900/40 border border-stone-150 dark:border-stone-850 p-6 space-y-4">
            <h3 className="font-serif text-sm font-semibold tracking-wider text-stone-900 dark:text-white uppercase pb-3 border-b border-stone-100 dark:border-stone-800">
              Order Summary
            </h3>
            
            <div className="space-y-2.5 text-xs text-stone-655 dark:text-stone-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-stone-900 dark:text-white">{formatPrice(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-red-500 font-semibold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-{formatPrice(discountVal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (3%)</span>
                <span className="font-medium text-stone-900 dark:text-white">{formatPrice(gstAmt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fully Insured Shipping</span>
                <span className="font-medium text-stone-900 dark:text-white">
                  {shippingAmt === 0 ? 'FREE' : formatPrice(shippingAmt)}
                </span>
              </div>
            </div>

            <div className="border-t border-stone-200 dark:border-stone-800 pt-4 flex justify-between font-bold text-stone-900 dark:text-white">
              <span>Total Price</span>
              <span className="text-gold text-lg">{formatPrice(total)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full btn-gold py-3.5 tracking-widest font-semibold flex items-center justify-center gap-1.5 mt-2"
            >
              Secure Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-stone-400 text-center flex items-center justify-center gap-1.5 pt-2 select-none">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" /> Encrypted SSL connection & hallmark warranty.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
