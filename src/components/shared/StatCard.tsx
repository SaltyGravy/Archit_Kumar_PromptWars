import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  colorVariant?: 'brand' | 'primary' | 'amber' | 'rose' | 'slate';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  colorVariant = 'brand',
  trend,
}) => {
  const colorStyles = {
    brand: {
      bg: 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    primary: {
      bg: 'bg-indigo-950/30 border-indigo-800/40 text-indigo-400',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    },
    amber: {
      bg: 'bg-amber-950/30 border-amber-800/40 text-amber-400',
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    },
    rose: {
      bg: 'bg-rose-950/30 border-rose-800/40 text-rose-400',
      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    },
    slate: {
      bg: 'bg-slate-900/60 border-slate-800 text-slate-300',
      iconBg: 'bg-slate-800 text-slate-400 border border-slate-700',
    },
  }[colorVariant];

  return (
    <div className={`p-5 rounded-2xl border backdrop-blur-md glass-panel glass-panel-hover flex flex-col justify-between transition-all ${colorStyles.bg}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl ${colorStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">{value}</span>
          {trend && (
            <span className="text-xs font-bold text-emerald-400">{trend}</span>
          )}
        </div>
        {subValue && (
          <p className="text-xs text-slate-400 mt-1 font-medium">{subValue}</p>
        )}
      </div>
    </div>
  );
};
