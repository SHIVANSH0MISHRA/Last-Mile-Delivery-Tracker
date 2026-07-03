import React, { useEffect, useState } from 'react';
import { Map, Plus, Landmark, RefreshCw, AlertCircle, Trash } from 'lucide-react';
import api from '../../services/api';

const AdminZones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [pincodesInput, setPincodesInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchZones = async () => {
    try {
      const response = await api.get('/admin/zones');
      setZones(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !pincodesInput.trim()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    // Parse comma-separated list of pincodes
    const pincodes = pincodesInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    try {
      await api.post('/admin/zones', { name, pincodes });
      setSuccess(`Zone '${name}' configured successfully!`);
      setName('');
      setPincodesInput('');
      await fetchZones();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to configure zone.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white">Zone Configurations</h1>
          <p className="text-gray-400 text-sm mt-1">Declare geographic operations boundaries and assign zip codes.</p>
        </div>
        <button
          onClick={fetchZones}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 text-xs cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Zones</span>
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
        {/* Left Form */}
        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 space-y-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-indigo-500" />
          
          <h2 className="font-display font-bold text-base text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Plus className="w-5 h-5 text-indigo-400" />
            Add Shipping Zone
          </h2>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Zone Identifier
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Zone D or East Coast"
              className="block w-full px-3 py-2.5 rounded-xl text-white glow-input text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Zip/Pincodes List (Comma separated)
            </label>
            <textarea
              required
              rows="4"
              value={pincodesInput}
              onChange={(e) => setPincodesInput(e.target.value)}
              placeholder="e.g. 110005, 110006, 110007"
              className="block w-full px-3 py-2.5 rounded-xl text-white glow-input text-xs"
            />
            <span className="text-[10px] text-gray-600 mt-1 block">
              Enter zip codes separated by commas. Our auto-pricing engine resolves route zones from these entries.
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting || !name || !pincodesInput}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
          >
            {submitting ? 'Registering...' : 'Add Zone'}
          </button>
        </form>

        {/* Right zones cards */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-indigo-400" />
            Registered operational areas
          </h2>

          {loading ? (
            <div className="glass-panel rounded-2xl p-10 text-center text-gray-500 text-sm">Querying database...</div>
          ) : zones.length === 0 ? (
            <div className="glass-panel rounded-2xl p-10 text-center text-gray-500 text-sm">
              No zones registered yet. Use the control form to bootstrap zones.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {zones.map((zone) => (
                <div key={zone._id} className="glass-panel rounded-2xl p-5 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/30" />
                  
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="font-display font-extrabold text-sm text-gray-200">{zone.name}</span>
                    <span className="text-[10px] text-gray-500 font-bold bg-white/5 px-2 py-0.5 rounded-full">
                      {zone.pincodes.length} Zip codes
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {zone.pincodes.map((pin, i) => (
                      <span key={i} className="text-[10px] text-gray-400 bg-slate-950/60 border border-white/5 px-2 py-0.5 rounded-lg">
                        {pin}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminZones;
