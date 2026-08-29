import React, { useState } from 'react';
import { User } from '../../types';
import { JudgeTeamList } from '../judging/JudgeTeamList';
import { LiveLeaderboard } from '../leaderboard/LiveLeaderboard';
import { AnnouncementFeed } from '../announcements/AnnouncementFeed';
import { Award, Trophy, Megaphone } from 'lucide-react';

interface JudgeDashboardProps {
  currentUser: User;
}

export const JudgeDashboard: React.FC<JudgeDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'judging' | 'leaderboard' | 'announcements'>('judging');

  const tabs: { id: typeof activeTab; label: string; icon: React.ElementType }[] = [
    { id: 'judging', label: 'Evaluation Queue', icon: Award },
    { id: 'leaderboard', label: 'Live Leaderboard', icon: Trophy },
    { id: 'announcements', label: 'Official Feed', icon: Megaphone },
  ];

  return (
    <div className="space-y-6">
      
      {/* Sub-Navigation Tabs */}
      <div 
        className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto"
        role="tablist"
        aria-label="Judge dashboard views"
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'judging' && (
          <div className="animate-fade-in">
            <JudgeTeamList />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="animate-fade-in">
            <LiveLeaderboard />
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="animate-fade-in">
            <AnnouncementFeed />
          </div>
        )}
      </div>

    </div>
  );
};
