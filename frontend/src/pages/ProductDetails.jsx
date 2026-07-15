import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { api } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Star, ShieldCheck, Heart, Truck, HelpCircle, ShoppingCart, MessageSquare, ChevronRight } from 'lucide-react';

export default function ProductDetails() {
  const {
    pageParam,
    navigate,
    addToCart,
    wishlist,
    toggleWishlist,
    addToRecentlyViewed,
    getAIRecommendations,
    loadCatalog
  } = useContext(ShopContext);

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('Standard');
  const [qty, setQty] = useState(1);
  const [zipCode, setZipCode] = useState('');
  const [deliveryDays, setDeliveryDays] = useState(null);
  
  // Review inputs
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  
  // Magnifier Zoom state
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  // Load product details
  useEffect(() => {
    const fetchDetails = async () => {
      if (!pageParam) return;
      try {
        const prod = await api.get(`/products/${pageParam}`);
        setProduct(prod);
        setActiveImage(prod.images[0]);
        setSelectedSize(prod.sizes[0] || 'Standard');
        addToRecentlyViewed(prod);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDetails();
  }, [pageParam]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-stone-400 font-serif italic">
        Loading product details...
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product._id);
  const pricing = product.calculatedPrice || { total: 0, metalValue: 0, makingCharge: 0, discountAmount: 0, gstAmount: 0 };
  const hasDiscount = product.discountPercent > 0;
  const originalTotal = pricing.total + pricing.discountAmount;

  // Zoom Handler (Magnifier)
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  // ZIP Delivery Calculator
  const handleZipCheck = (e) => {
    e.preventDefault();
    if (!zipCode.trim()) return;
    
    // Simulate lookup
    const days = Math.floor(Math.random() * 4) + 2; // 2-5 days
    setDeliveryDays(days);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName.trim()) return;

    try {
      const updated = await api.post(`/products/${product._id}/reviews`, {
        customerName: reviewName,
        rating: reviewRating,
        text: reviewText
      });
      setProduct(updated);
      setReviewName('');
      setReviewText('');
      setReviewRating(5);
      alert('Thank you! Your review has been added.');
      loadCatalog();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, qty);
    alert(`${product.name} added to cart.`);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, qty);
    navigate('checkout');
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const recommended = getAIRecommendations(product);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-stone-500 uppercase tracking-widest">
        <span className="cursor-pointer hover:text-gold" onClick={() => navigate('home')}>Home</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="cursor-pointer hover:text-gold" onClick={() => navigate('shop')}>Shop</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="truncate text-stone-900 dark:text-white max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT COLUMN: IMAGES */}
        <div className="space-y-4">
          
          {/* Main Display Image with Zoom Magnifier */}
          <div
            className="w-full aspect-square bg-stone-50 dark:bg-stone-850 relative overflow-hidden border border-stone-200 dark:border-stone-800"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover cursor-crosshair"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=600&q=80';
              }}
            />
            
            {/* Custom Zoom Overlay Lens */}
            <div
              style={zoomStyle}
              className="absolute inset-0 pointer-events-none border border-gold/40 shadow-inner z-10"
            />
          </div>

          {/* Thumbnail Gallery Row */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 flex-shrink-0 border p-1 bg-white dark:bg-stone-900 ${
                    activeImage === img ? 'border-gold' : 'border-stone-250 dark:border-stone-800'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: DETAIL METADATA */}
        <div className="space-y-6 flex flex-col justify-between">
          
          <div className="space-y-4">
            <span className="text-xs text-gold font-semibold uppercase tracking-[0.3em] block">
              {product.collectionType} Collection
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-white font-medium">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(product.rating) ? 'fill-current' : 'text-stone-250 dark:text-stone-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {product.rating} ({product.reviewsCount} reviews)
              </span>
            </div>

            {/* Spec Highlights Table */}
            <div className="grid grid-cols-2 gap-4 border-y border-stone-200 dark:border-stone-800 py-4 text-xs">
              <div>
                <p className="text-stone-400">Metal Purity</p>
                <p className="font-semibold text-stone-900 dark:text-white mt-0.5">{product.purity} ({product.metalType})</p>
              </div>
              <div>
                <p className="text-stone-400">Net Weight</p>
                <p className="font-semibold text-stone-900 dark:text-white mt-0.5">{product.weight} grams</p>
              </div>
              <div>
                <p className="text-stone-400">Stone Details</p>
                <p className="font-semibold text-stone-900 dark:text-white mt-0.5 truncate">{product.stoneDetails}</p>
              </div>
              <div>
                <p className="text-stone-400">Availability</p>
                <p className={`font-semibold mt-0.5 ${product.inventory > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {product.inventory > 0 ? `In Stock (${product.inventory} units)` : 'Out of Stock'}
                </p>
              </div>
            </div>

            {/* Premium Dynamic Pricing Breakdown */}
            <div className="bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 p-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-stone-500 dark:text-stone-400 text-xs">Dynamic Price breakdown:</span>
                <span className="font-bold text-xl text-gold">{formatPrice(pricing.total)}</span>
              </div>
              
              <div className="border-t border-stone-200 dark:border-stone-800 pt-3 space-y-1.5 text-xs text-stone-600 dark:text-stone-450">
                {product.isPriceDynamic ? (
                  <>
                    <div className="flex justify-between">
                      <span>Metal Value ({product.weight}g * Spot Rate)</span>
                      <span>{formatPrice(pricing.metalValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Making Charges</span>
                      <span>{formatPrice(pricing.makingCharge)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span>Base Metal Price</span>
                    <span>{formatPrice(product.basePrice)}</span>
                  </div>
                )}
                {pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-red-500 font-medium">
                    <span>Discounted Value ({product.discountPercent}% Off)</span>
                    <span>-{formatPrice(pricing.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST ({product.gstPercent}%)</span>
                  <span>{formatPrice(pricing.gstAmount)}</span>
                </div>
              </div>
            </div>

            {/* Select Size */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">Select Size</span>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-xs font-bold transition-all border ${
                        selectedSize === size
                          ? 'bg-stone-900 border-stone-900 text-white dark:bg-white dark:border-white dark:text-stone-900'
                          : 'bg-transparent border-stone-300 text-stone-700 dark:text-stone-300 dark:border-stone-700 hover:border-gold'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Wishlist */}
            <div className="flex gap-4 items-center">
              <div className="space-y-1 w-20">
                <span className="text-[9px] text-stone-400 uppercase font-bold tracking-wider block">Qty</span>
                <div className="flex border border-stone-300 dark:border-stone-700 items-center justify-between">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-2 py-1 text-sm dark:text-white">-</button>
                  <span className="text-xs font-bold dark:text-white">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-2 py-1 text-sm dark:text-white">+</button>
                </div>
              </div>

              <div className="flex-1 flex gap-2 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.inventory === 0}
                  className="flex-1 border border-gold hover:bg-gold hover:text-white text-gold font-semibold uppercase tracking-wider text-xs py-3.5 transition-all duration-300 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.inventory === 0}
                  className="flex-1 bg-gold hover:bg-gold-dark text-white font-semibold uppercase tracking-wider text-xs py-3.5 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className={`border border-stone-200 dark:border-stone-800 p-3.5 hover:text-red-500 transition-colors duration-300 ${
                    isWishlisted ? 'text-red-500' : 'text-stone-400'
                  }`}
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>

          </div>

          {/* Delivery estimate */}
          <div className="border-t border-stone-200 dark:border-stone-800 pt-6 space-y-3">
            <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">Delivery Estimate</span>
            <form onSubmit={handleZipCheck} className="flex gap-2">
              <input
                type="text"
                maxLength="6"
                placeholder="Enter Zip Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g,''))}
                className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 text-xs focus:outline-none focus:border-gold dark:text-white w-40"
              />
              <button
                type="submit"
                className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-4 text-xs font-semibold uppercase tracking-wider hover:bg-gold transition-colors duration-300"
              >
                Check
              </button>
            </form>
            {deliveryDays !== null && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Truck className="w-4 h-4" /> Secure, insured delivery in {deliveryDays} business days.
              </p>
            )}
          </div>

        </div>

      </div>

      {/* CUSTOMER REVIEWS & FORM */}
      <section className="border-t border-stone-200 dark:border-stone-850 pt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Reviews Left: Add Review */}
        <div className="space-y-6">
          <h3 className="font-serif text-lg text-stone-900 dark:text-white font-medium uppercase tracking-wider">
            Write a Review
          </h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-stone-400 uppercase tracking-wider">Your Name</label>
              <input
                type="text"
                required
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                placeholder="Eleanor Vance"
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2.5 focus:outline-none focus:border-gold dark:text-white"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-stone-400 uppercase tracking-wider">Rating</label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2.5 focus:outline-none focus:border-gold dark:text-white"
              >
                <option value="5">5 Stars (Excellent)</option>
                <option value="4">4 Stars (Good)</option>
                <option value="3">3 Stars (Average)</option>
                <option value="2">2 Stars (Poor)</option>
                <option value="1">1 Star (Terrible)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-stone-400 uppercase tracking-wider">Your Comments</label>
              <textarea
                rows="4"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell us about the craftsmanship and details..."
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2.5 focus:outline-none focus:border-gold dark:text-white"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-stone-900 hover:bg-gold text-white font-semibold uppercase tracking-widest text-[10px] w-full py-3.5 transition-colors duration-300"
            >
              Submit Review
            </button>
          </form>
        </div>

        {/* Reviews Right: List reviews */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-serif text-lg text-stone-900 dark:text-white font-medium uppercase tracking-wider">
            Patron Reviews ({product.reviewsCount})
          </h3>
          
          {product.reviews && product.reviews.length === 0 ? (
            <p className="text-stone-400 italic text-xs">No reviews have been written for this jewelry yet.</p>
          ) : (
            <div className="space-y-6 divide-y divide-stone-150 dark:divide-stone-800">
              {product.reviews.map((rev, idx) => (
                <div key={idx} className={`${idx > 0 ? 'pt-6' : ''} space-y-2`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-900 dark:text-white">{rev.customerName}</span>
                    <span className="text-stone-400">{new Date(rev.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-stone-300'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed italic">
                    "{rev.text}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* AI RECOMMENDATIONS */}
      {recommended.length > 0 && (
        <section className="border-t border-stone-200 dark:border-stone-850 pt-16 space-y-8">
          <h3 className="font-serif text-xl tracking-wider text-stone-900 dark:text-white uppercase text-center">
            AI Recommended for You
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recommended.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
