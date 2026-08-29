import React, { useState } from 'react';
import { z } from 'zod';
import { AnnouncementSeverity, AnnouncementCategory } from '../../types';
import { realtimeStore } from '../../services/realtimeStore';
import { useToast } from '../../components/shared/Toast';
import { Megaphone, Send, AlertTriangle, AlertCircle, Info, Pin, Sparkles } from 'lucide-react';

const announcementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
  body: z.string().min(5, 'Announcement body must be at least 5 characters').max(1000, 'Body too long'),
  severity: z.enum(['info', 'warning', 'critical']),
  category: z.enum(['General', 'Schedule', 'Venue', 'Judging', 'Urgent']),
  pinned: z.boolean().optional(),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

export const AnnouncementComposer: React.FC = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    body: '',
    severity: 'info',
    category: 'General',
    pinned: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = announcementSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await realtimeStore.postAnnouncement({
        title: formData.title,
        body: formData.body,
        severity: formData.severity,
        category: formData.category,
        pinned: formData.pinned,
      });

      showToast(
        'Broadcast Sent! 📢',
        `Announcement "${created.title}" dispatched in real time to all attendees.`,
        created.severity === 'critical' ? 'error' : created.severity === 'warning' ? 'warning' : 'success'
      );

      // Reset form
      setFormData({
        title: '',
        body: '',
        severity: 'info',
        category: 'General',
        pinned: false,
      });
    } catch (err: any) {
      showToast('Dispatch Error', err.message || 'Failed to post announcement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-panel shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-brand-400" />
          Broadcast Center Composer (Organizer Only)
        </h3>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
          Live Push Stream
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="ann-title" className="block text-xs font-semibold text-slate-300 mb-1">
            Announcement Headline *
          </label>
          <input
            id="ann-title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. 🍕 Lunch & Mentor AMA Session at Atrium Hub"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-brand-500 outline-none transition-colors"
          />
          {errors.title && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.title}
            </p>
          )}
        </div>

        {/* Severity & Category selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Severity Level *
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'info', label: 'Info', icon: Info, color: 'text-indigo-400 border-indigo-500/30' },
                { id: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-amber-400 border-amber-500/30' },
                { id: 'critical', label: 'Critical', icon: AlertCircle, color: 'text-rose-400 border-rose-500/30' },
              ].map(({ id, label, icon: Icon, color }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setFormData({ ...formData, severity: id as AnnouncementSeverity })}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1 transition-all ${
                    formData.severity === id
                      ? `bg-slate-800 ${color} font-bold shadow-sm`
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="ann-cat" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category Channel *
            </label>
            <select
              id="ann-cat"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as AnnouncementCategory })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-brand-500 outline-none"
            >
              <option value="General">General Broadcast</option>
              <option value="Schedule">Schedule & Milestones</option>
              <option value="Venue">Venue & Logistics</option>
              <option value="Judging">Judging Protocol</option>
              <option value="Urgent">Urgent Action Required</option>
            </select>
          </div>
        </div>

        {/* Body */}
        <div>
          <label htmlFor="ann-body" className="block text-xs font-semibold text-slate-300 mb-1">
            Broadcast Content *
          </label>
          <textarea
            id="ann-body"
            rows={3}
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            placeholder="Write clear instructions for participants and judges..."
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-brand-500 outline-none resize-none"
          />
          {errors.body && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.body}
            </p>
          )}
        </div>

        {/* Pinned toggle and Submit button */}
        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={formData.pinned}
              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              className="rounded border-slate-700 text-brand-500 focus:ring-brand-500 w-4 h-4 bg-slate-950"
            />
            <span className="flex items-center gap-1">
              <Pin className="w-3.5 h-3.5 text-amber-400" /> Pin to top of feed
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-black text-xs font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Push Announcement Live
          </button>
        </div>
      </form>
    </div>
  );
};
