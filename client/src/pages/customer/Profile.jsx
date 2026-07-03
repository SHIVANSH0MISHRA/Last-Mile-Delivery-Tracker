import React, { useState } from 'react';
import { User, Shield, ShieldAlert, Award } from 'lucide-react';

const Profile = () => {
  const userString = localStorage.getItem('user');
  let parsedUser = { name: '', email: '', role: 'customer' };
  
  if (userString) {
    try {
      parsedUser = JSON.parse(userString);
    } catch (e) {}
  }

  const [user, setUser] = useState(parsedUser);
  const [success, setSuccess] = useState('');

  // Sandbox control: allow customer to toggle B2B / B2C tier for checkout testing
  const [tier, setTier] = useState(localStorage.getItem('sandbox_tier') || 'B2C');

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('sandbox_tier', tier);
    setSuccess('Sandbox preferences saved! Your calculated checkout rate will reflect the selected tier.');
    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-violet-500" />
        
        <h1 className="font-display font-extrabold text-2xl text-white mb-6 flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-400" />
          Profile Settings
        </h1>

        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-xs">
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              disabled
              value={user.name}
              className="block w-full px-3 py-2.5 rounded-xl text-gray-400 glow-input text-xs bg-slate-900/50 cursor-not-allowed border-white/5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="block w-full px-3 py-2.5 rounded-xl text-gray-400 glow-input text-xs bg-slate-900/50 cursor-not-allowed border-white/5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Portal Access Role
            </label>
            <div className="flex items-center gap-2 text-xs text-indigo-300 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-3 py-2.5 rounded-xl w-fit">
              <Shield className="w-4 h-4 shrink-0" />
              <span>{user.role.toUpperCase()} ACCESS</span>
            </div>
          </div>

          {/* Sandbox Controls */}
          {user.role === 'customer' && (
            <div className="pt-6 border-t border-white/5 space-y-4">
              <h3 className="font-display font-bold text-sm text-indigo-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                Sandbox Client Settings
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                As a customer in our logistics testing environment, you can toggle your default B2B/B2C status below to test varying rate configurations.
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Customer Tier (For Pricing Calculator)
                </label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="block w-full px-3 py-2.5 rounded-xl text-white glow-input text-xs bg-slate-900 focus:outline-none"
                >
                  <option value="B2C">B2C Retailer (Standard Rates)</option>
                  <option value="B2B">B2B Corporate Account (Bulk Rates)</option>
                </select>
              </div>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 text-xs cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
