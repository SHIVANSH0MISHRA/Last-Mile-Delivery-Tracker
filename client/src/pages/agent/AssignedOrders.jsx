import React, { useEffect, useState } from 'react';
import { Truck, MapPin, Package, Check, ShieldAlert, ArrowRight, CornerDownRight, Navigation, ClipboardList, HelpCircle } from 'lucide-react';
import api from '../../services/api';

const AssignedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Failure Modal state
  const [selectedOrderForFailure, setSelectedOrderForFailure] = useState(null);
  const [failureRemarks, setFailureRemarks] = useState('');
  const [submittingFailure, setSubmittingFailure] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const response = await api.get('/agent/orders');
      setOrders(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus, remarks = '') => {
    setError('');
    try {
      await api.put(`/agent/orders/${orderId}/status`, { status: newStatus, remarks });
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleReportFailureSubmit = async (e) => {
    e.preventDefault();
    if (!failureRemarks.trim() || !selectedOrderForFailure) return;

    setSubmittingFailure(true);
    setError('');

    try {
      await api.put(`/agent/orders/${selectedOrderForFailure._id}/status`, {
        status: 'Failed',
        remarks: failureRemarks.trim()
      });
      setSelectedOrderForFailure(null);
      setFailureRemarks('');
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register delivery failure.');
    } finally {
      setSubmittingFailure(false);
    }
  };

  const activeJobs = orders.filter(o => !['Delivered', 'Failed', 'Completed'].includes(o.status));
  const pastJobs = orders.filter(o => ['Delivered', 'Failed', 'Completed'].includes(o.status));

  const getStatusButton = (order) => {
    switch (order.status) {
      case 'Assigned':
        return (
          <button
            onClick={() => handleUpdateStatus(order._id, 'Picked Up')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex justify-center items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>Mark Picked Up</span>
          </button>
        );
      case 'Picked Up':
        return (
          <button
            onClick={() => handleUpdateStatus(order._id, 'In Transit')}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex justify-center items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Mark In Transit</span>
          </button>
        );
      case 'In Transit':
        return (
          <button
            onClick={() => handleUpdateStatus(order._id, 'Out For Delivery')}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex justify-center items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>Mark Out For Delivery</span>
          </button>
        );
      case 'Out For Delivery':
        return (
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={() => handleUpdateStatus(order._id, 'Delivered', 'Package successfully handed over to customer.')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-3 rounded-xl text-xs flex justify-center items-center gap-1 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Delivered</span>
            </button>
            <button
              onClick={() => setSelectedOrderForFailure(order)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-3 rounded-xl text-xs flex justify-center items-center gap-1 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Fail Attempt</span>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-white">Assigned Deliveries</h1>
        <p className="text-gray-400 text-sm mt-1">Manage statuses for your delivery pipeline.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Main layout splitting active/past */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns: Active manifest */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            Active Delivery Run
          </h2>

          {loading ? (
            <div className="glass-panel rounded-2xl p-10 text-center text-gray-500 text-sm">Synchronizing route schedule...</div>
          ) : activeJobs.length === 0 ? (
            <div className="glass-panel rounded-2xl p-10 text-center text-gray-500 text-sm">
              <Check className="w-8 h-8 text-emerald-500/30 mx-auto mb-3" />
              <span className="font-semibold text-gray-400 block">Manifest is empty</span>
              <p className="text-gray-600 text-xs mt-1">You have no active runs. Wait for orders to be assigned to your zone.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeJobs.map((order) => (
                <div key={order._id} className="glass-panel rounded-2xl p-6 space-y-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-indigo-500" />
                  
                  {/* Title Bar */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-gray-400 font-bold text-sm block font-display">{order.orderNumber}</span>
                      <span className="text-[10px] text-gray-500">Customer: {order.customer?.name} ({order.customerType})</span>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full border text-indigo-400 bg-indigo-500/10 border-indigo-500/20 font-bold">
                      {order.status}
                    </span>
                  </div>

                  {/* Addresses */}
                  <div className="space-y-3 pt-2">
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="text-gray-500 block text-[10px]">Pickup ({order.pickupAddress.zone})</span>
                        <span className="text-gray-300">{order.pickupAddress.street}, {order.pickupAddress.city}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="text-gray-500 block text-[10px]">Drop ({order.dropAddress.zone})</span>
                        <span className="text-gray-300 font-medium">{order.dropAddress.street}, {order.dropAddress.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Specs & COD Surcharges */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-white/5 text-[11px] text-gray-400">
                    <div>
                      <span>Billable Wt:</span>
                      <span className="text-gray-200 font-semibold block">{order.pricingDetails.billableWeight} kg</span>
                    </div>
                    <div>
                      <span>Payment:</span>
                      <span className="text-gray-200 font-semibold block">{order.paymentMethod}</span>
                    </div>
                    <div>
                      {order.paymentMethod === 'COD' ? (
                        <span className="text-amber-400 font-bold block">Collect COD: ${order.pricingDetails.totalRate}</span>
                      ) : (
                        <span className="text-emerald-400 block font-semibold">Prepaid</span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2">
                    {getStatusButton(order)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: History panel */}
        <div className="space-y-6">
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400" />
            Duty Logs
          </h2>

          {loading ? (
            <div className="glass-panel rounded-2xl p-6 text-center text-gray-500 text-sm">Syncing...</div>
          ) : pastJobs.length === 0 ? (
            <div className="glass-panel rounded-2xl p-6 text-center text-gray-600 text-xs">
              No completed runs logged in your current session.
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-4 divide-y divide-white/5 max-h-[500px] overflow-y-auto">
              {pastJobs.map((order) => (
                <div key={order._id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-gray-300 font-semibold block">{order.orderNumber}</span>
                    <span className="text-gray-500 block text-[10px]">{order.dropAddress.city}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
                    order.status === 'Delivered' || order.status === 'Completed' 
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                      : 'text-red-400 bg-red-500/10 border-red-500/20'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Failure Remarks Modal Overlay */}
      {selectedOrderForFailure && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-red-500" />
            
            <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Mandatory Failure Remarks
            </h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Log the reason why the delivery attempt for order <span className="text-indigo-400 font-semibold">{selectedOrderForFailure.orderNumber}</span> failed.
            </p>

            <form onSubmit={handleReportFailureSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Reason for failure
                </label>
                <textarea
                  required
                  rows="3"
                  value={failureRemarks}
                  onChange={(e) => setFailureRemarks(e.target.value)}
                  placeholder="e.g. Customer not present at premises after repeated phone contact attempts, or Address could not be resolved."
                  className="block w-full px-3 py-2 rounded-xl text-white glow-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrderForFailure(null);
                    setFailureRemarks('');
                  }}
                  className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFailure || !failureRemarks.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submittingFailure ? 'Registering...' : 'Register Failure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedOrders;
