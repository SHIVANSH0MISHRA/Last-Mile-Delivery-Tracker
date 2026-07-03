import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout Component
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import CreateOrder from './pages/customer/CreateOrder';
import MyOrders from './pages/customer/MyOrders';
import TrackOrder from './pages/customer/TrackOrder';
import Profile from './pages/customer/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminZones from './pages/admin/Zones';
import AdminRates from './pages/admin/Rates';
import AdminAgents from './pages/admin/Agents';

// Agent Pages
import AgentDashboard from './pages/agent/Dashboard';
import AssignedOrders from './pages/agent/AssignedOrders';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-transparent text-gray-100">
        <Navbar />
        <main className="flex-1 w-full pb-16">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Routes */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/create"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CreateOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/orders"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/track/:id"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <TrackOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/profile"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/zones"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminZones />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rates"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminRates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/agents"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAgents />
                </ProtectedRoute>
              }
            />

            {/* Agent Routes */}
            <Route
              path="/agent"
              element={
                <ProtectedRoute allowedRoles={['agent']}>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/orders"
              element={
                <ProtectedRoute allowedRoles={['agent']}>
                  <AssignedOrders />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
