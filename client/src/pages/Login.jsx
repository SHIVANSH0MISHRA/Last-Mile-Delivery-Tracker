import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Truck, ShieldAlert } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Direct to respective dashboard
      if (userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.role === 'agent') {
        navigate('/agent');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('Password123');
  };

  return (
    <div className="min-h-[90vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 bg-transparent">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2 font-display font-bold text-2xl mb-6">
          <Truck className="h-7 w-7 text-sunset-orange animate-pulse" />
          <span className="bg-gradient-to-r from-sunset-orange to-sunset-red bg-clip-text text-transparent font-extrabold tracking-wide">SwiftShip</span>
        </Link>
        <h2 className="text-3xl font-display font-extrabold text-white">Sign In to Portal</h2>
        <p className="mt-2 text-sm text-gray-400 font-display">
          Or{' '}
          <Link to="/register" className="font-semibold text-sunset-orange hover:text-sunset-red transition-colors">
            create a customer account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-sunset-orange to-sunset-red" />

          {error && (
            <div className="mb-6 bg-sunset-red/10 border border-sunset-red/20 rounded-xl p-4 flex items-start gap-2.5 text-sunset-orange text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-10 pr-3 py-3 rounded-xl text-white glow-input text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-3 rounded-xl text-white glow-input text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-sunset-orange/10 disabled:opacity-50 cursor-pointer glow-btn"
              >
                {loading ? 'Verifying...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Presets Grid */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <span className="block text-center text-xs font-semibold text-sunset-orange uppercase tracking-wider mb-4">
              Quick Sandbox Presets
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handlePresetLogin('admin@tracker.com')}
                className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 py-2 px-3 rounded-xl transition-all duration-200 hover:border-sunset-orange/30 cursor-pointer text-center"
              >
                Log In Admin
              </button>
              <button
                type="button"
                onClick={() => handlePresetLogin('customer@tracker.com')}
                className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 py-2 px-3 rounded-xl transition-all duration-200 hover:border-sunset-orange/30 cursor-pointer text-center"
              >
                Log In Customer
              </button>
              <button
                type="button"
                onClick={() => handlePresetLogin('agent1@tracker.com')}
                className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 py-2 px-3 rounded-xl transition-all duration-200 hover:border-sunset-orange/30 cursor-pointer text-center"
              >
                Agent Zone A
              </button>
              <button
                type="button"
                onClick={() => handlePresetLogin('agent2@tracker.com')}
                className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 py-2 px-3 rounded-xl transition-all duration-200 hover:border-sunset-orange/30 cursor-pointer text-center"
              >
                Agent Zone B
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
