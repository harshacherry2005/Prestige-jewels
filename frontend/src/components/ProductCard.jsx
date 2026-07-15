import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Star, Heart, Eye, ShoppingCart, ArrowRightLeft } from 'lucide-react';

export default function ProductCard({ product }) {
  const {
    wishlist,
    toggleWishlist,
    addToCart,
    compareList,
    toggleCompare,
    navigate
  } = useContext(ShopContext);

  const isWishlisted = wishlist.includes(product._id);
  const isCompared = compareList.some(p => p._id === product._id);

  const priceBreakdown = product.calculatedPrice || { total: 0, discountAmount: 0 };
  const hasDiscount = product.discountPercent > 0;
  const originalPrice = Math.round(priceBreakdown.total + priceBreakdown.discountAmount);

  const handleBuyNow = (e) => {
    e.stopPropagation();
    addToCart(product, product.sizes[0] || 'Standard', 1);
    navigate('checkout');
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, product.sizes[0] || 'Standard', 1);
    // Alert or confirmation could go here, let's keep it smooth
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div
      onClick={() => navigate('product', product._id)}
      className="group relative bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full"
    >
      {/* Badge container */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {hasDiscount && (
          <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase">
            {product.discountPercent}% OFF
          </span>
        )}
        {product.collectionType === 'Premium' && (
          <span className="bg-gold text-white text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase">
            Premium
          </span>
        )}
      </div>

      {/* Action Overlays */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}
          className={`p-2 rounded-full shadow-md transition-colors duration-200 ${
            isWishlisted
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-red-500'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleCompare(product); }}
          className={`p-2 rounded-full shadow-md transition-colors duration-200 ${
            isCompared
              ? 'bg-gold text-white hover:bg-gold-dark'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-gold'
          }`}
          title="Compare Product"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Product Image */}
      <div className="aspect-square bg-stone-50 dark:bg-stone-850 overflow-hidden relative border-b border-stone-100 dark:border-stone-850">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=600&q=80';
          }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-350" />
      </div>

      {/* Info Container */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-widest block mb-1">
            {product.category}
          </span>
          
          {/* Product Name */}
          <h4 className="font-serif text-sm text-stone-900 dark:text-white font-medium group-hover:text-gold transition-colors duration-200 truncate">
            {product.name}
          </h4>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5 mb-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(product.rating || 4.5) ? 'fill-current' : 'text-stone-300 dark:text-stone-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-stone-500 dark:text-stone-400">
              ({product.rating})
            </span>
          </div>
        </div>

        {/* Pricing & Buy buttons */}
        <div className="mt-2">
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-sans font-semibold text-sm text-stone-900 dark:text-white">
              {formatPrice(priceBreakdown.total)}
            </span>
            {hasDiscount && (
              <span className="font-sans text-xs text-stone-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-350">
            <button
              onClick={handleAddToCart}
              className="border border-stone-200 dark:border-stone-700 hover:border-gold dark:hover:border-gold text-stone-800 dark:text-stone-200 hover:text-gold text-[10px] uppercase tracking-wider py-2 font-medium flex items-center justify-center gap-1 transition-all duration-300"
            >
              <ShoppingCart className="w-3 h-3" />
              Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="bg-gold hover:bg-gold-dark text-white text-[10px] uppercase tracking-wider py-2 font-medium transition-colors duration-300"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
