import React, { useContext } from 'react';
import { ShopContext } from './context/ShopContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import LiveChat from './components/LiveChat';
import CompareModal from './components/CompareModal';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const { page } = useContext(ShopContext);

  // Render active page based on custom context router
  const renderActivePage = () => {
    switch (page) {
      case 'shop':
        return <Shop />;
      case 'product':
        return <ProductDetails />;
      case 'cart':
        return <Cart />;
      case 'checkout':
        return <Checkout />;
      case 'account':
        return <Account />;
      case 'admin':
        return <AdminDashboard />;
      case 'home':
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-luxury-cream dark:bg-luxury-darkBg flex flex-col justify-between transition-colors duration-300">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow">
        {renderActivePage()}
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Utilities */}
      <WhatsAppButton />
      <LiveChat />
      
      {/* Compare Draw overlay */}
      <CompareModal />

    </div>
  );
}
