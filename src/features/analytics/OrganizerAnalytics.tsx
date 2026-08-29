import React from 'react';
import { realtimeStore } from '../../services/realtimeStore';
import { StatCard } from '../../components/shared/StatCard';
import { 
  UserCheck, Code2, Award, Megaphone, 
  BarChart3, PieChart, Activity 
} from 'lucide-react';

export const OrganizerAnalytics: React.FC = () => {
  const analytics = realtimeStore.getAnalytics();

  return (
    <div className="space-y-6">
      
      {/* Top Deck Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Conversion"
          value={`${analytics.checkInRate}%`}
          subValue={`${analytics.totalCheckedIn} of ${analytics.totalRegistrations} verified`}
          icon={UserCheck}
          colorVariant="brand"
          trend="+100% On-Site"
        />

        <StatCard
          title="Active Squads"
          value={analytics.totalTeams}
          subValue={`${analytics.teamsLocked} locked • ${analytics.teamsLookingForMembers} recruiting`}
          icon={Code2}
          colorVariant="primary"
        />

        <StatCard
          title="Judging Velocity"
          value={`${analytics.judgingCompletionRate}%`}
          subValue={`${analytics.scoresSubmitted} evaluations logged`}
          icon={Award}
          colorVariant="amber"
        />

        <StatCard
          title="Broadcasts Pushed"
          value={analytics.totalAnnouncements}
          subValue="Live across all channels"
          icon={Megaphone}
          colorVariant="slate"
        />
      </div>

      {/* Analytics Visualizers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Score Distribution Breakdown */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-panel shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Score Distribution Matrix
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Live Rubric Aggregates</span>
          </div>

          <div className="space-y-3 pt-2">
            {analytics.scoreDistribution.map((bucket, idx) => {
              const maxCount = Math.max(...analytics.scoreDistribution.map(b => b.count), 1);
              const percentage = Math.round((bucket.count / maxCount) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{bucket.range}</span>
                    <span className="font-mono font-bold text-white">{bucket.count} submissions</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-brand-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Participant Role Distribution */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-panel shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand-400" />
              Desired Track Role Diversity
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Candidate Breakdown</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {Object.entries(analytics.roleDistribution).map(([role, count]) => {
              const percentage = Math.round((count / analytics.totalRegistrations) * 100);
              return (
                <div key={role} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-200">{role}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-brand-400">{count}</span>
                    <span className="text-[10px] font-mono text-slate-500">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Skill Matrix Cloud */}
        <div className="lg:col-span-12 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-panel shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Event-Wide Technical Skill Cloud & Gemini Synergy Map
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Real-time Tech Stack Analysis</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {Object.entries(analytics.skillDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([skill, count]) => (
                <div
                  key={skill}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all font-mono"
                >
                  <span className="text-xs font-bold text-slate-200">{skill}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-extrabold">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>

      </div>

    </div>
  );
};
