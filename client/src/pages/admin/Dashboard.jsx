import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, Package, Truck, DollarSign, AlertTriangle, Users, 
  Settings, Plus, RefreshCw, BarChart2, ArrowRight, Search, 
  Bell, MapPin, ClipboardList, TrendingUp, Sparkles, Navigation, CheckCircle 
} from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [stats, setStats] = useState({
    revenue: 0,
    bookings: 0,
    active: 0,
    failures: 0,
    failureRate: 0,
    activeAgents: 0
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const ordersRes = await api.get('/orders');
      const allOrders = ordersRes.data.data;
      setOrders(allOrders);

      const agentsRes = await api.get('/admin/agents');
      const allAgents = agentsRes.data.data;
      setAgents(allAgents);

      // Calculations
      const bookings = allOrders.length;
      const active = allOrders.filter(o => ['Assigned', 'Picked Up', 'In Transit', 'Out For Delivery'].includes(o.status)).length;
      const failures = allOrders.filter(o => o.status === 'Failed').length;
      const activeAgents = allAgents.filter(a => a.availability).length;
      
      const revenue = allOrders.reduce((sum, o) => {
        if (['Delivered', 'Completed', 'In Transit', 'Out For Delivery', 'Picked Up'].includes(o.status)) {
          return sum + (o.pricingDetails?.totalRate || 0);
        }
        return sum;
      }, 0);

      const failureRate = bookings > 0 ? ((failures / bookings) * 100).toFixed(1) : 0;

      setStats({
        revenue: parseFloat(revenue.toFixed(2)),
        bookings,
        active,
        failures,
        failureRate,
        activeAgents
      });
    } catch (err) {
      console.error('Failed to query administrative dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-transparent font-sans flex text-gray-100">
      
      {/* 1. Left Sidebar (Matches SwiftShip Mock) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-[#180e0c]/80 backdrop-blur-xl p-6 justify-between shrink-0">
        <div className="space-y-8">
          {/* Rebranded Logo */}
          <div className="flex items-center space-x-2 text-white">
            <Truck className="h-6 w-6 text-sunset-orange animate-pulse" />
            <span className="bg-gradient-to-r from-sunset-orange to-sunset-red bg-clip-text text-transparent font-extrabold text-xl tracking-wide">SwiftShip</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm font-medium">
            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-sunset-orange">
              <BarChart2 className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link to="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <Package className="w-4 h-4" />
              <span>Orders</span>
            </Link>
            <Link to="/customer/create" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <Plus className="w-4 h-4" />
              <span>Create Order</span>
            </Link>
            <Link to="/admin/zones" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <MapPin className="w-4 h-4" />
              <span>Zones Mapping</span>
            </Link>
            <Link to="/admin/rates" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <DollarSign className="w-4 h-4" />
              <span>Rate Cards</span>
            </Link>
            <Link to="/admin/agents" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <Users className="w-4 h-4" />
              <span>Agents</span>
            </Link>
            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <ClipboardList className="w-4 h-4" />
              <span>Reports</span>
            </Link>
            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* Footer Admin Card */}
        <div className="glass-panel rounded-2xl p-4 border border-white/5 flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-sunset-orange/10 border border-sunset-orange/20 flex items-center justify-center font-bold text-sunset-orange">
            AD
          </div>
          <div>
            <span className="block text-xs font-bold text-white">Admin User</span>
            <span className="text-[10px] text-gray-500">Administrator</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Dashboard Content (Layout matches Dashboard Mockup) */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
        
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div className="text-left anim-reveal-text">
            <h1 className="font-display font-extrabold text-3xl text-white flex items-center gap-2">
              Good Morning, Admin 👋
            </h1>
            <p className="text-gray-400 text-sm mt-0.5 font-poppins">Here's what's happening with your deliveries today.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 md:flex-none">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white glow-input"
              />
            </div>

            {/* Notification Bell */}
            <button className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl relative text-gray-400 hover:text-white transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-sunset-red animate-ping" />
            </button>

            {/* Refresh */}
            <button
              onClick={fetchDashboardData}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh Manifests"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. Performance Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 scroll-reveal">
          
          {/* Total Shipments */}
          <div className="glass-panel rounded-2xl p-6 border-l-2 border-l-sunset-orange text-left relative overflow-hidden">
            <div className="flex justify-between items-center text-gray-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Orders</span>
              <Package className="w-4 h-4 text-sunset-orange" />
            </div>
            <span className="block font-display font-extrabold text-3xl text-white mt-2">{stats.bookings}</span>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400 font-semibold font-poppins">
              <TrendingUp className="w-3 h-3" />
              <span>+18.2% vs yesterday</span>
            </div>
          </div>

          {/* In Transit */}
          <div className="glass-panel rounded-2xl p-6 border-l-2 border-l-sunset-gold text-left">
            <div className="flex justify-between items-center text-gray-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">In Transit</span>
              <Truck className="w-4 h-4 text-sunset-gold animate-bounce" />
            </div>
            <span className="block font-display font-extrabold text-3xl text-white mt-2">{stats.active}</span>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400 font-semibold font-poppins">
              <TrendingUp className="w-3 h-3" />
              <span>+12.4% vs yesterday</span>
            </div>
          </div>

          {/* Delivered */}
          <div className="glass-panel rounded-2xl p-6 border-l-2 border-l-emerald-500 text-left">
            <div className="flex justify-between items-center text-gray-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Delivered</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="block font-display font-extrabold text-3xl text-white mt-2">
              {orders.filter(o => ['Delivered', 'Completed'].includes(o.status)).length}
            </span>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400 font-semibold font-poppins">
              <TrendingUp className="w-3 h-3" />
              <span>+22.5% vs yesterday</span>
            </div>
          </div>

          {/* Failed */}
          <div className="glass-panel rounded-2xl p-6 border-l-2 border-l-sunset-red text-left">
            <div className="flex justify-between items-center text-gray-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Failed</span>
              <AlertTriangle className="w-4 h-4 text-sunset-red" />
            </div>
            <span className="block font-display font-extrabold text-3xl text-white mt-2">{stats.failures}</span>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-sunset-red font-semibold font-poppins">
              <span>-6.1% vs yesterday</span>
            </div>
          </div>
        </div>

        {/* 4. Grid Content Map & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 scroll-reveal" style={{ transitionDelay: '0.1s' }}>
          
          {/* Left Block: Map & Courier Agent Levels (8 Columns) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Live Tracking Map Card */}
            <div className="glass-panel rounded-3xl p-6 border border-white/5 relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-poppins font-bold text-sm text-white">Live Deliveries</h3>
                <span className="text-[10px] text-sunset-orange bg-sunset-orange/10 border border-sunset-orange/20 px-2 py-0.5 rounded-full font-bold">
                  Active Dispatch Map
                </span>
              </div>

              {/* Simulated Map Graphic (glowing custom SVGs) */}
              <div className="h-[260px] w-full bg-[#140b08]/80 rounded-2xl relative overflow-hidden border border-white/5">
                <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Transit Routes */}
                  <path d="M 50 150 Q 200 80, 350 200 T 600 100" fill="none" stroke="rgba(255, 122, 80, 0.25)" strokeWidth="2" strokeDasharray="5,5" />
                  <path d="M 120 220 Q 300 130, 480 80 T 680 180" fill="none" stroke="rgba(255, 59, 48, 0.2)" strokeWidth="1.5" />
                </svg>

                {/* Map Pins / Courier Pulses */}
                <div className="absolute top-[120px] left-[250px] group cursor-pointer">
                  <span className="absolute w-4 h-4 bg-sunset-orange rounded-full animate-ping opacity-75 -left-1.5 -top-1.5" />
                  <span className="relative block w-2.5 h-2.5 bg-sunset-orange rounded-full border border-white/30" />
                </div>
                
                <div className="absolute top-[80px] left-[480px]">
                  <span className="absolute w-4 h-4 bg-sunset-red rounded-full animate-ping opacity-45 -left-1.5 -top-1.5" />
                  <span className="relative block w-2.5 h-2.5 bg-sunset-red rounded-full" />
                </div>

                <div className="absolute top-[180px] left-[550px]">
                  <span className="absolute w-4 h-4 bg-emerald-500 rounded-full animate-ping opacity-45 -left-1.5 -top-1.5" />
                  <span className="relative block w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                </div>

                {/* Map Overlay Card Popover (Matches SwiftShip Mock) */}
                <div className="absolute bottom-6 right-6 glass-panel rounded-2xl p-4 border border-white/10 max-w-[240px] text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-sunset-orange animate-pulse" />
                    <span className="text-[10px] font-bold text-white">Out For Delivery</span>
                  </div>
                  <span className="block text-xs font-semibold text-gray-300">Order: DLV-78291</span>
                  <span className="block text-[10px] text-gray-500 font-poppins mt-0.5">Assigned: John Doe • ETA: 20 min</span>
                </div>
              </div>
            </div>

            {/* Courier Agents Levels (Roster) */}
            <div className="glass-panel rounded-3xl p-6 border border-white/5 text-left">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-poppins font-bold text-sm text-white">Top Performing Agents</h3>
                <Link to="/admin/agents" className="text-xs text-sunset-orange hover:text-sunset-red transition-all">View All</Link>
              </div>

              <div className="space-y-4">
                {/* Agent 1 */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sunset-orange/10 border border-sunset-orange/20 flex items-center justify-center text-xs font-bold text-sunset-orange font-poppins">
                      RK
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-white">Ravi Kumar</span>
                      <span className="text-[10px] text-gray-500">Zone A Courier</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-1 max-w-[200px]">
                    <div className="h-1.5 bg-white/5 rounded-full w-full overflow-hidden">
                      <div className="h-full bg-sunset-orange rounded-full" style={{ width: '98%' }} />
                    </div>
                    <span className="text-xs font-bold text-gray-300 font-poppins">98%</span>
                  </div>
                </div>

                {/* Agent 2 */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sunset-red/10 border border-sunset-red/20 flex items-center justify-center text-xs font-bold text-sunset-red font-poppins">
                      AS
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-white">Arjun Singh</span>
                      <span className="text-[10px] text-gray-500">Zone B Courier</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-1 max-w-[200px]">
                    <div className="h-1.5 bg-white/5 rounded-full w-full overflow-hidden">
                      <div className="h-full bg-sunset-red rounded-full" style={{ width: '97%' }} />
                    </div>
                    <span className="text-xs font-bold text-gray-300 font-poppins">97%</span>
                  </div>
                </div>

                {/* Agent 3 */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sunset-gold/10 border border-sunset-gold/20 flex items-center justify-center text-xs font-bold text-sunset-gold font-poppins">
                      NP
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-white">Neha Patel</span>
                      <span className="text-[10px] text-gray-500">Zone C Courier</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-1 max-w-[200px]">
                    <div className="h-1.5 bg-white/5 rounded-full w-full overflow-hidden">
                      <div className="h-full bg-sunset-gold rounded-full" style={{ width: '96%' }} />
                    </div>
                    <span className="text-xs font-bold text-gray-300 font-poppins">96%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Block: Recent Orders & Weekly Analytics (4 Columns) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Recent Orders Manifest */}
            <div className="glass-panel rounded-3xl p-6 border border-white/5 text-left">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-poppins font-bold text-sm text-white">Recent Orders</h3>
                <Link to="/admin/orders" className="text-xs text-sunset-orange hover:text-sunset-red transition-all">View All</Link>
              </div>

              {loading ? (
                <div className="text-center py-6 text-gray-600 text-xs">Querying...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-6 text-gray-600 text-xs">No active orders logged.</div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                      <div className="space-y-0.5">
                        <span className="block text-xs font-bold text-white">{order.orderNumber}</span>
                        <span className="block text-[10px] text-gray-500">
                          {order.pickupAddress?.zone} → {order.dropAddress?.zone}
                        </span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        ['Delivered', 'Completed'].includes(order.status) ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                        order.status === 'Failed' ? 'text-sunset-red bg-sunset-red/10 border-sunset-red/20' :
                        order.status === 'Out For Delivery' ? 'text-sunset-orange bg-sunset-orange/10 border-sunset-orange/20' :
                        'text-sunset-gold bg-sunset-gold/10 border-sunset-gold/20'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery Analytics Overview Chart (Custom SVG Sparkline curves) */}
            <div className="glass-panel rounded-3xl p-6 border border-white/5 text-left">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-poppins font-bold text-sm text-white">Delivery Overview</h3>
                <span className="text-[10px] text-gray-500 font-semibold font-poppins">This Week</span>
              </div>

              {/* Styled SVG Chart */}
              <div className="h-[120px] w-full bg-[#140b08]/80 rounded-2xl p-2 relative border border-white/5">
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  {/* Grid background lines */}
                  <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  
                  {/* Curve 1: Delivered (Emerald) */}
                  <path d="M 0 35 Q 20 20, 40 28 T 80 15 T 100 5" fill="none" stroke="#10b981" strokeWidth="1" />
                  {/* Curve 2: In Transit (Orange) */}
                  <path d="M 0 38 Q 20 28, 40 32 T 80 20 T 100 15" fill="none" stroke="#ff7a50" strokeWidth="1" />
                  {/* Curve 3: Failed (Red) */}
                  <path d="M 0 39 Q 20 37, 40 38 T 80 35 T 100 37" fill="none" stroke="#ff3b30" strokeWidth="0.5" />
                </svg>
              </div>

              {/* Legend Indicators */}
              <div className="mt-4 flex justify-between items-center text-[10px] font-semibold text-gray-500 font-poppins">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Delivered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff7a50]" />
                  <span>In Transit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff3b30]" />
                  <span>Failed</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
