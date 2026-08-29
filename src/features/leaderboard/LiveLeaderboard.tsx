import React, { useState } from 'react';
import { realtimeStore } from '../../services/realtimeStore';
import { Podium } from './Podium';
import confetti from 'canvas-confetti';
import { Trophy, Award, Sparkles, ChevronDown, ChevronUp, Radio } from 'lucide-react';

export const LiveLeaderboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const leaderboardEntries = realtimeStore.getLeaderboard();
  const rubric = realtimeStore.getRubric();

  const filteredEntries = leaderboardEntries.filter((entry) => {
    return selectedCategory === 'All' || entry.category === selectedCategory;
  });

  const handleTriggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#6366f1', '#fbbf24', '#ec4899'],
    });
  };

  const toggleExpand = (teamId: string) => {
    setExpandedTeamId(prev => prev === teamId ? null : teamId);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Celebration Trigger */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-panel shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-brand-400 animate-pulse" />
              Live Leaderboard Stream
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-white mt-1 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Live Rankings & Standings
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated in real time via {rubric.aggregationMethod === 'weighted_average' ? 'Normalized Weighted Average (0-100 pts)' : 'Total Cumulative Points'}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerCelebration}
            aria-label="Celebrate leaderboard winners with confetti"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Celebrate Winners 🎉
          </button>
        </div>
      </div>

      {/* Podium Display for Top 3 */}
      <Podium entries={leaderboardEntries} />

      {/* Full Standings Table */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-panel shadow-xl space-y-4">
        
        {/* Table Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h4 className="text-sm font-bold text-white">Full Team Standings</h4>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Track:</span>
            <select
              aria-label="Filter leaderboard by track category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-brand-500"
            >
              <option value="All">All Tracks</option>
              <option value="AI & Real-Time Cloud">AI & Real-Time Cloud</option>
              <option value="Security & Infrastructure">Security & Infrastructure</option>
              <option value="Sustainability & AI">Sustainability & AI</option>
            </select>
          </div>
        </div>

        {/* Entries Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase font-mono text-slate-500 bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th scope="col" className="py-3 px-4 rounded-l-xl">Rank</th>
                <th scope="col" className="py-3 px-4">Team & Project</th>
                <th scope="col" className="py-3 px-4">Category</th>
                <th scope="col" className="py-3 px-4 text-center">Judges</th>
                <th scope="col" className="py-3 px-4 text-right">Aggregate Score</th>
                <th scope="col" className="py-3 px-4 rounded-r-xl text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEntries.map((entry) => {
                const isExpanded = expandedTeamId === entry.teamId;

                const getRankBadge = (rank: number) => {
                  if (rank === 1) return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black';
                  if (rank === 2) return 'bg-slate-400/20 text-slate-200 border-slate-400/40 font-bold';
                  if (rank === 3) return 'bg-amber-800/20 text-amber-400 border-amber-800/40 font-bold';
                  return 'bg-slate-800 text-slate-400 border-slate-700 font-semibold';
                };

                return (
                  <React.Fragment key={entry.teamId}>
                    <tr className="hover:bg-slate-800/40 transition-colors animate-fade-in">
                      <td className="py-4 px-4 font-mono">
                        <span className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs ${getRankBadge(entry.rank)}`}>
                          #{entry.rank}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-sm">{entry.teamName}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{entry.projectTitle}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {entry.category}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center font-mono text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                          {entry.judgeCount} evaluated
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right font-mono">
                        <span className="text-base font-extrabold text-white">
                          {entry.aggregateScore.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">pts</span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => toggleExpand(entry.teamId)}
                          aria-label={`Toggle score breakdown for ${entry.teamName}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Judge Breakdown Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-950/80">
                        <td colSpan={6} className="p-4">
                          <div className="space-y-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
                            <h5 className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5 text-indigo-400" />
                              Individual Judge Scorecard Breakdown for {entry.teamName}
                            </h5>
                            {entry.scores.length === 0 ? (
                              <p className="text-slate-500 text-[11px]">No individual evaluations finalized yet.</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                                {entry.scores.map((s, idx) => (
                                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                                    <div>
                                      <div className="font-semibold text-slate-200">{s.judgeName}</div>
                                      <div className="text-[10px] text-slate-500 font-mono">Judge ID: {s.judgeId}</div>
                                    </div>
                                    <div className="font-mono font-extrabold text-brand-400 text-sm">
                                      {s.score} pts
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
