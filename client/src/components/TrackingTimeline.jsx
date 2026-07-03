import React from 'react';
import { Check, ClipboardList, UserCheck, PackageOpen, Truck, Landmark, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

const ALL_STATUSES = ['Created', 'Assigned', 'Picked Up', 'In Transit', 'Out For Delivery', 'Delivered'];

const STATUS_ICONS = {
  'Created': ClipboardList,
  'Assigned': UserCheck,
  'Picked Up': PackageOpen,
  'In Transit': Truck,
  'Out For Delivery': Landmark,
  'Delivered': CheckCircle,
  'Failed': ShieldAlert,
  'Rescheduled': Clock
};

const STATUS_COLORS = {
  'Created': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Assigned': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Picked Up': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'In Transit': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  'Out For Delivery': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  'Delivered': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Failed': 'text-red-400 bg-red-500/10 border-red-500/20',
  'Rescheduled': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
};

const TrackingTimeline = ({ currentStatus, history = [] }) => {
  // Determine progress step index
  const isFailed = currentStatus === 'Failed';
  const isRescheduled = currentStatus === 'Rescheduled';
  
  let activeIndex = ALL_STATUSES.indexOf(currentStatus);
  if (currentStatus === 'Completed') activeIndex = 5;
  if (isFailed || isRescheduled) {
    // Show progress up to Out for Delivery (index 4) then mark failed/rescheduled
    activeIndex = 4;
  }

  const getStepStatus = (index) => {
    if (index < activeIndex) return 'completed';
    if (index === activeIndex) {
      if (isFailed) return 'failed';
      if (isRescheduled) return 'rescheduled';
      return 'active';
    }
    return 'pending';
  };

  return (
    <div className="w-full flex flex-col space-y-8">
      {/* 1. Visual Progress Stepper */}
      <div className="relative w-full flex justify-between items-center px-2">
        {/* Connector Line */}
        <div className="absolute top-5 left-8 right-8 h-[2px] bg-gray-800 z-0">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 transition-all duration-500" 
            style={{ width: `${(Math.max(0, activeIndex) / 5) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {ALL_STATUSES.map((status, index) => {
          const stepStatus = getStepStatus(index);
          const IconComponent = STATUS_ICONS[status];
          
          let circleClass = 'bg-gray-900 border-2 border-gray-700 text-gray-500';
          let labelClass = 'text-gray-500';
          
          if (stepStatus === 'completed') {
            circleClass = 'bg-emerald-600 border-2 border-emerald-400 text-white shadow-lg shadow-emerald-500/20 z-10 scale-110';
            labelClass = 'text-emerald-400 font-semibold';
          } else if (stepStatus === 'active') {
            circleClass = 'bg-indigo-600 border-2 border-indigo-400 text-white shadow-lg shadow-indigo-500/20 z-10 scale-115 animate-pulse';
            labelClass = 'text-indigo-400 font-bold';
          } else if (stepStatus === 'failed') {
            circleClass = 'bg-red-600 border-2 border-red-400 text-white shadow-lg shadow-red-500/20 z-10 scale-115';
            labelClass = 'text-red-400 font-bold';
          } else if (stepStatus === 'rescheduled') {
            circleClass = 'bg-indigo-600 border-2 border-indigo-400 text-white shadow-lg shadow-indigo-500/20 z-10 scale-115';
            labelClass = 'text-indigo-400 font-bold';
          }

          return (
            <div key={status} className="flex flex-col items-center z-10 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${circleClass}`}>
                {stepStatus === 'completed' ? <Check className="w-5 h-5" /> : <IconComponent className="w-5 h-5" />}
              </div>
              <span className={`text-[10px] md:text-xs mt-2 text-center max-w-[80px] font-display transition-colors ${labelClass}`}>
                {stepStatus === 'failed' ? 'Failed' : stepStatus === 'rescheduled' ? 'Rescheduled' : status}
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. Chronological Status Logs */}
      <div className="glass-panel rounded-2xl p-6 md:p-8">
        <h3 className="font-display font-bold text-lg text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          Shipment Journey History
        </h3>

        {history.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No tracking logs registered yet.</p>
        ) : (
          <div className="flex flex-col space-y-6">
            {history.map((log, index) => {
              const LogIcon = STATUS_ICONS[log.status] || ClipboardList;
              const badgeColors = STATUS_COLORS[log.status] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';

              return (
                <div key={log._id || index} className="timeline-item relative flex items-start space-x-4">
                  {/* Indicator Icon */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border shrink-0 z-10 ${badgeColors}`}>
                    <LogIcon className="w-3.5 h-3.5" />
                  </div>

                  {/* Log Card */}
                  <div className="flex-1 min-w-0 bg-white/5 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border w-fit ${badgeColors}`}>
                        {log.status}
                      </span>
                      <span className="text-xs text-gray-500 font-display">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 mt-2 font-display">
                      {log.remarks}
                    </p>

                    <div className="mt-2 text-[11px] text-gray-500 flex items-center gap-1">
                      <span>Updated by:</span>
                      <span className="text-gray-400 font-medium">
                        {log.updatedBy ? `${log.updatedBy.name} (${log.updatedBy.role})` : 'System'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingTimeline;
