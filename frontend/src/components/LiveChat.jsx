import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, ShieldCheck } from 'lucide-react';

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Welcome to Prestige Boutique. How may I assist you with our jewellery collections today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');

    // Trigger mock auto-reply
    setTimeout(() => {
      let reply = "Thank you for contacting Prestige. An assistant will be with you shortly. For immediate assistance, feel free to tap the WhatsApp button.";
      const msgLower = userMsg.toLowerCase();
      if (msgLower.includes('gold') || msgLower.includes('rate') || msgLower.includes('price')) {
        reply = "Our gold prices are dynamically calculated based on current market rates. 22K Gold is currently priced at ₹7,000/g and 18K Gold is ₹5,800/g. You can see the full pricing breakdown on any product page.";
      } else if (msgLower.includes('return') || msgLower.includes('refund')) {
        reply = "We offer a 14-day easy return policy for all unworn jewellery with their original hallmark certificates. Returns are processed within 3-5 business days.";
      } else if (msgLower.includes('custom') || msgLower.includes('design')) {
        reply = "Yes, we create custom designs! You can request custom engravings or full design consultations by tapping the WhatsApp support button to speak directly with our head craftsman.";
      } else if (msgLower.includes('shipping') || msgLower.includes('delivery')) {
        reply = "We offer secure, insured shipping worldwide. Domestic shipping takes 3-5 business days, and international shipping takes 7-10 business days.";
      }
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center border border-stone-800 dark:border-stone-200"
          title="Open Live Chat"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[450px] bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 shadow-2xl flex flex-col justify-between transition-all duration-300">
          
          {/* Header */}
          <div className="bg-stone-900 text-white p-4 flex justify-between items-center border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <div>
                <p className="font-serif text-sm font-semibold tracking-wider uppercase">Prestige Concierge</p>
                <p className="text-[10px] text-stone-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-gold" /> Certified Shop Assistant
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-white transition-colors duration-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 dark:bg-stone-900/40">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gold text-white rounded-none'
                      : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-100 dark:border-stone-800 rounded-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="p-3 border-t border-stone-200 dark:border-stone-850 flex gap-2 bg-white dark:bg-stone-950">
            <input
              type="text"
              placeholder="Ask about rates, sizes, shipping..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gold dark:text-white placeholder-stone-400"
            />
            <button
              type="submit"
              className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-3 py-2 hover:bg-gold dark:hover:bg-gold dark:hover:text-white transition-all duration-300 flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
