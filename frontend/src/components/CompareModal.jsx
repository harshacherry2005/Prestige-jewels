import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { X, ShoppingCart, Info } from 'lucide-react';

export default function CompareModal() {
  const { compareList, toggleCompare, clearCompare, addToCart, navigate } = useContext(ShopContext);

  if (compareList.length === 0) return null;

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleAddToCart = (product) => {
    addToCart(product, product.sizes[0] || 'Standard', 1);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 shadow-2xl p-6 transition-transform duration-500 max-h-[90vh] overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-gold" />
            <h3 className="font-serif text-lg text-stone-900 dark:text-white font-medium tracking-wide">
              Compare Products ({compareList.length}/3)
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={clearCompare}
              className="text-xs uppercase tracking-wider text-stone-500 hover:text-red-500 font-medium"
            >
              Clear All
            </button>
            <button
              onClick={clearCompare}
              className="p-1 text-stone-400 hover:text-stone-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {compareList.map((product) => {
            const pricing = product.calculatedPrice || { total: 0 };
            return (
              <div
                key={product._id}
                className="border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 p-4 relative flex flex-col justify-between"
              >
                <button
                  onClick={() => toggleCompare(product)}
                  className="absolute top-2 right-2 text-stone-400 hover:text-red-500 p-1"
                >
                  <X className="w-4 h-4" />
                </button>

                <div>
                  {/* Photo & Name */}
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-16 h-16 object-cover border border-stone-200 dark:border-stone-700"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=100&q=80';
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest">{product.category}</p>
                      <h4
                        onClick={() => { navigate('product', product._id); clearCompare(); }}
                        className="text-xs font-semibold text-stone-900 dark:text-white truncate cursor-pointer hover:text-gold"
                      >
                        {product.name}
                      </h4>
                      <p className="text-xs font-bold text-gold mt-1">
                        {formatPrice(pricing.total)}
                      </p>
                    </div>
                  </div>

                  {/* Attributes table */}
                  <div className="space-y-2 border-t border-stone-200 dark:border-stone-800 pt-3 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-stone-500 dark:text-stone-400">Metal Type</span>
                      <span className="font-medium text-stone-900 dark:text-white">{product.metalType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 dark:text-stone-400">Purity</span>
                      <span className="font-medium text-stone-900 dark:text-white">{product.purity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 dark:text-stone-400">Weight</span>
                      <span className="font-medium text-stone-900 dark:text-white">{product.weight}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 dark:text-stone-400">Stones</span>
                      <span className="font-medium text-stone-900 dark:text-white truncate max-w-[150px]" title={product.stoneDetails}>
                        {product.stoneDetails}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 dark:text-stone-400">Purity Check</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">Hallmark Certified</span>
                    </div>
                  </div>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  className="mt-4 w-full bg-stone-900 hover:bg-gold text-white dark:bg-stone-850 dark:hover:bg-gold text-[10px] py-2 uppercase tracking-wider font-semibold transition-colors duration-300 flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Add To Cart
                </button>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
