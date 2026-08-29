import React, { useState } from 'react';
import { realtimeStore } from '../../services/realtimeStore';
import { CheckInScanner } from '../registration/CheckInScanner';
import { AttendeeBadge } from '../registration/AttendeeBadge';
import { AnnouncementComposer } from '../announcements/AnnouncementComposer';
import { AnnouncementFeed } from '../announcements/AnnouncementFeed';
import { JudgeTeamList } from '../judging/JudgeTeamList';
import { LiveLeaderboard } from '../leaderboard/LiveLeaderboard';
import { Radio } from 'lucide-react';

export const SplitViewSimulator: React.FC = () => {
  const users = realtimeStore.getUsers();
  const checkins = realtimeStore.getCheckIns();
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('user-part-1');

  const selectedParticipant = users.find(u => u.id === selectedParticipantId) || users.find(u => u.role === 'participant') || users[0];
  const participantCheckIn = checkins.find(c => c.userId === selectedParticipant.id);

  return (
    <div className="space-y-6">
      
      {/* Sandbox Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-brand-500/40 glass-panel shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 flex items-center gap-1.5 animate-pulse">
              <Radio className="w-3 h-3 text-brand-400" />
              Multi-Role Reactive Simulator Active
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1.5 tracking-tight">
            Cross-Role Live Synchronization Sandbox
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Test the entire platform across roles in a single view: Scan an attendee on the Organizer panel and observe the Participant pass update to &ldquo;Checked In&rdquo; with 0ms delay; submit a judge score and see the live leaderboard ranks animate instantly!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400">Viewing Participant:</div>
          <select
            aria-label="Select participant for split view testing"
            value={selectedParticipantId}
            onChange={(e) => setSelectedParticipantId(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-brand-300 focus:border-brand-500 outline-none"
          >
            {users.filter(u => u.role === 'participant').map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.desiredRole || 'Dev'})</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3-Column Split View Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Column 1: Organizer Terminal */}
        <div className="space-y-6 flex flex-col">
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <h3 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                Panel 1: Organizer Command Console
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Role: organizer</span>
          </div>

          <div className="space-y-6 flex-1">
            <CheckInScanner />
            <AnnouncementComposer />
          </div>
        </div>

        {/* Column 2: Participant Pass & Feed */}
        <div className="space-y-6 flex flex-col">
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">
                Panel 2: Participant View ({selectedParticipant.name})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Role: participant</span>
          </div>

          <div className="space-y-6 flex-1">
            <AttendeeBadge user={selectedParticipant} checkIn={participantCheckIn} />
            <AnnouncementFeed />
          </div>
        </div>

        {/* Column 3: Judge Scoring & Live Leaderboard */}
        <div className="space-y-6 flex flex-col">
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
              <h3 className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider">
                Panel 3: Judge Scoring & Leaderboard
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Role: judge</span>
          </div>

          <div className="space-y-6 flex-1">
            <JudgeTeamList />
            <LiveLeaderboard />
          </div>
        </div>

      </div>

    </div>
  );
};
