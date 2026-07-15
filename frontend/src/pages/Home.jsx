import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { Shield, Sparkles, CreditCard, Truck, RefreshCw, Award, ArrowRight, Star } from 'lucide-react';

export default function Home() {
  const { products, navigate } = useContext(ShopContext);
  const [activeTab, setActiveTab] = useState('bestsellers');

  // Filter products for tabs
  const getFilteredProducts = () => {
    switch (activeTab) {
      case 'new':
        return products.slice(0, 4); // First 4 items
      case 'trending':
        return products.filter(p => p.rating >= 4.8).slice(0, 4);
      case 'offers':
        return products.filter(p => p.discountPercent > 0).slice(0, 4);
      case 'bestsellers':
      default:
        return products.filter(p => p.collectionType === 'Premium').slice(0, 4);
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate('shop', { category: categoryName });
  };

  const premiumCategories = [
    { name: 'Premium Necklaces', pic: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80' },
    { name: 'Premium Chains', pic: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Premium Bangles', pic: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80' },
    { name: 'Premium Rings', pic: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Premium Earrings', pic: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=400&q=80' },
    { name: 'Premium Bridal Sets', pic: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80' }
  ];

  const ordinaryCategories = [
    { name: 'Chains', pic: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=400&q=80' },
    { name: 'Bangles', pic: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80' },
    { name: 'Rings', pic: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=400&q=80' },
    { name: 'Earrings', pic: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80' },
    { name: 'Pendants', pic: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Anklets', pic: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80' }
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] bg-stone-950 flex items-center justify-center overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/20" />
        
        {/* Hero Content */}
        <div className="relative max-w-4xl mx-auto text-center px-4 space-y-6 select-none">
          <span className="text-gold tracking-[0.4em] uppercase text-xs sm:text-sm font-semibold animate-pulse-slow">
            Prestige Fine Jewelry
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif text-white tracking-wide uppercase leading-tight">
            Discover Timeless <br className="hidden sm:inline" /> Elegance
          </h1>
          <p className="text-stone-300 max-w-xl mx-auto font-light text-xs sm:text-sm md:text-base leading-relaxed tracking-wider">
            Premium Gold & Silver Jewellery Crafted with Trust. Every piece tells a story of heritage and luxury.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
            <button
              onClick={() => navigate('shop')}
              className="btn-gold w-full sm:w-auto gold-shimmer font-semibold"
            >
              Shop Now
            </button>
            <button
              onClick={() => {
                document.getElementById('collections').scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-outline-gold w-full sm:w-auto font-semibold border-white text-white hover:bg-white hover:text-black"
            >
              Explore Collections
            </button>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTIONS */}
      <section id="collections" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 scroll-mt-24">
        
        {/* Premium Collection */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-gold text-xs font-semibold tracking-[0.3em] uppercase">The Crown Jewels</span>
            <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-wider text-stone-900 dark:text-white">
              Premium Jewellery Collection
            </h2>
            <div className="w-16 h-[1px] bg-gold mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {premiumCategories.map((cat, i) => (
              <div
                key={i}
                onClick={() => handleCategoryClick(cat.name)}
                className="group relative h-72 cursor-pointer overflow-hidden border border-stone-100 dark:border-stone-850 shadow-sm hover:shadow-lg transition-all duration-500"
              >
                <img
                  src={cat.pic}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=400&q=80'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <h4 className="font-serif text-white text-xs uppercase tracking-widest font-semibold group-hover:text-gold transition-colors duration-200">
                    {cat.name.replace('Premium ', '')}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ordinary Collection */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-stone-500 dark:text-stone-400 text-xs font-semibold tracking-[0.3em] uppercase">For Every Moment</span>
            <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-wider text-stone-900 dark:text-white">
              Affordable Everyday Jewellery
            </h2>
            <div className="w-16 h-[1px] bg-stone-300 dark:bg-stone-700 mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ordinaryCategories.map((cat, i) => (
              <div
                key={i}
                onClick={() => handleCategoryClick(cat.name)}
                className="group relative h-60 cursor-pointer overflow-hidden border border-stone-100 dark:border-stone-850 shadow-sm hover:shadow-lg transition-all duration-500"
              >
                <img
                  src={cat.pic}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=400&q=80'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <h4 className="font-serif text-white text-xs uppercase tracking-widest font-semibold group-hover:text-gold transition-colors duration-200">
                    {cat.name}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="bg-stone-50 dark:bg-stone-900/30 py-20 border-y border-stone-100 dark:border-stone-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-gold text-xs font-semibold tracking-[0.3em] uppercase">Handpicked Highlights</span>
            <h2 className="text-3xl font-serif uppercase tracking-wider text-stone-900 dark:text-white">Curated Collections</h2>
          </div>

          {/* Tabs */}
          <div className="flex justify-center space-x-6 sm:space-x-8 text-xs uppercase tracking-widest border-b border-stone-200 dark:border-stone-800 pb-4 max-w-md mx-auto">
            {[
              { id: 'bestsellers', label: 'Best Sellers' },
              { id: 'new', label: 'New Arrivals' },
              { id: 'trending', label: 'Trending' },
              { id: 'offers', label: 'Offers' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`font-semibold transition-colors duration-200 ${
                  activeTab === tab.id ? 'text-gold border-b-2 border-gold pb-4 -mb-4.5' : 'text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-4">
            {getFilteredProducts().map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-stone-500 dark:text-stone-400 text-xs font-semibold tracking-[0.3em] uppercase">Our Credentials</span>
          <h2 className="text-3xl font-serif uppercase tracking-wider text-stone-900 dark:text-white">Why Choose Prestige</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pt-4">
          {[
            { icon: <Shield className="w-8 h-8 text-gold" />, title: 'Certified Jewellery', desc: 'SGL/IGI Certified diamonds.' },
            { icon: <Award className="w-8 h-8 text-gold" />, title: 'Hallmark Gold', desc: '100% BIS Hallmarked pure gold.' },
            { icon: <CreditCard className="w-8 h-8 text-gold" />, title: 'Secure Payments', desc: 'Encrypted cards & UPI validation.' },
            { icon: <Truck className="w-8 h-8 text-gold" />, title: 'Fast Delivery', desc: 'Fully insured courier shipping.' },
            { icon: <RefreshCw className="w-8 h-8 text-gold" />, title: 'Easy Returns', desc: '14-day hassle-free exchanges.' },
            { icon: <Sparkles className="w-8 h-8 text-gold" />, title: 'Trusted Since 1998', desc: 'Over 28 years of pure trust.' }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-4 border border-stone-50 dark:border-stone-850 bg-white dark:bg-stone-900/10 hover:shadow-md transition-shadow duration-300">
              <div className="mb-4">{item.icon}</div>
              <h4 className="font-serif text-xs uppercase tracking-wider text-stone-900 dark:text-white font-bold mb-1.5">{item.title}</h4>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CUSTOMER REVIEWS */}
      <section className="bg-stone-50 dark:bg-stone-900/30 py-20 border-y border-stone-100 dark:border-stone-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-gold text-xs font-semibold tracking-[0.3em] uppercase">Testimonials</span>
            <h2 className="text-3xl font-serif uppercase tracking-wider text-stone-900 dark:text-white">Patron Testimonials</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Eleanor Vance',
                role: 'Bride',
                rating: 5,
                text: 'The bridal set I bought for my wedding was breathtaking. The detailing on the Kundan work is extremely precise. Excellent concierge service!',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'
              },
              {
                name: 'Marcus Sterling',
                role: 'Groom',
                rating: 5,
                text: 'Designed custom engagement band with their design team. The finish is stunning and the GIA diamond certificate provides peace of mind.',
                avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80'
              },
              {
                name: 'Clarissa Jenkins',
                role: 'Loyal Collector',
                rating: 5,
                text: 'I buy all my everyday silver necklaces from Prestige. Their jewelry holds shine extremely well, and prices are totally transparent.',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
              }
            ].map((review, i) => (
              <div key={i} className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-850 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300">
                <div>
                  <div className="flex text-amber-400 gap-0.5 mb-4">
                    {[...Array(review.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs italic text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
                    "{review.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3 border-t border-stone-100 dark:border-stone-800 pt-4">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-10 h-10 object-cover rounded-full border border-stone-200 dark:border-stone-700"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'; }}
                  />
                  <div>
                    <h5 className="font-serif text-xs uppercase tracking-wider text-stone-900 dark:text-white font-bold">{review.name}</h5>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. NEWSLETTER */}
      <section className="max-w-5xl mx-auto px-4 select-none">
        <div className="bg-stone-900 text-white p-12 text-center space-y-6 relative overflow-hidden border border-gold/20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-10" />
          
          <div className="relative space-y-3">
            <span className="text-gold tracking-[0.3em] uppercase text-[10px] font-semibold block">Exclusive Privileges</span>
            <h2 className="text-2xl sm:text-3xl font-serif uppercase tracking-wider">
              Get Exclusive Offers & New Collection Updates
            </h2>
            <p className="text-stone-400 max-w-md mx-auto text-xs font-light tracking-wide">
              Subscribe to receive private collection previews, seasonal boutique rates, and hallmark jewelry insights.
            </p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to Prestige updates!'); }}
            className="relative flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              required
              className="flex-1 bg-stone-850 border border-stone-800 text-stone-100 placeholder-stone-500 text-xs px-4 py-3 focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="bg-gold hover:bg-gold-dark text-stone-950 font-semibold text-xs py-3 px-6 uppercase tracking-widest transition-colors duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
