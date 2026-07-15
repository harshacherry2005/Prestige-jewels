import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const handleClick = () => {
    window.open('https://wa.me/1234567890?text=Hello!%20I%20am%20interested%20in%20Prestige%20Jewellery%20and%20need%2520assistance.', '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-white" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out text-xs font-semibold uppercase tracking-wider pl-0 group-hover:pl-2 whitespace-nowrap">
        WhatsApp Support
      </span>
    </button>
  );
}
