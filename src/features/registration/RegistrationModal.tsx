import React, { useState } from 'react';
import { z } from 'zod';
import { Modal } from '../../components/shared/Modal';
import { realtimeStore } from '../../services/realtimeStore';
import { UserRole } from '../../types';
import { useToast } from '../../components/shared/Toast';
import { UserPlus, Sparkles, Check, AlertCircle } from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name is too long'),
  email: z.string().email('Please provide a valid email address'),
  rolePreference: z.enum(['participant', 'judge', 'organizer']),
  desiredRole: z.enum(['Frontend', 'Backend', 'Fullstack', 'AI/ML Engineer', 'UI/UX Designer', 'Product/Strategy']).optional(),
  skills: z.array(z.string()).min(1, 'Please select or add at least one skill'),
  bio: z.string().max(200, 'Bio max 200 characters').optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const PRESET_SKILLS = [
  'React', 'TypeScript', 'Firebase', 'Gemini API', 'Python',
  'Cloud Run', 'Tailwind CSS', 'FastAPI', 'PyTorch', 'UI/UX',
  'WebSockets', 'GraphQL', 'Next.js', 'Go', 'Docker'
];

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    rolePreference: 'participant',
    desiredRole: 'Frontend',
    skills: ['React', 'TypeScript'],
    bio: '',
  });
  const [customSkill, setCustomSkill] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSkill = (skill: string) => {
    setFormData(prev => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill],
      };
    });
    if (errors.skills) {
      setErrors(prev => ({ ...prev, skills: '' }));
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (('key' in e && e.key === 'Enter') || !('key' in e)) {
      e.preventDefault();
      if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, customSkill.trim()] }));
        setCustomSkill('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = registrationSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { user } = await realtimeStore.registerUser({
        name: formData.name,
        email: formData.email,
        skills: formData.skills,
        desiredRole: formData.desiredRole,
        rolePreference: formData.rolePreference as UserRole,
        bio: formData.bio,
      });

      showToast(
        'Registration Complete! 🎉',
        `Welcome ${user.name}! Your official QR attendee pass has been generated.`,
        'success'
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Registration Error', 'Unable to complete registration. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hackathon Registration"
      subtitle="Register for the event & receive your digital QR Pass"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Full Name */}
        <div>
          <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-300 mb-1">
            Full Name *
          </label>
          <input
            id="reg-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Jordan Sterling"
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
          />
          {errors.name && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-300 mb-1">
            Email Address *
          </label>
          <input
            id="reg-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="jordan@example.com"
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
          />
          {errors.email && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.email}
            </p>
          )}
        </div>

        {/* Role Preference */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Role Participation *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'participant', label: 'Participant' },
              { id: 'judge', label: 'Judge' },
              { id: 'organizer', label: 'Organizer' },
            ].map(({ id, label }) => (
              <button
                type="button"
                key={id}
                onClick={() => setFormData({ ...formData, rolePreference: id as UserRole })}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  formData.rolePreference === id
                    ? 'bg-brand-500/20 border-brand-500 text-brand-300 shadow-sm'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Desired Track Role */}
        {formData.rolePreference === 'participant' && (
          <div>
            <label htmlFor="reg-desired-role" className="block text-xs font-semibold text-slate-300 mb-1">
              Primary Role in Team
            </label>
            <select
              id="reg-desired-role"
              value={formData.desiredRole}
              onChange={(e) => setFormData({ ...formData, desiredRole: e.target.value as any })}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            >
              <option value="Frontend">Frontend Developer (React/Next)</option>
              <option value="Backend">Backend / Cloud Systems (Firebase/Cloud Run)</option>
              <option value="AI/ML Engineer">AI/ML Engineer (Gemini API/PyTorch)</option>
              <option value="UI/UX Designer">UI/UX & Product Designer</option>
              <option value="Fullstack">Fullstack Generalist</option>
              <option value="Product/Strategy">Product Strategy & Pitch Lead</option>
            </select>
          </div>
        )}

        {/* Skills Tag Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Skills & Expertise (Click to toggle) *
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800">
            {PRESET_SKILLS.map((skill) => {
              const selected = formData.skills.includes(skill);
              return (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all flex items-center gap-1 ${
                    selected
                      ? 'bg-brand-500/20 border-brand-500 text-brand-300 font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 text-brand-400" />}
                  {skill}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={handleAddCustomSkill}
              placeholder="Add other skill (e.g. Rust, Kafka)..."
              className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500"
            />
            <button
              type="button"
              onClick={handleAddCustomSkill}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700"
            >
              Add
            </button>
          </div>

          {errors.skills && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.skills}
            </p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="reg-bio" className="block text-xs font-semibold text-slate-300 mb-1">
            Short Bio / Project Interests
          </label>
          <textarea
            id="reg-bio"
            rows={2}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="What kind of project do you want to build?"
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:border-brand-500 outline-none resize-none"
          />
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Register & Generate Pass
          </button>
        </div>

      </form>
    </Modal>
  );
};
