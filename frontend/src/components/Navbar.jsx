import React, { useContext, useState, useRef, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Search, ShoppingBag, Heart, User, Sun, Moon, Menu, X, BarChart3, HelpCircle } from 'lucide-react';

export default function Navbar() {
  const {
    theme,
    toggleTheme,
    cart,
    wishlist,
    user,
    navigate,
    products,
    page
  } = useContext(ShopContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search suggestions
  const suggestions = searchQuery.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSuggestionClick = (product) => {
    navigate('product', product._id);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('shop', { search: searchQuery });
      setShowSuggestions(false);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 glass shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo / Brand Name */}
          <div className="flex-shrink-0 cursor-pointer flex items-center" onClick={() => navigate('home')}>
            <span className="font-serif text-2xl sm:text-3xl tracking-[0.25em] text-stone-900 dark:text-white uppercase font-semibold">
              Prestige
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <button
              onClick={() => navigate('home')}
              className={`text-xs uppercase tracking-widest font-medium hover:text-gold transition-colors duration-200 ${
                page === 'home' ? 'text-gold border-b border-gold pb-1' : 'text-stone-700 dark:text-stone-300'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('shop')}
              className={`text-xs uppercase tracking-widest font-medium hover:text-gold transition-colors duration-200 ${
                page === 'shop' ? 'text-gold border-b border-gold pb-1' : 'text-stone-700 dark:text-stone-300'
              }`}
            >
              Collections
            </button>
            {user && user.role === 'admin' && (
              <button
                onClick={() => navigate('admin')}
                className={`text-xs uppercase tracking-widest font-medium text-red-600 dark:text-red-400 hover:text-gold transition-colors duration-200 flex items-center gap-1 ${
                  page === 'admin' ? 'border-b border-gold pb-1' : ''
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Dashboard
              </button>
            )}
          </div>

          {/* Search bar & utility icons */}
          <div className="hidden lg:flex items-center space-x-6">
            
            {/* Search Input Container */}
            <div ref={searchRef} className="relative w-64">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search elegant jewelry..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 text-xs px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-gold transition-all duration-300 rounded-none border border-transparent dark:border-stone-700"
                />
                <button type="submit" className="absolute right-3 top-2.5 text-stone-400 hover:text-gold">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 mt-1 w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl z-50 rounded-none">
                  {suggestions.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => handleSuggestionClick(p)}
                      className="flex items-center p-2.5 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer border-b border-stone-100 dark:border-stone-800 last:border-0"
                    >
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-8 h-8 object-cover mr-3 border border-stone-200 dark:border-stone-700"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=100&q=80'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-stone-900 dark:text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">{p.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Light/Dark Toggle */}
            <button onClick={toggleTheme} className="text-stone-700 dark:text-stone-300 hover:text-gold transition-colors duration-200">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist */}
            <button onClick={() => navigate('account')} className="relative text-stone-700 dark:text-stone-300 hover:text-gold transition-colors duration-200">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button onClick={() => navigate('cart')} className="relative text-stone-700 dark:text-stone-300 hover:text-gold transition-colors duration-200">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Account Icon / Dropdown */}
            <button onClick={() => navigate('account')} className="text-stone-700 dark:text-stone-300 hover:text-gold transition-colors duration-200">
              <User className="w-5 h-5" />
            </button>
          </div>

          {/* Right Action Icons (for Tablet / Mobile) */}
          <div className="flex items-center space-x-4 lg:hidden">
            {/* Theme Toggle (Mobile) */}
            <button onClick={toggleTheme} className="text-stone-700 dark:text-stone-300 hover:text-gold">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cart (Mobile) */}
            <button onClick={() => navigate('cart')} className="relative text-stone-700 dark:text-stone-300 hover:text-gold">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-stone-700 dark:text-stone-300 hover:text-gold focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 transition-all duration-300">
          <div className="px-4 pt-4 pb-6 space-y-3">
            
            {/* Search Input for Mobile */}
            <div className="pb-3 border-b border-stone-100 dark:border-stone-800">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search elegant jewelry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 text-xs px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-gold rounded-none border border-transparent dark:border-stone-700"
                />
                <button type="submit" className="absolute right-3 top-2.5 text-stone-400 hover:text-gold">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Links */}
            <button
              onClick={() => { navigate('home'); setMobileMenuOpen(false); }}
              className="block w-full text-left py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-gold uppercase tracking-wider"
            >
              Home
            </button>
            <button
              onClick={() => { navigate('shop'); setMobileMenuOpen(false); }}
              className="block w-full text-left py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-gold uppercase tracking-wider"
            >
              Collections
            </button>
            <button
              onClick={() => { navigate('account'); setMobileMenuOpen(false); }}
              className="block w-full text-left py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-gold uppercase tracking-wider"
            >
              My Profile
            </button>
            {user && user.role === 'admin' && (
              <button
                onClick={() => { navigate('admin'); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-gold uppercase tracking-wider flex items-center gap-1"
              >
                <BarChart3 className="w-4 h-4" />
                Admin Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
