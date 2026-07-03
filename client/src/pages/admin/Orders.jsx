import React, { useEffect, useState } from 'react';
import { Truck, Users, ShieldAlert, Navigation, Search, CheckCircle, Sliders, RefreshCw, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);
  const [selectedOrderForOverride, setSelectedOrderForOverride] = useState(null);

  // Form Inputs
  const [manualAgentId, setManualAgentId] = useState('');
  const [overrideStatus, setOverrideStatus] = useState('');
  const [overrideRemarks, setOverrideRemarks] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchOrdersAndAgents = async () => {
    try {
      const ordersRes = await api.get('/orders');
      setOrders(ordersRes.data.data);

      const agentsRes = await api.get('/admin/agents');
      setAgents(agentsRes.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to refresh data logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndAgents();
  }, []);

  const handleManualAssign = async (e) => {
    e.preventDefault();
    if (!manualAgentId || !selectedOrderForAssign) return;

    setSubmittingAction(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/admin/assign', {
        orderId: selectedOrderForAssign._id,
        agentId: manualAgentId
      });
      setSuccess(response.data.message);
      setSelectedOrderForAssign(null);
      setManualAgentId('');
      await fetchOrdersAndAgents();
    } catch (err) {
      setError(err.response?.data?.message || 'Manual assignment failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleAutoAssign = async (orderId) => {
    setSubmittingAction(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post(`/admin/assign/auto/${orderId}`);
      setSuccess(response.data.message);
      setSelectedOrderForAssign(null);
      await fetchOrdersAndAgents();
    } catch (err) {
      setError(err.response?.data?.message || 'Auto-assignment failed. No agents available.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleOverrideStatus = async (e) => {
    e.preventDefault();
    if (!overrideStatus || !selectedOrderForOverride) return;

    setSubmittingAction(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put(`/admin/orders/${selectedOrderForOverride._id}/override`, {
        status: overrideStatus,
        remarks: overrideRemarks.trim() || 'Status overridden by Administrator'
      });
      setSuccess(response.data.message);
      setSelectedOrderForOverride(null);
      setOverrideStatus('');
      setOverrideRemarks('');
      await fetchOrdersAndAgents();
    } catch (err) {
      setError(err.response?.data?.message || 'Override action failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Created': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Assigned': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Picked Up': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'In Transit': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Out For Delivery': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Delivered': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Rescheduled': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.assignedAgent?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white">Order Control Grid</h1>
          <p className="text-gray-400 text-sm mt-1">Manual assignments, route dispatches, and status overrides.</p>
        </div>
        <button
          onClick={fetchOrdersAndAgents}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 text-xs cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync Operations</span>
        </button>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm">
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="absolute inset-y-0 left-3 h-full w-4 text-gray-500 flex items-center" />
          <input
            type="text"
            placeholder="Search by tracking number, customer email, or agent name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 rounded-xl text-white glow-input text-xs"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Sliders className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full md:w-44 px-3 py-2 rounded-xl text-white glow-input text-xs bg-slate-900 focus:outline-none"
          >
            <option value="All">All statuses</option>
            <option value="Created">Created</option>
            <option value="Assigned">Assigned</option>
            <option value="Picked Up">Picked Up</option>
            <option value="In Transit">In Transit</option>
            <option value="Out For Delivery">Out For Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Failed">Failed</option>
            <option value="Rescheduled">Rescheduled</option>
          </select>
        </div>
      </div>

      {/* Orders grid */}
      <div className="glass-panel rounded-3xl p-6 md:p-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm">Querying database files...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm flex flex-col items-center">
            <Truck className="w-12 h-12 text-gray-700 mb-3" />
            <p className="font-semibold text-gray-400">No shipments matches criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto text-xs font-display">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Tracking ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Zones</th>
                  <th className="py-3 px-4">Billable Weight</th>
                  <th className="py-3 px-4">Courier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-200">{order.orderNumber}</td>
                    <td className="py-4 px-4 text-gray-300">
                      <div>{order.customer?.name}</div>
                      <div className="text-[10px] text-gray-500">{order.customer?.email}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      <div>{order.pickupAddress.zone} → {order.dropAddress.zone}</div>
                      <div className="text-[10px] text-gray-500">Pins: {order.pickupAddress.pincode} → {order.dropAddress.pincode}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-400">{order.pricingDetails.billableWeight} kg</td>
                    <td className="py-4 px-4 text-gray-300">
                      {order.assignedAgent ? (
                        <div className="text-indigo-400 font-semibold">{order.assignedAgent.name}</div>
                      ) : (
                        <span className="text-amber-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrderForAssign(order)}
                          className="bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer font-semibold"
                        >
                          Dispatch
                        </button>
                        <button
                          onClick={() => setSelectedOrderForOverride(order)}
                          className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Override
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispatch Agent Modal */}
      {selectedOrderForAssign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedOrderForAssign(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute top-0 left-0 w-full h-[4px] bg-indigo-500" />

            <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Courier Dispatch: {selectedOrderForAssign.orderNumber}
            </h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Order pickup zone is <span className="text-indigo-400 font-semibold">{selectedOrderForAssign.pickupAddress.zone}</span>. 
              Assign an available courier agent in this area.
            </p>

            <div className="space-y-4">
              {/* Auto assignment shortcut */}
              <button
                type="button"
                onClick={() => handleAutoAssign(selectedOrderForAssign._id)}
                disabled={submittingAction}
                className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Auto-Assign Nearest Agent</span>
              </button>

              <div className="relative flex items-center pt-2 pb-2">
                <div className="flex-grow border-t border-white/5" />
                <span className="flex-shrink mx-4 text-xs text-gray-600 font-semibold">Or Assign Manually</span>
                <div className="flex-grow border-t border-white/5" />
              </div>

              {/* Manual selection */}
              <form onSubmit={handleManualAssign} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Select Courier
                  </label>
                  <select
                    required
                    value={manualAgentId}
                    onChange={(e) => setManualAgentId(e.target.value)}
                    className="block w-full px-3 py-2 rounded-xl text-white glow-input text-xs bg-slate-950 focus:outline-none"
                  >
                    <option value="">-- Choose Courier --</option>
                    {agents.map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name} ({agent.currentZone || 'No Zone'}) - {agent.availability ? 'ONLINE' : 'OFFLINE'}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submittingAction || !manualAgentId}
                  className="w-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Confirm Manual Assignment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Override Status Modal */}
      {selectedOrderForOverride && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedOrderForOverride(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute top-0 left-0 w-full h-[4px] bg-amber-500" />

            <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Administrative Override
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Force override shipment state for <span className="text-indigo-400 font-semibold">{selectedOrderForOverride.orderNumber}</span>.
            </p>

            <form onSubmit={handleOverrideStatus} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Target Status
                </label>
                <select
                  required
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  className="block w-full px-3 py-2 rounded-xl text-white glow-input text-xs bg-slate-950 focus:outline-none"
                >
                  <option value="">-- Choose Status --</option>
                  <option value="Created">Created</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Picked Up">Picked Up</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Out For Delivery">Out For Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Failed">Failed</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Action Remarks (For Audit Timeline)
                </label>
                <textarea
                  required
                  rows="2"
                  value={overrideRemarks}
                  onChange={(e) => setOverrideRemarks(e.target.value)}
                  placeholder="Reason for overriding state (e.g. Courier updated offline, or Route delivery verified by customer)"
                  className="block w-full px-3 py-2 rounded-xl text-white glow-input text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submittingAction || !overrideStatus}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Force Status Transition
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
