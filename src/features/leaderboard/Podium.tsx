import React from 'react';
import { LeaderboardEntry } from '../../types';
import { Trophy, Crown } from 'lucide-react';

interface PodiumProps {
  entries: LeaderboardEntry[];
}

export const Podium: React.FC<PodiumProps> = ({ entries }) => {
  const top1 = entries.find(e => e.rank === 1);
  const top2 = entries.find(e => e.rank === 2);
  const top3 = entries.find(e => e.rank === 3);

  if (!top1) return null;

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 glass-panel shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Top Contenders & Podium Standings
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
          Real-Time Aggregates
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 items-end">
        
        {/* 2nd Place (Silver) */}
        {top2 ? (
          <div className="order-2 md:order-1 p-5 rounded-2xl bg-slate-950/80 border border-slate-700/80 flex flex-col justify-between text-center relative overflow-hidden transition-all hover:scale-[1.02]">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-slate-400 to-slate-200" />
            <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 border border-slate-600 flex items-center justify-center font-extrabold text-sm mx-auto mb-2 shadow-lg">
              2
            </div>
            <h4 className="text-sm font-bold text-white truncate">{top2.teamName}</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{top2.projectTitle}</p>
            
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <span className="text-xl font-extrabold font-mono text-slate-200">
                {top2.aggregateScore} <span className="text-xs text-slate-500">pts</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{top2.judgeCount} Judge Reviews</p>
            </div>
          </div>
        ) : (
          <div className="order-2 md:order-1 p-5 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-600">
            Awaiting 2nd Place
          </div>
        )}

        {/* 1st Place (Gold / Champion) */}
        {top1 && (
          <div className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/50 flex flex-col justify-between text-center relative overflow-hidden transition-all hover:scale-[1.03] shadow-2xl shadow-amber-500/10">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 animate-shimmer" />
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-extrabold text-lg mx-auto mb-2 shadow-xl shadow-amber-500/30">
              <Crown className="w-6 h-6" />
            </div>
            <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-400 mb-1">
              GRAND CHAMPION LEAD
            </div>
            <h4 className="text-base font-extrabold text-white truncate">{top1.teamName}</h4>
            <p className="text-xs text-slate-300 line-clamp-1 mt-0.5 font-medium">{top1.projectTitle}</p>
            
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <span className="text-2xl font-black font-mono text-amber-300">
                {top1.aggregateScore} <span className="text-xs text-amber-500 font-normal">pts</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{top1.judgeCount} Judge Reviews • {top1.category}</p>
            </div>
          </div>
        )}

        {/* 3rd Place (Bronze) */}
        {top3 ? (
          <div className="order-3 p-5 rounded-2xl bg-slate-950/80 border border-amber-900/40 flex flex-col justify-between text-center relative overflow-hidden transition-all hover:scale-[1.02]">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-700 to-amber-600" />
            <div className="w-10 h-10 rounded-full bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center font-extrabold text-sm mx-auto mb-2 shadow-lg">
              3
            </div>
            <h4 className="text-sm font-bold text-white truncate">{top3.teamName}</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{top3.projectTitle}</p>
            
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <span className="text-xl font-extrabold font-mono text-amber-400">
                {top3.aggregateScore} <span className="text-xs text-slate-500">pts</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{top3.judgeCount} Judge Reviews</p>
            </div>
          </div>
        ) : (
          <div className="order-3 p-5 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-600">
            Awaiting 3rd Place
          </div>
        )}

      </div>
    </div>
  );
};
