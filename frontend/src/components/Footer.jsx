import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Phone, Mail, MapPin, MessageSquare, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  const { navigate } = useContext(ShopContext);

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/1234567890?text=Hello%20Prestige%20Jewelry,%20I%20have%20a%20query!', '_blank');
  };

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-stone-850">
          
          {/* Column 1: Brand Info */}
          <div>
            <h3 className="font-serif text-xl tracking-[0.2em] text-white uppercase mb-6 font-semibold">Prestige</h3>
            <p className="text-xs leading-relaxed text-stone-400 mb-6">
              Prestige is a premium brand crafted with trust. We design and curate luxury gold, silver, diamonds, and bridal jewelry that highlight your timeless moments.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gold transition-colors duration-200"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="hover:text-gold transition-colors duration-200"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="hover:text-gold transition-colors duration-200"><Twitter className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-serif text-sm tracking-wider text-white uppercase mb-6 font-semibold">Information</h4>
            <ul className="space-y-3 text-xs">
              <li><button onClick={() => navigate('shop')} className="hover:text-gold transition-colors duration-200">Shop Collections</button></li>
              <li><a href="#" className="hover:text-gold transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gold transition-colors duration-200">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-gold transition-colors duration-200">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-gold transition-colors duration-200">Return & Exchange Policy</a></li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div>
            <h4 className="font-serif text-sm tracking-wider text-white uppercase mb-6 font-semibold">Contact Us</h4>
            <ul className="space-y-4 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
                <span className="text-stone-400">123 Luxury Avenue, Diamond District, NY 10001, USA</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <a href="tel:+1234567890" className="text-stone-400 hover:text-gold">+1 (234) 567-890</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                <a href="mailto:support@prestige.com" className="text-stone-400 hover:text-gold">support@prestige.com</a>
              </li>
              <li className="pt-2">
                <button
                  onClick={handleWhatsAppClick}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors duration-200"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WhatsApp Chat
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Google Maps Store Location */}
          <div>
            <h4 className="font-serif text-sm tracking-wider text-white uppercase mb-6 font-semibold">Our Boutique</h4>
            <div className="w-full h-40 overflow-hidden border border-stone-800">
              <iframe
                title="Prestige Store Location"
                src="https://www.google.com/maps/embed?pb=!11m18!1m12!1m3!1d3022.4284694435427!2d-73.98731968459388!3d40.75388277932752!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sin!4v1689000000000!5m2!1sen!2sin"
                className="w-full h-full border-0 grayscale opacity-80 hover:opacity-100 transition-opacity duration-300"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>

        </div>

        <div className="pt-8 text-center text-[10px] text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Prestige Boutique. Crafted with trust. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-gold">Site Map</span>
            <span className="cursor-pointer hover:text-gold">Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
