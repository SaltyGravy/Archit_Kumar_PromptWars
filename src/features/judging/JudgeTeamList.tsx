import React, { useState } from 'react';
import { realtimeStore } from '../../services/realtimeStore';
import { JudgeScoringSheet } from './JudgeScoringSheet';
import { Award, Clock, Lock, Code2 } from 'lucide-react';

export const JudgeTeamList: React.FC = () => {
  const teams = realtimeStore.getTeams();
  const scores = realtimeStore.getScores();
  const currentUser = realtimeStore.getCurrentUser();
  const judgeId = currentUser?.id || 'user-judge-1';

  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');

  const judgeScores = scores.filter(s => s.judgeId === judgeId);
  const selectedTeam = teams.find(t => t.id === selectedTeamId) || teams[0];
  const selectedScore = scores.find(s => s.teamId === selectedTeam?.id && s.judgeId === judgeId);

  const completedCount = judgeScores.filter(s => s.locked).length;

  return (
    <div className="space-y-6">
      
      {/* Judge Queue Summary Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-panel shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Interactive Judging Portal
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            Assigned Hackathon Submissions
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate project submissions against the standardized weighted rubric. Scores stream into the live leaderboard immediately.
          </p>
        </div>

        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Evaluation Coverage</div>
            <div className="text-base font-extrabold text-white font-mono">
              {completedCount} / {teams.length} Teams Finalized
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
            {teams.length > 0 ? Math.round((completedCount / teams.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Grid Layout: Team Queue (Left) & Active Evaluation Sheet (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Team Selection List */}
        <div className="lg:col-span-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Submission Queue ({teams.length})
          </h4>

          {teams.map((team) => {
            const teamScore = scores.find(s => s.teamId === team.id && s.judgeId === judgeId);
            const isSelected = selectedTeam?.id === team.id;
            const isLocked = teamScore?.locked;

            return (
              <button
                key={team.id}
                type="button"
                onClick={() => setSelectedTeamId(team.id)}
                aria-label={`Select team ${team.name} for evaluation`}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-brand-500/80 shadow-lg shadow-brand-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-bold text-white">{team.name}</h5>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{team.projectTitle}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-indigo-300 border border-slate-800">
                    {team.category}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between">
                  {isLocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-rose-400">
                      <Lock className="w-3 h-3" /> Locked: {teamScore.totalScore} pts
                    </span>
                  ) : teamScore ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-400">
                      <Clock className="w-3 h-3" /> Draft: {teamScore.totalScore} pts
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-mono">● Pending Review</span>
                  )}

                  <span className="text-[10px] text-slate-500 font-mono">
                    {team.memberIds.length} members
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Scoring Sheet */}
        <div className="lg:col-span-8">
          {selectedTeam ? (
            <JudgeScoringSheet
              key={selectedTeam.id}
              team={selectedTeam}
              existingScore={selectedScore}
              onSaved={() => {}}
            />
          ) : (
            <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 text-xs">
              <Code2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-300">Select a team from the queue to start scoring</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
