import React, { useState } from 'react';
import { z } from 'zod';
import { Modal } from '../../components/shared/Modal';
import { realtimeStore } from '../../services/realtimeStore';
import { useToast } from '../../components/shared/Toast';
import { Users, Sparkles, Check, AlertCircle } from 'lucide-react';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').max(50, 'Team name too long'),
  projectTitle: z.string().min(3, 'Project title must be at least 3 characters').max(100, 'Title too long'),
  projectDescription: z.string().min(10, 'Please write at least a 10 character project summary').max(500, 'Description too long'),
  category: z.string().min(2, 'Please select a hackathon category'),
  lookingForRoles: z.array(z.string()).min(1, 'Select at least one desired role'),
});

type CreateTeamFormData = z.infer<typeof createTeamSchema>;

const HACKATHON_CATEGORIES = [
  'AI & Real-Time Cloud',
  'Security & Zero-Trust Infrastructure',
  'Sustainability & ESG Telemetry',
  'Smart City & Multimodal Agents',
  'Developer Tooling & Agentic IDEs',
];

const DESIRED_ROLES = [
  'Frontend', 'Backend', 'Fullstack', 'AI/ML Engineer', 'UI/UX Designer', 'Product/Strategy'
];

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<CreateTeamFormData>({
    name: '',
    projectTitle: '',
    projectDescription: '',
    category: HACKATHON_CATEGORIES[0],
    lookingForRoles: ['Backend', 'AI/ML Engineer'],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleRole = (role: string) => {
    setFormData(prev => {
      const exists = prev.lookingForRoles.includes(role);
      return {
        ...prev,
        lookingForRoles: exists 
          ? prev.lookingForRoles.filter(r => r !== role) 
          : [...prev.lookingForRoles, role],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = createTeamSchema.safeParse(formData);
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
      const newTeam = await realtimeStore.createTeam({
        name: formData.name,
        projectTitle: formData.projectTitle,
        projectDescription: formData.projectDescription,
        category: formData.category,
        lookingForRoles: formData.lookingForRoles,
      });

      showToast('Team Created! 🚀', `Team "${newTeam.name}" is now ready for recruitment.`, 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Creation Failed', err.message || 'Unable to create team', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Hackathon Team"
      subtitle="Assemble your crew and set up your project showcase"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Team Name */}
        <div>
          <label htmlFor="team-name" className="block text-xs font-semibold text-slate-300 mb-1">
            Team Name *
          </label>
          <input
            id="team-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. CyberVanguard"
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:border-brand-500 outline-none"
          />
          {errors.name && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.name}
            </p>
          )}
        </div>

        {/* Project Title */}
        <div>
          <label htmlFor="proj-title" className="block text-xs font-semibold text-slate-300 mb-1">
            Project Concept Title *
          </label>
          <input
            id="proj-title"
            type="text"
            value={formData.projectTitle}
            onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
            placeholder="e.g. Autonomous Real-Time Disaster Response Grid"
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:border-brand-500 outline-none"
          />
          {errors.projectTitle && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.projectTitle}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="proj-cat" className="block text-xs font-semibold text-slate-300 mb-1">
            Competition Category *
          </label>
          <select
            id="proj-cat"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-brand-500 outline-none"
          >
            {HACKATHON_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Project Description */}
        <div>
          <label htmlFor="proj-desc" className="block text-xs font-semibold text-slate-300 mb-1">
            Project Summary & Architecture Goals *
          </label>
          <textarea
            id="proj-desc"
            rows={3}
            value={formData.projectDescription}
            onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
            placeholder="Briefly describe what you are building and how you plan to use Google Cloud / Gemini AI..."
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:border-brand-500 outline-none resize-none"
          />
          {errors.projectDescription && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.projectDescription}
            </p>
          )}
        </div>

        {/* Looking For Roles */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Looking for Roles (Used for Gemini AI Matchmaking) *
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DESIRED_ROLES.map((role) => {
              const selected = formData.lookingForRoles.includes(role);
              return (
                <button
                  type="button"
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                    selected
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 text-indigo-400" />}
                  {role}
                </button>
              );
            })}
          </div>
          {errors.lookingForRoles && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.lookingForRoles}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
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
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            Launch Team
          </button>
        </div>

      </form>
    </Modal>
  );
};
