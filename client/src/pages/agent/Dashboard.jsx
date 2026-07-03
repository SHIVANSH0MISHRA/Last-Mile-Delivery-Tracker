import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Power, ClipboardList, CheckCircle2, ShieldAlert, Navigation, ArrowRight, Truck } from 'lucide-react';
import api from '../../services/api';

const AgentDashboard = () => {
  const [agent, setAgent] = useState({ name: '', email: '', availability: true, currentZone: '' });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const fetchAgentData = async () => {
    try {
      const meRes = await api.get('/auth/me');
      setAgent(meRes.data.data);

      const ordersRes = await api.get('/agent/orders');
      setOrders(ordersRes.data.data);
    } catch (err) {
      console.error('Failed to load agent dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
  }, []);

  const handleToggleAvailability = async () => {
    setUpdatingAvailability(true);
    try {
      const nextAvailability = !agent.availability;
      const response = await api.put('/agent/availability', { availability: nextAvailability });
      setAgent({ ...agent, availability: response.data.data.availability });
    } catch (err) {
      console.error('Failed to toggle duty availability:', err);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  // Stats calculations
  const pendingOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Failed' && o.status !== 'Completed');
  const deliveredCount = orders.filter(o => o.status === 'Delivered' || o.status === 'Completed').length;
  const failedCount = orders.filter(o => o.status === 'Failed').length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* Upper Profile and Availability Card */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-indigo-500" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-display font-extrabold text-xl uppercase">
            {agent.name ? agent.name.slice(0, 2) : 'AG'}
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl text-white">{agent.name || 'Courier Agent'}</h1>
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <span className="text-gray-400">{agent.email}</span>
              <span className="w-1 h-1 bg-gray-700 rounded-full" />
              <span className="text-indigo-400 font-semibold">Active Zone: {agent.currentZone || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-3 bg-slate-950/60 border border-white/5 p-4 rounded-2xl w-full md:w-auto justify-between">
          <div className="text-xs">
            <span className="text-gray-500 block">Duty Status</span>
            <span className={`font-bold ${agent.availability ? 'text-emerald-400' : 'text-red-400'}`}>
              {agent.availability ? 'Online (Accepting Queue)' : 'Offline (On Break)'}
            </span>
          </div>
          <button
            onClick={handleToggleAvailability}
            disabled={updatingAvailability}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
              agent.availability 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-500/20'
            }`}
          >
            <Power className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-5 text-left flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Assigned Delivery Jobs</span>
            <span className="font-display font-extrabold text-3xl text-indigo-400 mt-1.5 block">{pendingOrders.length}</span>
          </div>
          <ClipboardList className="w-8 h-8 text-indigo-500/20" />
        </div>

        <div className="glass-panel rounded-2xl p-5 text-left flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Completed Deliveries</span>
            <span className="font-display font-extrabold text-3xl text-emerald-400 mt-1.5 block">{deliveredCount}</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/20" />
        </div>

        <div className="glass-panel rounded-2xl p-5 text-left flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Failed Shipments</span>
            <span className="font-display font-extrabold text-3xl text-red-400 mt-1.5 block">{failedCount}</span>
          </div>
          <ShieldAlert className="w-8 h-8 text-red-500/20" />
        </div>
      </div>

      {/* Active Assignments summary */}
      <div className="glass-panel rounded-3xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-400 animate-bounce" />
            Duty Manifest
          </h2>
          <Link to="/agent/orders" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
            <span>Open Delivery Screen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500 text-sm">Syncing with operations office...</div>
        ) : pendingOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
            <p className="font-semibold text-gray-400">All caught up!</p>
            <p className="text-gray-600 text-xs mt-1">No active delivery jobs assigned. Switch to Online to wait for packages.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.slice(0, 3).map(order => (
              <div key={order._id} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-display">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-200">{order.orderNumber}</span>
                    <span className="w-1 h-1 bg-gray-700 rounded-full" />
                    <span className="text-indigo-400 font-semibold">{order.status}</span>
                  </div>
                  <div className="mt-2 text-gray-400 flex items-center gap-1 text-[11px]">
                    <Navigation className="w-3.5 h-3.5 text-gray-500" />
                    <span>Drop Address: {order.dropAddress.street}, {order.dropAddress.city} ({order.dropAddress.pincode})</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">COD Payment: <span className="font-bold text-white">${order.pricingDetails.totalRate}</span></span>
                  <Link
                    to="/agent/orders"
                    className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white font-semibold py-2 px-4 rounded-xl transition-all"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
