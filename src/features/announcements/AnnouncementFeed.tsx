import React, { useState } from 'react';
import { AnnouncementSeverity } from '../../types';
import { realtimeStore } from '../../services/realtimeStore';
import { Megaphone, Pin, AlertTriangle, AlertCircle, Info, Clock, Radio } from 'lucide-react';

export const AnnouncementFeed: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');

  const announcements = realtimeStore.getAnnouncements();

  const filteredAnnouncements = announcements.filter((a) => {
    const matchCat = categoryFilter === 'All' || a.category === categoryFilter;
    const matchSev = severityFilter === 'All' || a.severity === severityFilter;
    return matchCat && matchSev;
  });

  const getSeverityStyle = (severity: AnnouncementSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          border: 'border-rose-700/50 hover:border-rose-600',
          icon: AlertCircle,
          iconColor: 'text-rose-400',
        };
      case 'warning':
        return {
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          border: 'border-amber-700/50 hover:border-amber-600',
          icon: AlertTriangle,
          iconColor: 'text-amber-400',
        };
      case 'info':
      default:
        return {
          badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          border: 'border-slate-800 hover:border-slate-700',
          icon: Info,
          iconColor: 'text-indigo-400',
        };
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Header & Filter Controls */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-panel shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center gap-1.5">
              <Radio className="w-3 h-3 animate-pulse text-brand-400" />
              Live Announcement Broadcasts
            </span>
            <span className="text-xs font-bold text-slate-400">
              ({announcements.length} updates)
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">Official Event Feed</h3>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['All', 'Schedule', 'Venue', 'Judging', 'Urgent'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  categoryFilter === cat
                    ? 'bg-slate-800 text-white border border-brand-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'All', label: 'All Severity' },
              { id: 'critical', label: 'Critical' },
              { id: 'warning', label: 'Warning' },
              { id: 'info', label: 'Info' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSeverityFilter(id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  severityFilter === id
                    ? 'bg-slate-800 text-white border border-indigo-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements Stream */}
      {filteredAnnouncements.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 text-xs">
          <Megaphone className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="font-semibold text-slate-300">No announcements in this channel</p>
          <p className="text-[11px] text-slate-500 mt-1">All broadcasts pushed by organizers appear here in real time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAnnouncements.map((ann) => {
            const style = getSeverityStyle(ann.severity);
            const Icon = style.icon;

            return (
              <article
                key={ann.id}
                className={`p-5 rounded-2xl bg-slate-900/80 border ${style.border} glass-panel transition-all animate-fade-in relative overflow-hidden`}
              >
                {ann.pinned && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500/20 text-amber-300 border-b border-l border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1 rounded-bl-xl">
                    <Pin className="w-3 h-3 text-amber-400" />
                    PINNED
                  </div>
                )}

                <div className="flex items-start gap-3.5">
                  <div className={`p-2 rounded-xl bg-slate-950 border border-slate-800 ${style.iconColor} flex-shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${style.badge}`}>
                        {ann.severity}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {ann.category}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" />
                        {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">{ann.title}</h4>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed whitespace-pre-line">
                      {ann.body}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Posted by <strong className="text-slate-300">{ann.authorName}</strong> ({ann.authorRole})</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
};
