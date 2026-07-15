import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, Search, RotateCcw } from 'lucide-react';

export default function Shop() {
  const { products, pageParam, setPageParam } = useContext(ShopContext);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [metalType, setMetalType] = useState('All');
  const [collectionType, setCollectionType] = useState('All'); // Premium vs Ordinary
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [maxWeight, setMaxWeight] = useState(100);
  const [gender, setGender] = useState('All');

  // Load route params if redirected from Home or Search
  useEffect(() => {
    if (pageParam) {
      if (pageParam.category) {
        setSelectedCategory(pageParam.category);
      }
      if (pageParam.search) {
        setSearch(pageParam.search);
      }
      // Reset parameter once applied to state
      setPageParam(null);
    }
  }, [pageParam, setPageParam]);

  // Categories list
  const categories = [
    'All',
    'Premium Necklaces',
    'Premium Chains',
    'Premium Bangles',
    'Premium Rings',
    'Premium Earrings',
    'Premium Bridal Sets',
    'Chains',
    'Bangles',
    'Rings',
    'Earrings',
    'Pendants',
    'Anklets'
  ];

  // Apply filters
  const filteredProducts = products.filter(product => {
    const pricing = product.calculatedPrice || { total: 0 };
    
    // Search match
    if (search.trim() && !product.name.toLowerCase().includes(search.toLowerCase()) && !product.category.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    // Category match
    if (selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false;
    }
    // Metal type match
    if (metalType !== 'All' && product.metalType.toLowerCase() !== metalType.toLowerCase()) {
      return false;
    }
    // Collection match
    if (collectionType !== 'All' && product.collectionType !== collectionType) {
      return false;
    }
    // Price match
    if (pricing.total > maxPrice) {
      return false;
    }
    // Weight match
    if (product.weight > maxWeight) {
      return false;
    }
    // Gender match (implied tags check in name/description)
    if (gender !== 'All') {
      const gLow = gender.toLowerCase();
      const tags = (product.name + ' ' + product.description).toLowerCase();
      if (gLow === 'men' && !tags.includes('men') && !tags.includes('groom')) return false;
      if (gLow === 'women' && tags.includes('men') && !tags.includes('women') && !tags.includes('bridal') && !tags.includes('bride')) return false;
    }

    return true;
  });

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setMetalType('All');
    setCollectionType('All');
    setMaxPrice(1000000);
    setMaxWeight(100);
    setGender('All');
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="text-center mb-12 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-serif uppercase tracking-wider text-stone-900 dark:text-white">
          Our Collections
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 tracking-widest uppercase">
          Browse luxury hallmark jewellery and affordable everyday ornaments
        </p>
        <div className="w-16 h-[1.5px] bg-gold mx-auto mt-4" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* FILTERS PANEL */}
        <aside className="w-full lg:w-1/4 bg-white dark:bg-stone-900/60 border border-stone-150 dark:border-stone-850 p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
            <h3 className="font-serif text-sm font-semibold tracking-wider text-stone-900 dark:text-white uppercase flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gold" /> Filter Settings
            </h3>
            <button
              onClick={resetFilters}
              className="text-stone-400 hover:text-gold text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 transition-colors duration-200"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <label className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">Search Keywords</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, collection, etc..."
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 pr-9 text-xs focus:outline-none focus:border-gold dark:text-white"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3" />
            </div>
          </div>

          {/* Premium vs Ordinary */}
          <div className="space-y-2">
            <label className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">Range Segment</label>
            <div className="flex gap-2">
              {[
                { id: 'All', label: 'All' },
                { id: 'Premium', label: 'Premium' },
                { id: 'Ordinary', label: 'Everyday' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setCollectionType(opt.id)}
                  className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider border transition-colors duration-200 ${
                    collectionType === opt.id
                      ? 'bg-gold text-white border-gold'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 text-xs focus:outline-none focus:border-gold dark:text-white"
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Metal Type */}
          <div className="space-y-2">
            <label className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">Metal Material</label>
            <select
              value={metalType}
              onChange={(e) => setMetalType(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 text-xs focus:outline-none focus:border-gold dark:text-white"
            >
              <option value="All">All Metals</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Platinum">Platinum</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">
              <span>Max Price</span>
              <span className="text-gold font-bold">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="1000000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-gold bg-stone-200 dark:bg-stone-750"
            />
          </div>

          {/* Weight Range */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">
              <span>Max Weight (g)</span>
              <span className="text-gold font-bold">{maxWeight} g</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="100"
              step="0.5"
              value={maxWeight}
              onChange={(e) => setMaxWeight(Number(e.target.value))}
              className="w-full accent-gold bg-stone-200 dark:bg-stone-750"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">Ideal For</label>
            <div className="flex gap-2">
              {['All', 'Women', 'Men'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setGender(opt)}
                  className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider border transition-colors duration-200 ${
                    gender === opt
                      ? 'bg-gold text-white border-gold'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* PRODUCTS CATALOG GRID */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              Showing <span className="text-stone-900 dark:text-white font-bold">{filteredProducts.length}</span> elegant items
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-stone-900/10 border border-stone-100 dark:border-stone-850 p-6 space-y-4">
              <p className="text-stone-400 font-serif text-lg italic">No jewelry found matching your selections.</p>
              <button
                onClick={resetFilters}
                className="btn-outline-gold px-6 py-2.5 text-xs font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
