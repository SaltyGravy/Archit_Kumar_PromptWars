import React, { useState } from 'react';
import { User } from '../../types';
import { CheckInScanner } from '../registration/CheckInScanner';
import { TeamDiscovery } from '../teams/TeamDiscovery';
import { TeamHub } from '../teams/TeamHub';
import { AnnouncementComposer } from '../announcements/AnnouncementComposer';
import { AnnouncementFeed } from '../announcements/AnnouncementFeed';
import { RubricBuilder } from '../judging/RubricBuilder';
import { LiveLeaderboard } from '../leaderboard/LiveLeaderboard';
import { OrganizerAnalytics } from '../analytics/OrganizerAnalytics';
import { 
  BarChart3, QrCode, Users, Megaphone, 
  Award, Trophy 
} from 'lucide-react';

interface OrganizerDashboardProps {
  currentUser: User;
  onOpenCreateTeam: () => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  onOpenCreateTeam,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'checkin' | 'teams' | 'broadcast' | 'rubric' | 'leaderboard'>('analytics');

  const tabs: { id: typeof activeTab; label: string; icon: React.ElementType }[] = [
    { id: 'analytics', label: 'Analytics & Command', icon: BarChart3 },
    { id: 'checkin', label: 'Check-In Station', icon: QrCode },
    { id: 'teams', label: 'Team Management', icon: Users },
    { id: 'broadcast', label: 'Broadcast Center', icon: Megaphone },
    { id: 'rubric', label: 'Rubric & Criteria', icon: Award },
    { id: 'leaderboard', label: 'Live Leaderboard', icon: Trophy },
  ];

  return (
    <div className="space-y-6">
      
      {/* Sub-Navigation Tabs */}
      <div 
        className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto"
        role="tablist"
        aria-label="Organizer control panels"
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
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
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
        {activeTab === 'analytics' && (
          <div className="animate-fade-in">
            <OrganizerAnalytics />
          </div>
        )}

        {activeTab === 'checkin' && (
          <div className="animate-fade-in">
            <CheckInScanner />
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="animate-fade-in space-y-6">
            <TeamHub currentRole="organizer" onOpenCreateTeam={onOpenCreateTeam} />
            <TeamDiscovery onOpenCreateTeam={onOpenCreateTeam} />
          </div>
        )}

        {activeTab === 'broadcast' && (
          <div className="animate-fade-in space-y-6">
            <AnnouncementComposer />
            <AnnouncementFeed />
          </div>
        )}

        {activeTab === 'rubric' && (
          <div className="animate-fade-in">
            <RubricBuilder />
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
