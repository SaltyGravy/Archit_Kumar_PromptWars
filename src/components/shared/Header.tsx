import React from 'react';
import { UserRole, User } from '../../types';
import { RoleSwitcher } from './RoleSwitcher';
import { Sparkles, RotateCcw, UserPlus, QrCode } from 'lucide-react';
import { realtimeStore } from '../../services/realtimeStore';

interface HeaderProps {
  currentRole: UserRole;
  currentUser: User | undefined;
  onRoleChange: (role: UserRole) => void;
  onOpenRegister: () => void;
  onOpenPass: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  currentUser,
  onRoleChange,
  onOpenRegister,
  onOpenPass,
}) => {
  const handleResetData = () => {
    if (confirm('Reset demo state to pristine initial hackathon seed data?')) {
      realtimeStore.resetToSeedData();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Event Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 shadow-md shadow-brand-500/20 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">EventNexus</span>
            </div>
          </div>

          {/* Role Navigation */}
          <div className="flex items-center gap-3">
            <RoleSwitcher
              currentRole={currentRole}
              onRoleChange={onRoleChange}
            />
          </div>

          {/* User Profile & Quick Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {currentRole === 'participant' && (
              <button
                onClick={onOpenPass}
                aria-label="View QR Pass"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden md:inline">My Pass</span>
              </button>
            )}

            <button
              onClick={onOpenRegister}
              aria-label="Register new attendee"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700/80 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Register</span>
            </button>

            <button
              onClick={handleResetData}
              title="Reset to initial seed data"
              aria-label="Reset demo seed data"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left">
                  <select
                    aria-label="Switch active test user persona"
                    value={currentUser.id}
                    onChange={(e) => realtimeStore.setUser(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs font-semibold text-white rounded-lg px-2 py-1 outline-none focus:border-brand-500 cursor-pointer max-w-[140px] truncate"
                  >
                    {realtimeStore.getUsers().map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
