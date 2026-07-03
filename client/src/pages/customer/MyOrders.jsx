import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Search, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
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
      order.dropAddress.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.dropAddress.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white">My Shipments</h1>
          <p className="text-gray-400 text-sm mt-1">Review the status and ledger of your packages.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 text-sm cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filters Search bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute inset-y-0 left-3 h-full w-4 text-gray-500 flex items-center" />
          <input
            type="text"
            placeholder="Search by Tracking ID, street, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 rounded-xl text-white glow-input text-xs"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">Status:</span>
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

      {/* List / Table */}
      <div className="glass-panel rounded-3xl p-6 md:p-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm">Querying database shipments...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm flex flex-col items-center">
            <ClipboardList className="w-12 h-12 text-gray-700 mb-3" />
            <p className="font-semibold text-gray-400">No shipments found</p>
            <p className="text-gray-600 text-xs mt-1">Try relaxing your search query or status filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-display text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Tracking ID</th>
                  <th className="py-3 px-4">Pickup Zone</th>
                  <th className="py-3 px-4">Drop Destination</th>
                  <th className="py-3 px-4">Rate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-200">{order.orderNumber}</td>
                    <td className="py-4 px-4 text-gray-400">{order.pickupAddress.zone}</td>
                    <td className="py-4 px-4 text-gray-300">
                      <div>{order.dropAddress.street}</div>
                      <div className="text-xs text-gray-500">{order.dropAddress.city} - {order.dropAddress.pincode}</div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-white">${order.pricingDetails.totalRate}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-3">
                        {order.status === 'Failed' && (
                          <Link
                            to={`/customer/track/${order._id}`}
                            className="text-xs font-semibold text-red-400 hover:text-red-300 border border-red-500/20 bg-red-500/5 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Reschedule</span>
                          </Link>
                        )}
                        <Link
                          to={`/customer/track/${order._id}`}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 border border-white/5 bg-white/5 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
