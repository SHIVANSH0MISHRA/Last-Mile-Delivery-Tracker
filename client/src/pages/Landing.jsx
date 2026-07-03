import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Truck, Calculator, ShieldCheck, Zap, ArrowRight, Navigation, 
  Search, CheckCircle2, Play, Users, MapPin, Sparkles, Check, HelpCircle 
} from 'lucide-react';
import api from '../services/api';

const Landing = () => {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState('');
  const [error, setError] = useState('');
  
  // Custom Intersection Observer for scroll triggers
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));
    
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleTrackSearch = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    
    setError('');
    try {
      // Fetch orders to locate match
      const response = await api.get(`/orders`);
      const allOrders = response.data.data;
      const matched = allOrders.find(
        (o) => o.orderNumber.toLowerCase() === trackingId.trim().toLowerCase()
      );
      
      if (matched) {
        navigate(`/customer/track/${matched._id}`);
      } else {
        setError('No active delivery order matches this number. Check credentials and retry.');
      }
    } catch (err) {
      setError('Please log in to track custom order details.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-sans overflow-hidden">
      
      {/* 1. Hero & Header Banner Area */}
      <section className="relative w-full pt-12 pb-20 px-6 lg:px-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Swirling glow elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full loader-swirl pointer-events-none -z-10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-sunset-red/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Left Side: Bold Marketing Pitch */}
        <div className="lg:col-span-7 flex flex-col items-start text-left anim-reveal-text">
          <span className="inline-flex items-center space-x-2 text-sunset-orange bg-sunset-orange/10 border border-sunset-orange/20 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-6">
            <Zap className="w-3.5 h-3.5 fill-sunset-orange" />
            <span>Delivering Trust, Every Mile</span>
          </span>

          <h1 className="font-display font-extrabold text-5xl md:text-7xl text-white tracking-tight leading-[1.1] mb-6">
            Last-Mile <br />
            Delivery, <br />
            <span className="bg-gradient-to-r from-sunset-orange via-sunset-red to-sunset-gold bg-clip-text text-transparent">
              Perfected.
            </span>
          </h1>

          <p className="text-gray-400 text-base md:text-lg max-w-lg mb-8 leading-relaxed font-poppins">
            Smart tracking. Faster deliveries. Happier customers. Automate volumetric pricing, agent assignment, and real-time logistics mapping.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-sunset-orange/10 glow-btn text-sm cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2.5 text-gray-300 hover:text-white transition-colors py-2 px-4 group font-medium text-sm"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sunset-orange group-hover:bg-sunset-orange/15 transition-all">
                <Play className="w-4 h-4 fill-sunset-orange ml-0.5" />
              </div>
              <span>Watch how it works</span>
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Order Search (Glassmorphism Mockup Card) */}
        <div className="lg:col-span-5 flex justify-center w-full anim-reveal-text" style={{ animationDelay: '0.2s' }}>
          <div className="w-full max-w-[420px] glass-panel-orange pulse-glow rounded-3xl p-8 relative overflow-hidden">
            {/* Background Image overlay inside card */}
            <div 
              className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-25" 
              style={{ backgroundImage: `url('/hero_sunset.png')` }}
            />
            
            <div className="relative z-10">
              <h3 className="font-poppins font-bold text-xl text-white mb-6">Track Your Order</h3>
              
              <form onSubmit={handleTrackSearch} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter Order ID"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl text-white glow-input text-sm placeholder-gray-500"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 glow-btn text-sm cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Track Now</span>
                </button>
              </form>

              <div className="my-5 flex items-center justify-center">
                <div className="h-[1px] bg-white/10 flex-1" />
                <span className="text-[10px] text-gray-500 px-3 uppercase tracking-widest font-semibold">Or</span>
                <div className="h-[1px] bg-white/10 flex-1" />
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 py-3 rounded-xl transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Track with Phone Number
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-gray-400 font-medium font-poppins">Live. Reliable. Real-time.</span>
              </div>

              {error && <p className="text-sunset-red text-xs mt-3 text-center">{error}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Section Underneath the Hero */}
      <section className="w-full px-6 max-w-7xl mx-auto py-12 scroll-reveal">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="glass-panel rounded-2xl p-6 border-l-2 border-l-sunset-orange">
            <span className="block font-display font-extrabold text-3xl text-white tracking-tight">12.8K+</span>
            <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Deliveries Today</span>
          </div>
          <div className="glass-panel rounded-2xl p-6 border-l-2 border-l-sunset-red">
            <span className="block font-display font-extrabold text-3xl text-white tracking-tight">98.6%</span>
            <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">On-Time Delivery</span>
          </div>
          <div className="glass-panel rounded-2xl p-6 border-l-2 border-l-sunset-gold">
            <span className="block font-display font-extrabold text-3xl text-white tracking-tight">2.4K+</span>
            <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Active Agents</span>
          </div>
          <div className="glass-panel rounded-2xl p-6 border-l-2 border-l-orange-500">
            <span className="block font-display font-extrabold text-3xl text-white tracking-tight">250+</span>
            <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Serviceable Cities</span>
          </div>
        </div>
      </section>

      {/* 3. Platform Capabilities Section */}
      <section className="w-full px-6 max-w-7xl mx-auto py-20 flex flex-col items-center text-center">
        <h2 className="font-display font-extrabold text-3xl md:text-5xl text-white mb-4 scroll-reveal">
          Everything you need in <br />
          one delivery platform
        </h2>
        <p className="text-gray-400 max-w-xl text-sm md:text-base mb-16 scroll-reveal" style={{ transitionDelay: '0.1s' }}>
          Fully automated platform to quote, dispatch, update and track packages globally.
        </p>

        {/* Feature Cards Grid (5 features matching design system mock) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 w-full mb-12">
          {/* Card 1 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col items-start text-left scroll-reveal" style={{ transitionDelay: '0.1s' }}>
            <div className="w-10 h-10 rounded-xl bg-sunset-orange/10 border border-sunset-orange/20 flex items-center justify-center text-sunset-orange mb-6 shadow-inner">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="font-poppins font-bold text-sm text-white mb-2">Smart Pricing</h3>
            <p className="text-gray-400 text-xs leading-relaxed font-poppins">
              Auto-calculate charges based on weight, zone, and delivery type dynamically.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col items-start text-left scroll-reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="w-10 h-10 rounded-xl bg-sunset-red/10 border border-sunset-red/20 flex items-center justify-center text-sunset-red mb-6">
              <Navigation className="w-5 h-5 rotate-45" />
            </div>
            <h3 className="font-poppins font-bold text-sm text-white mb-2">Real-time Tracking</h3>
            <p className="text-gray-400 text-xs leading-relaxed font-poppins">
              Live updates at every step of the delivery journey for transparency.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col items-start text-left scroll-reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="w-10 h-10 rounded-xl bg-sunset-gold/10 border border-sunset-gold/20 flex items-center justify-center text-sunset-gold mb-6">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-poppins font-bold text-sm text-white mb-2">Auto Agent Assign</h3>
            <p className="text-gray-400 text-xs leading-relaxed font-poppins">
              AI-powered assignment for faster, smarter delivery dispatch mapping.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col items-start text-left scroll-reveal" style={{ transitionDelay: '0.4s' }}>
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-6">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-poppins font-bold text-sm text-white mb-2">COD & Prepaid</h3>
            <p className="text-gray-400 text-xs leading-relaxed font-poppins">
              Support for COD surcharge and multiple transactional payment methods.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col items-start text-left scroll-reveal" style={{ transitionDelay: '0.5s' }}>
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-6">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-poppins font-bold text-sm text-white mb-2">Instant Notifications</h3>
            <p className="text-gray-400 text-xs leading-relaxed font-poppins">
              Email & transactional alerts triggered immediately for every state status update.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Ready to Deliver Call to Action (CTA) Section */}
      <section className="w-full px-6 max-w-7xl mx-auto pb-24 scroll-reveal">
        <div className="relative glass-panel rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden">
          {/* Backdrop Image overlay mimicking dusk sunset */}
          <div 
            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 pointer-events-none -z-10" 
            style={{ backgroundImage: `url('/hero_sunset.png')` }}
          />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-sunset-orange/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="text-left max-w-xl">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white mb-4">
              Ready to Deliver Excellence?
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-poppins">
              Join thousands of businesses delivering happiness, on time. Experience the power of SwiftShip.
            </p>
          </div>

          <Link
            to="/register"
            className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-sunset-orange/20 glow-btn text-sm whitespace-nowrap cursor-pointer flex items-center gap-2"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="mt-auto py-8 border-t border-white/5 text-center text-xs text-gray-600 bg-black/20">
        <p>© 2026 SwiftShip. All rights reserved. Delivering trust with React & Node.js.</p>
      </footer>
    </div>
  );
};

export default Landing;
