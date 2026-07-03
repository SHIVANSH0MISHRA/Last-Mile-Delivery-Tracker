import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ArrowRight, CheckCircle, AlertCircle, ShoppingBag, Landmark } from 'lucide-react';
import api from '../../services/api';

const CreateOrder = () => {
  const navigate = useNavigate();

  // Form State
  const [pickupAddress, setPickupAddress] = useState({ street: '', city: '', pincode: '' });
  const [dropAddress, setDropAddress] = useState({ street: '', city: '', pincode: '' });
  const [packageDetails, setPackageDetails] = useState({ length: '', breadth: '', height: '', weight: '' });
  const [paymentMethod, setPaymentMethod] = useState('Prepaid');
  const [customerType, setCustomerType] = useState('B2C');

  // Logic State
  const [calculating, setCalculating] = useState(false);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  
  const [booking, setBooking] = useState(false);
  const [bookedOrder, setBookedOrder] = useState(null);

  const handleCalculateQuote = async (e) => {
    e.preventDefault();
    setError('');
    setQuote(null);

    const { street: pStreet, city: pCity, pincode: pPin } = pickupAddress;
    const { street: dStreet, city: dCity, pincode: dPin } = dropAddress;
    const { length, breadth, height, weight } = packageDetails;

    if (!pStreet || !pCity || !pPin || !dStreet || !dCity || !dPin || !length || !breadth || !height || !weight) {
      setError('Please fill in all address coordinates and package specifications.');
      return;
    }

    setCalculating(true);
    try {
      const response = await api.post('/orders/calculate-quote', {
        pickupPincode: pPin,
        dropPincode: dPin,
        length: parseFloat(length),
        breadth: parseFloat(breadth),
        height: parseFloat(height),
        weight: parseFloat(weight),
        customerType,
        paymentMethod
      });
      setQuote(response.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Price calculation failed. Verify your pincodes.');
    } finally {
      setCalculating(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!quote) return;
    setError('');
    setBooking(true);

    try {
      const response = await api.post('/orders', {
        pickupAddress,
        dropAddress,
        packageDetails,
        paymentMethod,
        customerType
      });
      setBookedOrder(response.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Booking submission failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (bookedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-emerald-500 to-indigo-500" />
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white">Delivery Booked Successfully!</h1>
          <p className="text-gray-400 text-sm mt-2 max-w-md">
            Your package booking has been successfully processed and assigned to our routing operations.
          </p>

          {/* Tracking Ticket */}
          <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-6 mt-8 w-full text-left space-y-4 font-display">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Tracking Number</span>
              <span className="text-sm font-bold text-indigo-400">{bookedOrder.orderNumber}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500 block">Pickup Zone</span>
                <span className="text-gray-300 font-semibold">{bookedOrder.pickupAddress.zone}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Drop Zone</span>
                <span className="text-gray-300 font-semibold">{bookedOrder.dropAddress.zone}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Billable Weight</span>
                <span className="text-gray-300 font-semibold">{bookedOrder.pricingDetails.billableWeight} kg</span>
              </div>
              <div>
                <span className="text-gray-500 block">Total Shipping Rate</span>
                <span className="text-gray-300 font-bold text-white">${bookedOrder.pricingDetails.totalRate}</span>
              </div>
            </div>
            {bookedOrder.assignedAgent ? (
              <div className="pt-3 border-t border-white/5 text-xs text-indigo-300">
                🤖 Auto-assigned to Agent: <span className="font-semibold">{bookedOrder.assignedAgent.name}</span>
              </div>
            ) : (
              <div className="pt-3 border-t border-white/5 text-xs text-amber-400">
                ⚠️ Awaiting manual agent assignment.
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full">
            <button
              onClick={() => navigate(`/customer/track/${bookedOrder._id}`)}
              className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 cursor-pointer"
            >
              Track Shipment Journey
            </button>
            <button
              onClick={() => {
                setBookedOrder(null);
                setQuote(null);
                setPickupAddress({ street: '', city: '', pincode: '' });
                setDropAddress({ street: '', city: '', pincode: '' });
                setPackageDetails({ length: '', breadth: '', height: '', weight: '' });
              }}
              className="w-full sm:flex-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer"
            >
              Book Another Package
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl text-white">Dynamic Shipping Calculator</h1>
        <p className="text-gray-400 text-sm mt-1">Get volumetric pricing estimates and dispatch last-mile deliveries instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Entry */}
        <form onSubmit={handleCalculateQuote} className="lg:col-span-2 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-2.5 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Addresses Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <h2 className="font-display font-bold text-lg text-white border-b border-white/5 pb-3">Route Coordinates</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup Address */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">1. Pickup Address</span>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={pickupAddress.street}
                    onChange={(e) => setPickupAddress({ ...pickupAddress, street: e.target.value })}
                    placeholder="123 Warehousing Rd"
                    className="block w-full px-3 py-2.5 rounded-xl text-white glow-input text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={pickupAddress.city}
                      onChange={(e) => setPickupAddress({ ...pickupAddress, city: e.target.value })}
                      placeholder="Delhi"
                      className="block w-full px-3 py-2.5 rounded-xl text-white glow-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={pickupAddress.pincode}
                      onChange={(e) => setPickupAddress({ ...pickupAddress, pincode: e.target.value })}
                      placeholder="110001"
                      className="block w-full px-3 py-2.5 rounded-xl text-white glow-input text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Drop Address */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider block">2. Drop Address</span>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={dropAddress.street}
                    onChange={(e) => setDropAddress({ ...dropAddress, street: e.target.value })}
                    placeholder="456 Retailers Lane"
                    className="block w-full px-3 py-2.5 rounded-xl text-white glow-input text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={dropAddress.city}
                      onChange={(e) => setDropAddress({ ...dropAddress, city: e.target.value })}
                      placeholder="Mumbai"
                      className="block w-full px-3 py-2.5 rounded-xl text-white glow-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={dropAddress.pincode}
                      onChange={(e) => setDropAddress({ ...dropAddress, pincode: e.target.value })}
                      placeholder="400001"
                      className="block w-full px-3 py-2.5 rounded-xl text-white glow-input text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Package Details Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <h2 className="font-display font-bold text-lg text-white border-b border-white/5 pb-3">Package Metrics</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Length (cm)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={packageDetails.length}
                  onChange={(e) => setPackageDetails({ ...packageDetails, length: e.target.value })}
                  placeholder="30"
                  className="block w-full px-3 py-2.5 rounded-xl text-white glow-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Breadth (cm)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={packageDetails.breadth}
                  onChange={(e) => setPackageDetails({ ...packageDetails, breadth: e.target.value })}
                  placeholder="20"
                  className="block w-full px-3 py-2.5 rounded-xl text-white glow-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Height (cm)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={packageDetails.height}
                  onChange={(e) => setPackageDetails({ ...packageDetails, height: e.target.value })}
                  placeholder="15"
                  className="block w-full px-3 py-2.5 rounded-xl text-white glow-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Actual Wt (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={packageDetails.weight}
                  onChange={(e) => setPackageDetails({ ...packageDetails, weight: e.target.value })}
                  placeholder="1.8"
                  className="block w-full px-3 py-2.5 rounded-xl text-white glow-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Customer Tier</label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="block w-full px-3 py-2.5 rounded-xl text-white glow-input text-xs bg-slate-900 focus:outline-none"
                >
                  <option value="B2C">B2C Retailer (Standard)</option>
                  <option value="B2B">B2B Corporate (Bulk Discount)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="block w-full px-3 py-2.5 rounded-xl text-white glow-input text-xs bg-slate-900 focus:outline-none"
                >
                  <option value="Prepaid">Prepaid (Zero Markup)</option>
                  <option value="COD">COD - Cash on Delivery (Surcharge Applies)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={calculating}
            className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 cursor-pointer font-display text-sm"
          >
            {calculating ? 'Processing Metrics...' : 'Calculate Delivery Charges'}
            <Calculator className="w-4 h-4" />
          </button>
        </form>

        {/* Pricing Summary Sidepanel */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full min-h-[300px]">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-indigo-500/40" />
            
            {quote ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-white text-lg flex items-center gap-2 mb-4">
                    <ShoppingBag className="w-5 h-5 text-indigo-400" />
                    Delivery Quote
                  </h3>

                  <div className="space-y-3.5 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Pickup Zone</span>
                      <span className="text-gray-200 font-semibold">{quote.pickupZone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Drop Zone</span>
                      <span className="text-gray-200 font-semibold">{quote.dropZone}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-2.5">
                      <span>Volumetric Weight</span>
                      <span className="text-gray-200 font-semibold">{quote.volumetricWeight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Billable Weight</span>
                      <span className="text-indigo-400 font-bold">{quote.billableWeight} kg</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-2.5">
                      <span>Base Route Rate</span>
                      <span className="text-gray-200">${quote.baseRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Incremental Charge</span>
                      <span className="text-gray-200">+${quote.incrementalRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>COD Collection Fee</span>
                      <span className="text-gray-200">+${quote.codCharge}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 mt-6">
                  <div className="flex justify-between items-baseline mb-6">
                    <span className="text-sm font-semibold text-white">Estimated Cost</span>
                    <span className="text-3xl font-display font-extrabold text-emerald-400">${quote.totalRate}</span>
                  </div>

                  <button
                    onClick={handleConfirmOrder}
                    disabled={booking}
                    className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 cursor-pointer font-display text-sm"
                  >
                    {booking ? 'Submitting Booking...' : 'Confirm & Place Shipment'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 flex-1">
                <Landmark className="w-12 h-12 text-gray-700 mb-4" />
                <span className="font-display font-bold text-gray-500 text-sm">No Estimate Computed</span>
                <p className="text-gray-600 text-xs mt-1 max-w-[200px]">
                  Fill out the address forms and dimensional properties to generate pricing quotes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;
