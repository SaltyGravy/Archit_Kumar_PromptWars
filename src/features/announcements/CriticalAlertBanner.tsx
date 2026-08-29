import React, { useState } from 'react';
import { Announcement } from '../../types';
import { AlertCircle, X } from 'lucide-react';

interface CriticalAlertBannerProps {
  announcements: Announcement[];
}

export const CriticalAlertBanner: React.FC<CriticalAlertBannerProps> = ({ announcements }) => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Find the latest critical announcement that has not been dismissed
  const critical = announcements.find(
    (a) => a.severity === 'critical' && !dismissedIds.has(a.id)
  );

  if (!critical) return null;

  const handleDismiss = () => {
    setDismissedIds((prev) => new Set(prev).add(critical.id));
  };

  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className="w-full bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 border-b border-rose-600/60 p-3 shadow-2xl animate-fade-in relative z-30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 animate-pulse flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0 text-xs sm:text-sm">
            <span className="font-extrabold text-white mr-2 uppercase tracking-wider text-[11px] bg-rose-600 px-2 py-0.5 rounded">
              CRITICAL BROADCAST
            </span>
            <strong className="text-rose-100 font-semibold">{critical.title}:</strong>{' '}
            <span className="text-rose-200/90 truncate">{critical.body}</span>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss critical broadcast alert"
          className="p-1 text-rose-300 hover:text-white rounded-lg hover:bg-rose-800/50 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
