import React, { useEffect, useState } from 'react';
import { Landmark, Plus, Trash2, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const AdminRates = () => {
  const [rates, setRates] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [pickupZone, setPickupZone] = useState('');
  const [dropZone, setDropZone] = useState('');
  const [customerType, setCustomerType] = useState('B2C');
  const [paymentMethod, setPaymentMethod] = useState('Prepaid');
  const [baseWeightLimit, setBaseWeightLimit] = useState('');
  const [baseRate, setBaseRate] = useState('');
  const [perKgIncrementalRate, setPerKgIncrementalRate] = useState('');
  const [extraCharge, setExtraCharge] = useState('0');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchRatesAndZones = async () => {
    try {
      const ratesRes = await api.get('/admin/ratecards');
      setRates(ratesRes.data.data);

      const zonesRes = await api.get('/admin/zones');
      setZones(zonesRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatesAndZones();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickupZone || !dropZone || !baseWeightLimit || !baseRate || !perKgIncrementalRate) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/admin/ratecards', {
        pickupZone,
        dropZone,
        customerType,
        paymentMethod,
        baseWeightLimit: parseFloat(baseWeightLimit),
        baseRate: parseFloat(baseRate),
        perKgIncrementalRate: parseFloat(perKgIncrementalRate),
        extraCharge: parseFloat(extraCharge || 0)
      });
      setSuccess('Rate Card created successfully.');
      setBaseWeightLimit('');
      setBaseRate('');
      setPerKgIncrementalRate('');
      setExtraCharge('0');
      await fetchRatesAndZones();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create rate card.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this Rate Card?')) return;
    setError('');
    setSuccess('');
    
    try {
      await api.delete(`/admin/ratecards/${id}`);
      setSuccess('Rate Card removed successfully.');
      await fetchRatesAndZones();
    } catch (err) {
      console.error(err);
      setError('Failed to remove rate card.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white">Rate Card Editor</h1>
          <p className="text-gray-400 text-sm mt-1">Configure dynamic logistics rate formulas for B2B/B2C client tiers.</p>
        </div>
        <button
          onClick={fetchRatesAndZones}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 text-xs cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Rates</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Card Form */}
        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 space-y-4 relative overflow-hidden text-xs">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-indigo-500" />
          
          <h2 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Plus className="w-5 h-5 text-indigo-400" />
            Add New Rate Card
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Pickup Zone</label>
              <select
                required
                value={pickupZone}
                onChange={(e) => setPickupZone(e.target.value)}
                className="block w-full px-2 py-2 rounded-xl text-white glow-input bg-slate-950 focus:outline-none"
              >
                <option value="">-- Select --</option>
                {zones.map(z => <option key={z._id} value={z.name}>{z.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Drop Zone</label>
              <select
                required
                value={dropZone}
                onChange={(e) => setDropZone(e.target.value)}
                className="block w-full px-2 py-2 rounded-xl text-white glow-input bg-slate-950 focus:outline-none"
              >
                <option value="">-- Select --</option>
                {zones.map(z => <option key={z._id} value={z.name}>{z.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Client Tier</label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value)}
                className="block w-full px-2 py-2 rounded-xl text-white glow-input bg-slate-950 focus:outline-none"
              >
                <option value="B2C">B2C Retailer</option>
                <option value="B2B">B2B Corporate</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Pay Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="block w-full px-2 py-2 rounded-xl text-white glow-input bg-slate-950 focus:outline-none"
              >
                <option value="Prepaid">Prepaid</option>
                <option value="COD">COD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Base Wt Limit (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={baseWeightLimit}
                onChange={(e) => setBaseWeightLimit(e.target.value)}
                placeholder="e.g. 2.0"
                className="block w-full px-3 py-2 rounded-xl text-white glow-input"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Base Rate ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={baseRate}
                onChange={(e) => setBaseRate(e.target.value)}
                placeholder="e.g. 5.00"
                className="block w-full px-3 py-2 rounded-xl text-white glow-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Per Kg Incremental ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={perKgIncrementalRate}
                onChange={(e) => setPerKgIncrementalRate(e.target.value)}
                placeholder="e.g. 1.50"
                className="block w-full px-3 py-2 rounded-xl text-white glow-input"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Extra Fee/COD ($)</label>
              <input
                type="number"
                step="0.01"
                value={extraCharge}
                onChange={(e) => setExtraCharge(e.target.value)}
                placeholder="e.g. 2.00"
                className="block w-full px-3 py-2 rounded-xl text-white glow-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !pickupZone || !dropZone || !baseWeightLimit || !baseRate}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors mt-2 cursor-pointer"
          >
            {submitting ? 'Registering...' : 'Save Rate Card'}
          </button>
        </form>

        {/* Right card grids */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-400" />
            Active rates card list
          </h2>

          {loading ? (
            <div className="glass-panel rounded-2xl p-10 text-center text-gray-500 text-sm">Querying database...</div>
          ) : rates.length === 0 ? (
            <div className="glass-panel rounded-2xl p-10 text-center text-gray-500 text-sm">
              No rates structured yet. Fill the configuration form.
            </div>
          ) : (
            <div className="overflow-x-auto text-[11px] font-display glass-panel rounded-2xl p-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 uppercase tracking-wider">
                    <th className="py-2.5 px-2">Route</th>
                    <th className="py-2.5 px-2">Tier</th>
                    <th className="py-2.5 px-2">Pay</th>
                    <th className="py-2.5 px-2">Base (limit)</th>
                    <th className="py-2.5 px-2">Inc /kg</th>
                    <th className="py-2.5 px-2">Surcharge</th>
                    <th className="py-2.5 px-2 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rates.map((card) => (
                    <tr key={card._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 font-semibold text-gray-200">{card.pickupZone} → {card.dropZone}</td>
                      <td className="py-3 px-2 text-gray-300">{card.customerType}</td>
                      <td className="py-3 px-2 text-gray-300">{card.paymentMethod}</td>
                      <td className="py-3 px-2 text-gray-400">${card.baseRate} ({card.baseWeightLimit}kg)</td>
                      <td className="py-3 px-2 text-gray-400">${card.perKgIncrementalRate}</td>
                      <td className="py-3 px-2 text-gray-400">${card.extraCharge || 0}</td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => handleDelete(card._id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRates;
