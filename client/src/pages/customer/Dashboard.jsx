import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, PlusCircle, ArrowRight, Truck, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, completed: 0, failed: 0, total: 0 });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        const list = response.data.data;
        setOrders(list);

        // Compute statistics
        const active = list.filter(o => !['Delivered', 'Completed', 'Failed'].includes(o.status)).length;
        const completed = list.filter(o => ['Delivered', 'Completed'].includes(o.status)).length;
        const failed = list.filter(o => o.status === 'Failed').length;

        setStats({ active, completed, failed, total: list.length });
      } catch (err) {
        console.error('Failed to load dashboard orders:', err);
      } finally {
        setLoading(false);
      }
    };
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
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white">Customer Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Book and track your active package shipments.</p>
        </div>
        <Link
          to="/customer/create"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Delivery Quote</span>
        </Link>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Bookings</span>
            <Package className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="block font-display font-extrabold text-3xl text-white mt-2">{stats.total}</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Shipments</span>
            <Truck className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="block font-display font-extrabold text-3xl text-indigo-400 mt-2">{stats.active}</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="block font-display font-extrabold text-3xl text-emerald-400 mt-2">{stats.completed}</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Failed Attempts</span>
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <span className="block font-display font-extrabold text-3xl text-red-400 mt-2">{stats.failed}</span>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="glass-panel rounded-3xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Recent Shipments
          </h2>
          <Link to="/customer/orders" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500 text-sm">Loading bookings...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            <p>You haven't placed any delivery bookings yet.</p>
            <Link to="/customer/create" className="text-indigo-400 font-semibold hover:underline mt-2 inline-block">
              Calculate your first shipment price now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-display text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Tracking ID</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Billable Weight</th>
                  <th className="py-3 px-4">Rate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-200">{order.orderNumber}</td>
                    <td className="py-4 px-4 text-gray-300">
                      {order.dropAddress.city} ({order.dropAddress.pincode})
                    </td>
                    <td className="py-4 px-4 text-gray-400">{order.pricingDetails.billableWeight} kg</td>
                    <td className="py-4 px-4 font-semibold text-white">${order.pricingDetails.totalRate}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/customer/track/${order._id}`}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                      >
                        <span>Track</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
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

export default CustomerDashboard;
