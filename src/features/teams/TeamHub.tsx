import React, { useState } from 'react';
import { Team, UserRole } from '../../types';
import { realtimeStore } from '../../services/realtimeStore';
import { GeminiMatchmakerModal } from './GeminiMatchmakerModal';
import { useToast } from '../../components/shared/Toast';
import { Users, Lock, Unlock, Sparkles, UserPlus } from 'lucide-react';

interface TeamHubProps {
  teamId?: string | null;
  currentRole: UserRole;
  onOpenCreateTeam: () => void;
}

export const TeamHub: React.FC<TeamHubProps> = ({ teamId, currentRole, onOpenCreateTeam }) => {
  const { showToast } = useToast();
  const [isMatchmakerOpen, setIsMatchmakerOpen] = useState(false);

  const teams = realtimeStore.getTeams();
  const users = realtimeStore.getUsers();
  const currentUser = realtimeStore.getCurrentUser();
  const event = realtimeStore.getEvent();

  const userTeam = teamId ? teams.find(t => t.id === teamId) : (currentUser?.teamId ? teams.find(t => t.id === currentUser.teamId) : null);

  const handleToggleLock = async (targetTeam: Team) => {
    try {
      const newStatus = await realtimeStore.toggleTeamLock(targetTeam.id);
      showToast(
        newStatus === 'locked' ? 'Roster Locked 🔒' : 'Roster Unlocked 🔓',
        `Team "${targetTeam.name}" is now ${newStatus}.`,
        'info'
      );
    } catch (err: any) {
      showToast('Action Failed', err.message || 'Could not toggle team lock', 'error');
    }
  };

  if (!userTeam) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center glass-panel shadow-xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">You are not currently in a team</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Form your own team to compete or browse open teams and unmatched builders in the discovery tab.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenCreateTeam}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Create Hackathon Team
          </button>
        </div>
      </div>
    );
  }

  const teamMembers = users.filter(u => userTeam.memberIds.includes(u.id));
  const isLeader = currentUser && userTeam.leaderId === currentUser.id;
  const canManage = isLeader || currentRole === 'organizer';

  return (
    <div className="space-y-6">
      
      {/* Team Header Deck */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-panel shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-extrabold text-white tracking-tight">{userTeam.name}</h3>
            {userTeam.status === 'locked' ? (
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                <Lock className="w-3 h-3" />
                ROSTER LOCKED
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 animate-pulse">
                <Unlock className="w-3 h-3" />
                FORMING & RECRUITING
              </span>
            )}
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {userTeam.category}
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-2 font-medium">{userTeam.projectTitle}</p>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">{userTeam.projectDescription}</p>
        </div>

        {/* Team Actions & Gemini AI Matchmaker Trigger */}
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          {userTeam.status === 'forming' && userTeam.memberIds.length < event.maxTeamSize && (
            <button
              onClick={() => setIsMatchmakerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Gemini AI Matchmaker
            </button>
          )}

          {canManage && (
            <button
              onClick={() => handleToggleLock(userTeam)}
              aria-label="Toggle team lock status"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                userTeam.status === 'locked'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}
            >
              {userTeam.status === 'locked' ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-slate-400" />
                  Unlock Roster
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  Lock Roster
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Roster & Capacity Grid */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-panel shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-400" />
            Team Squad Roster ({teamMembers.length} / {event.maxTeamSize})
          </h4>
          <span className="text-xs font-mono text-slate-400">
            {event.maxTeamSize - teamMembers.length} open slots remaining
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                    {member.name.charAt(0)}
                  </div>
                  {member.id === userTeam.leaderId ? (
                    <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Captain / Leader
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Member
                    </span>
                  )}
                </div>

                <h5 className="text-xs font-bold text-white mt-2.5">{member.name}</h5>
                <p className="text-[10px] text-indigo-400 font-mono">{member.desiredRole || 'Engineer'}</p>

                <div className="flex flex-wrap gap-1 mt-2.5">
                  {member.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Empty Slot Callouts */}
          {Array.from({ length: Math.max(0, event.maxTeamSize - teamMembers.length) }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              onClick={() => setIsMatchmakerOpen(true)}
              className="p-4 rounded-2xl border border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950/30 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[140px] group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 group-hover:border-indigo-500/40 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-400 group-hover:text-indigo-300 mt-2">
                Open Team Slot
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">Click for Gemini AI Match</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gemini AI Matchmaker Modal */}
      <GeminiMatchmakerModal
        isOpen={isMatchmakerOpen}
        onClose={() => setIsMatchmakerOpen(false)}
        team={userTeam}
      />

    </div>
  );
};
