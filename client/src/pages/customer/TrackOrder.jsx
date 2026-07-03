import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Truck, Calendar, MapPin, Package, DollarSign, UserCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import TrackingTimeline from '../../components/TrackingTimeline';

const TrackOrder = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reschedule form state
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState('');

  const fetchOrderDetails = async () => {
    try {
      const orderRes = await api.get(`/orders/${id}`);
      setOrder(orderRes.data.data);

      const trackingRes = await api.get(`/tracking/${id}`);
      setHistory(trackingRes.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve shipping details. Check your route or login authorization.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleDate) return;

    setError('');
    setRescheduleSuccess('');
    setRescheduling(true);

    try {
      const response = await api.put(`/orders/${id}/reschedule`, { rescheduleDate });
      setRescheduleSuccess('Delivery rescheduled successfully! Auto-assignment re-triggered.');
      setRescheduleDate('');
      // Reload order details
      await fetchOrderDetails();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to reschedule order.');
    } finally {
      setRoundingForced(false);
      setRescheduling(false);
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto px-6 py-20 text-center text-gray-500">Retrieving shipping updates...</div>;
  }

  if (error && !order) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Tracking Error</h2>
        <p className="text-gray-400 text-sm">{error}</p>
        <Link to="/customer" className="text-indigo-400 font-semibold hover:underline block">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Back link */}
      <Link to="/customer" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to dashboard</span>
      </Link>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/5">
        <div>
          <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider font-display">Shipment Details</span>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white mt-1">
            Tracking: {order.orderNumber}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-semibold">Current State:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            order.status === 'Delivered' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
            order.status === 'Failed' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
            'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
          }`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Timeline Progress */}
        <div className="lg:col-span-2 space-y-8">
          <TrackingTimeline currentStatus={order.status} history={history} />
        </div>

        {/* Right Column: Address Cards & Rescheduling */}
        <div className="space-y-6">
          {/* Reschedule Card for Failed Orders */}
          {order.status === 'Failed' && (
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-red-500/20 bg-red-500/5">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-red-500" />
              <h3 className="font-display font-bold text-base text-red-400 flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                Reschedule Delivery
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                This shipment's delivery attempt failed. You can reschedule a new delivery attempt for a future date below.
              </p>

              {rescheduleSuccess && (
                <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-400 text-xs">
                  {rescheduleSuccess}
                </div>
              )}

              <form onSubmit={handleReschedule} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Select Re-delivery Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute inset-y-0 left-3 h-full w-4 text-gray-500 flex items-center pointer-events-none" />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2 rounded-xl text-white glow-input text-xs bg-slate-950 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={rescheduling}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 text-xs cursor-pointer"
                >
                  {rescheduling ? 'Scheduling...' : 'Schedule Re-delivery'}
                </button>
              </form>
            </div>
          )}

          {/* Delivery Coordinates Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <h3 className="font-display font-bold text-base text-white border-b border-white/5 pb-2">
              Route Coordinates
            </h3>
            
            {/* Pickup */}
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="text-gray-500 block">Pickup Address ({order.pickupAddress.zone})</span>
                <span className="text-gray-300 font-medium">{order.pickupAddress.street}</span>
                <span className="text-gray-400 block">{order.pickupAddress.city} - {order.pickupAddress.pincode}</span>
              </div>
            </div>

            {/* Drop */}
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="text-gray-500 block">Drop Address ({order.dropAddress.zone})</span>
                <span className="text-gray-300 font-medium">{order.dropAddress.street}</span>
                <span className="text-gray-400 block">{order.dropAddress.city} - {order.dropAddress.pincode}</span>
              </div>
            </div>
          </div>

          {/* Agent info Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-white border-b border-white/5 pb-2 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              Assigned Courier
            </h3>

            {order.assignedAgent ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                  {order.assignedAgent.name.slice(0, 2)}
                </div>
                <div className="text-xs">
                  <span className="text-gray-200 font-semibold block">{order.assignedAgent.name}</span>
                  <span className="text-gray-400 block">{order.assignedAgent.email}</span>
                  <span className="text-indigo-400 block mt-1 font-semibold">Active Zone: {order.assignedAgent.currentZone}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-xs text-amber-500 bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl">
                <Truck className="w-4 h-4 shrink-0" />
                <span>Finding available courier agent...</span>
              </div>
            )}
          </div>

          {/* Package details Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-white border-b border-white/5 pb-2 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-400" />
              Specs & Cost
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500 block">Actual Weight</span>
                <span className="text-gray-300 font-semibold">{order.packageDetails.weight} kg</span>
              </div>
              <div>
                <span className="text-gray-500 block">Volumetric Weight</span>
                <span className="text-gray-300 font-semibold">{order.pricingDetails.billableWeight} kg</span>
              </div>
              <div>
                <span className="text-gray-500 block">Payment Method</span>
                <span className="text-gray-300 font-semibold">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Customer Tier</span>
                <span className="text-gray-300 font-semibold">{order.customerType}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex justify-between items-center">
              <span className="text-xs text-gray-400 flex items-center"><DollarSign className="w-3.5 h-3.5" /> Total Rate</span>
              <span className="text-lg font-display font-bold text-white">${order.pricingDetails.totalRate}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
