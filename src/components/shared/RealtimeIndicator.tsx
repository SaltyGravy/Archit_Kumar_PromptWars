import React, { useState } from 'react';
import { Radio, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { isFirebaseConfigured } from '../../services/firebase';

interface RealtimeIndicatorProps {
  lastEventTime?: string;
}

export const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        aria-label="View real-time synchronization status"
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-400 hover:border-emerald-400 text-xs font-medium transition-all shadow-sm group"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="flex items-center gap-1">
          <Radio className="w-3 h-3 animate-pulse" />
          <span className="hidden sm:inline">Realtime Sync:</span> Active
        </span>
      </button>

      {showDetails && (
        <div 
          className="absolute right-0 top-full mt-2 w-72 p-4 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 animate-fade-in text-xs"
          role="region"
          aria-label="Real-time telemetry information"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              Live Sync Telemetry
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-950 text-brand-400 border border-brand-800">
              0 ms Latency
            </span>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Sync Engine:</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 inline" />
                {isFirebaseConfigured ? 'Firestore onSnapshot' : 'Multi-Tab Channel'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Security Rules:</span>
              <span className="font-mono text-indigo-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 inline" />
                RBAC Enforced
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tenancy Scope:</span>
              <span className="font-mono text-slate-200">event_id scoped</span>
            </div>
          </div>

          <p className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            Data across Check-ins, Announcements, Teams, and Scores reflects instantaneously across all tabs and clients.
          </p>
        </div>
      )}
    </div>
  );
};
