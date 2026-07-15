import React, { createContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

export const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('prestige_theme') || 'light');

  // Custom State Router
  const [page, setPage] = useState('home');
  const [pageParam, setPageParam] = useState(null);

  const navigate = (pageName, param = null) => {
    setPage(pageName);
    setPageParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Products and Rates State
  const [products, setProducts] = useState([]);
  const [metalRates, setMetalRates] = useState({
    gold24K: 7500,
    gold22K: 7000,
    gold18K: 5800,
    silver: 90,
    platinum: 3800
  });
  const [loading, setLoading] = useState(true);

  // Cart & Shopping States
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('prestige_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    const saved = localStorage.getItem('prestige_recently_viewed');
    return saved ? JSON.parse(saved) : [];
  });

  // Auth State
  const [token, setToken] = useState(localStorage.getItem('prestige_token') || '');
  const [user, setUser] = useState(null);

  // Trigger dark mode class addition
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('prestige_theme', theme);
  }, [theme]);

  // Load Products & Rates on mount and when token changes
  const loadCatalog = async () => {
    try {
      setLoading(true);
      const ratesData = await api.get('/products/rates');
      setMetalRates(ratesData);
      
      const productsData = await api.get('/products');
      setProducts(productsData);
    } catch (err) {
      console.error('Error fetching catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [token]);

  // Sync Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('prestige_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync Recently Viewed to LocalStorage
  useEffect(() => {
    localStorage.setItem('prestige_recently_viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Load user profile on token mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const profile = await api.get('/auth/profile');
          setUser(profile);
          setWishlist(profile.wishlist || []);
        } catch (err) {
          console.error('Session expired or invalid token');
          logout();
        }
      } else {
        setUser(null);
        setWishlist([]);
      }
    };
    fetchProfile();
  }, [token]);

  // Authentication Handlers
  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('prestige_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setWishlist(data.user.wishlist || []);
    return data.user;
  };

  const signUp = async (name, email, password) => {
    const data = await api.post('/auth/signup', { name, email, password });
    localStorage.setItem('prestige_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setWishlist(data.user.wishlist || []);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('prestige_token');
    setToken('');
    setUser(null);
    setWishlist([]);
  };

  // Toggle Dark Mode
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Wishlist Handlers
  const toggleWishlist = async (productId) => {
    if (!token) {
      // Offline wishlist fallback (anonymous user)
      let updated = [];
      if (wishlist.includes(productId)) {
        updated = wishlist.filter(id => id !== productId);
      } else {
        updated = [...wishlist, productId];
      }
      setWishlist(updated);
      return;
    }

    try {
      const data = await api.put('/auth/wishlist', { productId });
      setWishlist(data.wishlist);
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  // Cart Handlers
  const addToCart = (product, size = 'Standard', quantity = 1) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(
        item => item.product._id === product._id && item.size === size
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }

      return [...prev, { product, size, quantity }];
    });
  };

  const updateCartQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product._id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId, size) => {
    setCart(prev =>
      prev.filter(item => !(item.product._id === productId && item.size === size))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Compare List Handlers
  const toggleCompare = (product) => {
    setCompareList(prev => {
      const exists = prev.some(p => p._id === product._id);
      if (exists) {
        return prev.filter(p => p._id !== product._id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 products at a time.');
        return prev;
      }
      return [...prev, product];
    });
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  // Track Recently Viewed
  const addToRecentlyViewed = (product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p._id !== product._id);
      return [product, ...filtered].slice(0, 5); // keep max 5 items
    });
  };

  // AI & Smart Product Recommendations
  const getAIRecommendations = (product) => {
    if (!product || products.length === 0) return [];
    
    // Logic: find products with same metal type or category, excluding current product
    const scoreProduct = (other) => {
      if (other._id === product._id) return -1;
      let score = 0;
      if (other.metalType === product.metalType) score += 3;
      if (other.category === product.category) score += 2;
      if (other.collectionType === product.collectionType) score += 1;
      return score;
    };

    return [...products]
      .map(other => ({ product: other, score: scoreProduct(other) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product)
      .slice(0, 4); // return top 4 items
  };

  // Manage Addresses (User profile sync)
  const saveAddresses = async (addresses) => {
    if (!token) {
      if (user) {
        setUser({ ...user, addresses });
      }
      return;
    }
    try {
      const data = await api.put('/auth/addresses', { addresses });
      setUser(prev => ({ ...prev, addresses: data.addresses }));
    } catch (err) {
      console.error('Error saving address:', err);
    }
  };

  return (
    <ShopContext.Provider
      value={{
        theme,
        toggleTheme,
        page,
        setPage,
        pageParam,
        setPageParam,
        navigate,
        products,
        metalRates,
        loading,
        loadCatalog,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        wishlist,
        toggleWishlist,
        compareList,
        toggleCompare,
        clearCompare,
        recentlyViewed,
        addToRecentlyViewed,
        getAIRecommendations,
        user,
        token,
        login,
        signUp,
        logout,
        saveAddresses
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
