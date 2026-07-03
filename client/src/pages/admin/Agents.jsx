import React, { useEffect, useState } from 'react';
import { Users, Shield, MapPin, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const AdminAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      const response = await api.get('/admin/agents');
      setAgents(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white">Courier Agent Roster</h1>
          <p className="text-gray-400 text-sm mt-1">Monitor agent zones, availability queue, and simulated GPS coordinates.</p>
        </div>
        <button
          onClick={fetchAgents}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 text-xs cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Roster</span>
        </button>
      </div>

      {/* Agents cards */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 text-sm">Querying database...</div>
      ) : agents.length === 0 ? (
        <div className="glass-panel rounded-3xl p-10 text-center text-gray-500 text-sm">
          No delivery agent profiles registered in database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent._id} className="glass-panel rounded-2xl p-6 space-y-5 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-indigo-500/40" />
              
              <div>
                {/* Profile row */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-display font-bold uppercase text-xs">
                      {agent.name.slice(0, 2)}
                    </div>
                    <div>
                      <span className="font-display font-bold text-sm text-white block">{agent.name}</span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">{agent.email}</span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    agent.availability 
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                      : 'text-red-400 bg-red-500/10 border-red-500/20'
                  }`}>
                    {agent.availability ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>

                {/* Operations Info */}
                <div className="pt-4 space-y-2 border-t border-white/5 mt-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assigned Zone</span>
                    <span className="text-indigo-400 font-semibold">{agent.currentZone || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duty Status</span>
                    <span className="text-gray-300 font-medium">
                      {agent.availability ? 'In Dispatch Pool' : 'Off Duty'}
                    </span>
                  </div>
                </div>
              </div>

              {/* GPS Coordinates Simulation */}
              <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3.5 flex items-center gap-2.5 text-[11px]">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase tracking-wider font-semibold">Simulated GPS Coordinates</span>
                  <span className="text-gray-300 font-medium">
                    Lat: {agent.currentLocation?.lat?.toFixed(4) || '0.0000'} | Lng: {agent.currentLocation?.lng?.toFixed(4) || '0.0000'}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAgents;
