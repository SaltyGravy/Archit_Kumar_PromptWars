import React from 'react';
import { UserRole } from '../../types';
import { UserCheck, Award, ShieldAlert, Users } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isSplitView: boolean;
  onToggleSplitView: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  onRoleChange,
  isSplitView,
  onToggleSplitView,
}) => {
  const roles: { role: UserRole; label: string; icon: React.ElementType; color: string }[] = [
    { role: 'participant', label: 'Participant', icon: UserCheck, color: 'hover:text-emerald-400' },
    { role: 'judge', label: 'Judge', icon: Award, color: 'hover:text-indigo-400' },
    { role: 'organizer', label: 'Organizer', icon: ShieldAlert, color: 'hover:text-amber-400' },
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Role Tabs */}
      <div 
        className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl"
        role="tablist"
        aria-label="User role navigation"
      >
        {roles.map(({ role, label, icon: Icon }) => {
          const isActive = currentRole === role && !isSplitView;
          return (
            <button
              key={role}
              role="tab"
              aria-selected={isActive}
              aria-label={`Switch to ${label} role view`}
              onClick={() => {
                if (isSplitView) onToggleSplitView();
                onRoleChange(role);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? role === 'participant'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : role === 'judge'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Split-View Simulator Button */}
      <button
        type="button"
        onClick={onToggleSplitView}
        aria-pressed={isSplitView}
        aria-label="Toggle multi-role split screen sandbox simulator"
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
          isSplitView
            ? 'bg-gradient-to-r from-emerald-600/30 to-indigo-600/30 border-brand-500 text-white shadow-lg'
            : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
        }`}
      >
        <Users className="w-3.5 h-3.5 text-brand-400" />
        <span className="hidden md:inline">Multi-Role Sandbox</span>
        <span className="md:hidden">Split</span>
      </button>
    </div>
  );
};
