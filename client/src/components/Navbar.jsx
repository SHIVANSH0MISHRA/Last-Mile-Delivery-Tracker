import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, LogOut, User as UserIcon, Menu, X, Shield } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  let user = null;

  if (token && userString) {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      // Ignored
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'agent') return '/agent';
    return '/customer';
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
      {/* Brand Logo */}
      <Link to={getDashboardLink()} className="flex items-center space-x-2 font-display font-bold text-xl tracking-tight transition-colors">
        <Truck className="h-6 w-6 text-sunset-orange animate-pulse" />
        <span className="bg-gradient-to-r from-sunset-orange to-sunset-red bg-clip-text text-transparent font-extrabold tracking-wide">SwiftShip</span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-8 text-sm">
        {user ? (
          <>
            {user.role === 'customer' && (
              <>
                <Link to="/customer" className="text-gray-300 hover:text-sunset-orange transition-colors">Dashboard</Link>
                <Link to="/customer/create" className="text-gray-300 hover:text-sunset-orange transition-colors">Calculate & Ship</Link>
                <Link to="/customer/orders" className="text-gray-300 hover:text-sunset-orange transition-colors">My Shipments</Link>
                <Link to="/customer/profile" className="text-gray-300 hover:text-sunset-orange transition-colors flex items-center gap-1">
                  <UserIcon className="w-4 h-4 text-sunset-orange" /> Profile
                </Link>
              </>
            )}

            {user.role === 'admin' && (
              <>
                <Link to="/admin" className="text-gray-300 hover:text-sunset-orange transition-colors flex items-center gap-1">
                  <Shield className="w-4 h-4 text-sunset-orange" /> Admin Panel
                </Link>
                <Link to="/admin/orders" className="text-gray-300 hover:text-sunset-orange transition-colors">Manage Orders</Link>
                <Link to="/admin/zones" className="text-gray-300 hover:text-sunset-orange transition-colors">Zones</Link>
                <Link to="/admin/rates" className="text-gray-300 hover:text-sunset-orange transition-colors">Rate Cards</Link>
                <Link to="/admin/agents" className="text-gray-300 hover:text-sunset-orange transition-colors">Agents</Link>
              </>
            )}

            {user.role === 'agent' && (
              <>
                <Link to="/agent" className="text-gray-300 hover:text-sunset-orange transition-colors">My Dashboard</Link>
                <Link to="/agent/orders" className="text-gray-300 hover:text-sunset-orange transition-colors">Assigned Deliveries</Link>
              </>
            )}

            <div className="flex items-center space-x-4 border-l border-white/10 pl-6">
              <span className="text-sunset-orange font-semibold text-xs bg-sunset-orange/10 px-2.5 py-1 rounded-full border border-sunset-orange/20">
                {user.role.toUpperCase()}: {user.name.split(' ')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 text-gray-400 hover:text-sunset-red transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-300 hover:text-sunset-orange transition-colors">Login</Link>
            <Link
              to="/register"
              className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 glow-btn"
            >
              Get Started
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-300 hover:text-sunset-orange focus:outline-none">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full glass-panel border-b border-white/5 py-4 px-6 md:hidden flex flex-col space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {user ? (
            <>
              {user.role === 'customer' && (
                <>
                  <Link to="/customer" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-sunset-orange py-1">Dashboard</Link>
                  <Link to="/customer/create" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-sunset-orange py-1">Calculate & Ship</Link>
                  <Link to="/customer/orders" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-sunset-orange py-1">My Shipments</Link>
                  <Link to="/customer/profile" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-sunset-orange py-1">Profile</Link>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-sunset-orange py-1">Admin Panel</Link>
                  <Link to="/admin/orders" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-sunset-orange py-1">Manage Orders</Link>
                  <Link to="/admin/zones" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-sunset-orange py-1">Zones</Link>
                  <Link to="/admin/rates" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-sunset-orange py-1">Rate Cards</Link>
                  <Link to="/admin/agents" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-sunset-orange py-1">Agents</Link>
                </>
              )}

              {user.role === 'agent' && (
                <>
                  <Link to="/agent" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-sunset-orange py-1">Dashboard</Link>
                  <Link to="/agent/orders" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-sunset-orange py-1">Assigned Deliveries</Link>
                </>
              )}

              <div className="pt-2 border-t border-white/5 flex flex-col space-y-3">
                <span className="text-gray-400 text-xs">
                  Logged in as: {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 text-sunset-red hover:text-brand-500 font-medium py-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-sunset-orange py-1">Login</Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-xl text-center transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
