import React, { useEffect, useState } from 'react';
import { User, CheckIn } from '../../types';
import { generateAttendeeQRToken, generateQRCodeDataUrl } from '../../services/qrService';
import { QrCode, CheckCircle2, Clock, ShieldCheck, Download, Copy } from 'lucide-react';
import { useToast } from '../../components/shared/Toast';

interface AttendeeBadgeProps {
  user: User;
  checkIn?: CheckIn;
}

export const AttendeeBadge: React.FC<AttendeeBadgeProps> = ({ user, checkIn }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const { showToast } = useToast();

  const isCheckedIn = Boolean(checkIn);

  useEffect(() => {
    const qrToken = checkIn?.qrToken || generateAttendeeQRToken(user.eventId, user.id);
    setToken(qrToken);
    generateQRCodeDataUrl(qrToken).then(url => setQrDataUrl(url));
  }, [user, checkIn]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    showToast('Token Copied', 'Attendee pass token copied to clipboard', 'success');
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 shadow-2xl backdrop-blur-xl">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Badge Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20">
              OFFICIAL ATTENDEE PASS
            </span>
            <span className="text-[10px] font-mono text-slate-500">ID: {user.id.slice(-6)}</span>
          </div>
          <h3 className="text-xl font-bold text-white mt-2 tracking-tight">{user.name}</h3>
          <p className="text-xs text-slate-400">{user.email}</p>
        </div>

        {/* Live Status Indicator */}
        <div className="text-right">
          {isCheckedIn ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              CHECKED IN
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              PENDING CHECK-IN
            </span>
          )}
          {checkIn && (
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              {new Date(checkIn.checkedInAt).toLocaleTimeString()} ({checkIn.method})
            </p>
          )}
        </div>
      </div>

      {/* QR Code Centerpiece */}
      <div className="py-6 flex flex-col items-center justify-center">
        <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200 flex items-center justify-center">
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt={`QR Pass for ${user.name}`} 
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center">
              <QrCode className="w-12 h-12 text-slate-400 animate-spin" />
            </div>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
          Encrypted Opaque Token (No raw PII encoded)
        </p>
      </div>

      {/* Skills & Desired Role */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Track Role:</span>
          <span className="font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {user.desiredRole || 'Fullstack Innovator'}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 block mb-1.5">Skill Matrix:</span>
          <div className="flex flex-wrap gap-1.5">
            {user.skills.map((skill) => (
              <span 
                key={skill} 
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pass Actions */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2">
        <button
          onClick={handleCopyToken}
          aria-label="Copy pass token"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy Token
        </button>

        {qrDataUrl && (
          <a
            href={qrDataUrl}
            download={`pass-${user.name.toLowerCase().replace(/\s+/g, '-')}.png`}
            aria-label="Download QR Pass Image"
            className="flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <Download className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};
