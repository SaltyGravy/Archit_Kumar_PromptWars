import React, { useState, useEffect } from 'react';
import { Team, GeminiMatchmakingResult } from '../../types';
import { matchCandidatesForTeam } from '../../services/geminiService';
import { realtimeStore } from '../../services/realtimeStore';
import { Modal } from '../../components/shared/Modal';
import { Sparkles, Brain, UserPlus, CheckCircle2, Zap } from 'lucide-react';
import { useToast } from '../../components/shared/Toast';

interface GeminiMatchmakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
}

export const GeminiMatchmakerModal: React.FC<GeminiMatchmakerModalProps> = ({
  isOpen,
  onClose,
  team,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [matchResult, setMatchResult] = useState<GeminiMatchmakingResult | null>(null);
  const [invitedUserIds, setInvitedUserIds] = useState<Set<string>>(new Set());

  const users = realtimeStore.getUsers();
  const teamMembers = users.filter(u => team.memberIds.includes(u.id));
  const unmatchedCandidates = users.filter(u => u.role === 'participant' && !u.teamId && u.lookingForTeam);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      matchCandidatesForTeam(team, teamMembers, unmatchedCandidates)
        .then((result) => {
          setMatchResult(result);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, team.id]);

  const handleInviteCandidate = async (candidateId: string, candidateName: string) => {
    try {
      await realtimeStore.joinTeam(team.id, candidateId);
      setInvitedUserIds(prev => new Set(prev).add(candidateId));
      showToast('Invite Accepted! 🤝', `${candidateName} has joined ${team.name}!`, 'success');
    } catch (err: any) {
      showToast('Invite Failed', err.message || 'Could not join team', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gemini AI Smart Team Matchmaker"
      subtitle={`AI-powered skill-gap analysis for "${team.name}"`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        
        {/* Gemini AI Header Callout */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 mt-0.5">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Google Gemini Foundation Model Intelligence
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                Gemini 1.5 Flash
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {matchResult?.summary || 'Synthesizing candidate matrix against team project architecture requirements...'}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="relative">
              <Brain className="w-10 h-10 text-indigo-400 animate-bounce" />
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-ping" />
            </div>
            <p className="text-xs font-medium text-slate-300">Evaluating multi-dimensional talent synergies...</p>
            <p className="text-[10px] text-slate-500 font-mono">Running Google Gemini prompt pipeline</p>
          </div>
        ) : matchResult && matchResult.recommendations.length > 0 ? (
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Top Ranked Synergistic Matches
            </h5>

            <div className="space-y-3">
              {matchResult.recommendations.map((rec) => {
                const isInvited = invitedUserIds.has(rec.userId) || team.memberIds.includes(rec.userId);
                return (
                  <div
                    key={rec.userId}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h6 className="text-sm font-bold text-white">{rec.userName}</h6>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {rec.desiredRole}
                          </span>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{rec.matchScorePercentage}% Match</span>
                      </div>
                    </div>

                    {/* AI Rationale */}
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      <strong className="text-indigo-400 font-semibold">Gemini Rationale:</strong> {rec.aiRationale}
                    </p>

                    {/* Skill Gaps Filled vs Matching */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400">Fills Skill Gap:</span>
                        {rec.skillGapFilled.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                            +{s}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={isInvited}
                        onClick={() => handleInviteCandidate(rec.userId, rec.userName)}
                        aria-label={`Invite ${rec.userName} to team`}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isInvited
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                            : 'bg-brand-500 hover:bg-brand-400 text-black shadow-md shadow-brand-500/20'
                        }`}
                      >
                        {isInvited ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Joined Team
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            Add to Roster
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            No unmatched candidates available at this moment. All registered attendees are paired in teams.
          </div>
        )}

      </div>
    </Modal>
  );
};
