import React, { useState } from 'react';
import { User } from '../../types';
import { realtimeStore } from '../../services/realtimeStore';
import { AttendeeBadge } from '../registration/AttendeeBadge';
import { TeamHub } from '../teams/TeamHub';
import { TeamDiscovery } from '../teams/TeamDiscovery';
import { AnnouncementFeed } from '../announcements/AnnouncementFeed';
import { LiveLeaderboard } from '../leaderboard/LiveLeaderboard';
import { QrCode, Users, Megaphone, Trophy, Compass } from 'lucide-react';

interface ParticipantDashboardProps {
  currentUser: User;
  onOpenCreateTeam: () => void;
}

export const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  currentUser,
  onOpenCreateTeam,
}) => {
  const [activeTab, setActiveTab] = useState<'pass' | 'team' | 'discovery' | 'announcements' | 'leaderboard'>('pass');
  const checkins = realtimeStore.getCheckIns();
  const userCheckIn = checkins.find(c => c.userId === currentUser.id);

  const tabs: { id: typeof activeTab; label: string; icon: React.ElementType }[] = [
    { id: 'pass', label: 'My QR Pass', icon: QrCode },
    { id: 'team', label: 'Team Hub', icon: Users },
    { id: 'discovery', label: 'Talent Discovery', icon: Compass },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'leaderboard', label: 'Live Leaderboard', icon: Trophy },
  ];

  return (
    <div className="space-y-6">
      
      {/* Sub-Navigation Tabs */}
      <div 
        className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto"
        role="tablist"
        aria-label="Participant dashboard views"
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
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
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
        {activeTab === 'pass' && (
          <div className="max-w-md mx-auto animate-fade-in">
            <AttendeeBadge user={currentUser} checkIn={userCheckIn} />
          </div>
        )}

        {activeTab === 'team' && (
          <div className="animate-fade-in">
            <TeamHub currentRole="participant" onOpenCreateTeam={onOpenCreateTeam} />
          </div>
        )}

        {activeTab === 'discovery' && (
          <div className="animate-fade-in">
            <TeamDiscovery onOpenCreateTeam={onOpenCreateTeam} />
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="animate-fade-in">
            <AnnouncementFeed />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="animate-fade-in">
            <LiveLeaderboard />
          </div>
        )}
      </div>

    </div>
  );
};
