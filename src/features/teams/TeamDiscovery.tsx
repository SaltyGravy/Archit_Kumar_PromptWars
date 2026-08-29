import React, { useState } from 'react';
import { Team } from '../../types';
import { realtimeStore } from '../../services/realtimeStore';
import { DebouncedSearch } from '../../components/shared/DebouncedSearch';
import { Users, UserPlus, Sparkles, Code2 } from 'lucide-react';
import { useToast } from '../../components/shared/Toast';

export const TeamDiscovery: React.FC<{ onOpenCreateTeam: () => void }> = ({ onOpenCreateTeam }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'talent' | 'teams'>('talent');

  const users = realtimeStore.getUsers();
  const teams = realtimeStore.getTeams();
  const currentUser = realtimeStore.getCurrentUser();

  const unmatchedParticipants = users.filter(u => u.role === 'participant' && !u.teamId);
  const formingTeams = teams.filter(t => t.status === 'forming');

  // Filter candidates
  const filteredCandidates = unmatchedParticipants.filter(p => {
    const matchesRole = selectedRoleFilter === 'All' || p.desiredRole === selectedRoleFilter;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.bio && p.bio.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  // Filter teams
  const filteredTeams = formingTeams.filter(t => {
    return t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.lookingForRoles.some(r => r.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleRequestJoin = async (team: Team) => {
    if (!currentUser) return;
    try {
      await realtimeStore.joinTeam(team.id, currentUser.id);
      showToast('Joined Team! 🎉', `You have officially joined ${team.name}.`, 'success');
    } catch (err: any) {
      showToast('Join Failed', err.message || 'Could not join team', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Directory Controls Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-panel shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
              Phase 2: Smart Team Formation
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">Hackathon Talent & Team Discovery</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Connect with builders, filter by skill stacks, or recruit members to complete your squad.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreateTeam}
            aria-label="Create a new team"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all"
          >
            <Users className="w-4 h-4" />
            Create Team
          </button>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Toggle between Candidates vs Teams */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('talent')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'talent'
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Looking for Team ({unmatchedParticipants.length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'teams'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Open Teams ({formingTeams.length})
          </button>
        </div>

        {/* Search & Role Filter */}
        <div className="flex items-center gap-2">
          {activeTab === 'talent' && (
            <div className="relative">
              <select
                aria-label="Filter by desired role"
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-brand-500"
              >
                <option value="All">All Roles</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="AI/ML Engineer">AI/ML Engineer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Fullstack">Fullstack</option>
                <option value="Product/Strategy">Product/Strategy</option>
              </select>
            </div>
          )}

          <DebouncedSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={activeTab === 'talent' ? 'Search by skill, name...' : 'Search teams, categories...'}
            className="w-full sm:w-64"
          />
        </div>
      </div>

      {/* Content Grid */}
      {activeTab === 'talent' ? (
        filteredCandidates.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 text-xs">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No unmatched participants found</p>
            <p className="text-[11px] text-slate-500 mt-1">Try adjusting your search query or role filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 glass-panel flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{candidate.name}</h4>
                      <p className="text-[11px] text-slate-400">{candidate.email}</p>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {candidate.desiredRole || 'Fullstack'}
                    </span>
                  </div>

                  {candidate.bio && (
                    <p className="text-xs text-slate-300 mt-3 line-clamp-2 italic">
                      &ldquo;{candidate.bio}&rdquo;
                    </p>
                  )}

                  <div className="mt-3">
                    <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">
                      Skill Set:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.map((skill) => (
                        <span 
                          key={skill} 
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Available for Team
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredTeams.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 text-xs">
            <Code2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No forming teams matching query</p>
            <p className="text-[11px] text-slate-500 mt-1">Be the first to create an open squad!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((team) => {
              const isCurrentUserMember = currentUser && team.memberIds.includes(currentUser.id);
              return (
                <div
                  key={team.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 glass-panel flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{team.name}</h4>
                        <span className="text-[10px] text-indigo-400 font-mono">{team.category}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {team.memberIds.length} / 4 Members
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <h5 className="text-xs font-semibold text-slate-200">{team.projectTitle}</h5>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {team.projectDescription}
                      </p>
                    </div>

                    <div className="mt-3">
                      <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">
                        Recruiting Roles:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {team.lookingForRoles.map((role) => (
                          <span key={role} className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">Status: {team.status}</span>
                    {!isCurrentUserMember && (
                      <button
                        type="button"
                        onClick={() => handleRequestJoin(team)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-bold transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Join Team
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

    </div>
  );
};
