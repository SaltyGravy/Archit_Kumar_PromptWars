import React, { useState } from 'react';
import { Rubric, RubricCriterion } from '../../types';
import { realtimeStore } from '../../services/realtimeStore';
import { useToast } from '../../components/shared/Toast';
import { Award, Plus, Trash2, Save, Scale } from 'lucide-react';

export const RubricBuilder: React.FC = () => {
  const { showToast } = useToast();
  const currentRubric = realtimeStore.getRubric();
  const [rubric, setRubric] = useState<Rubric>({ ...currentRubric });

  const handleAddCriterion = () => {
    const newCrit: RubricCriterion = {
      id: `crit-${Date.now()}`,
      name: 'New Evaluation Criterion',
      description: 'Describe the scoring standard for this dimension',
      maxScore: 10,
      weight: 1.0,
    };
    setRubric(prev => ({
      ...prev,
      criteria: [...prev.criteria, newCrit],
    }));
  };

  const handleRemoveCriterion = (id: string) => {
    if (rubric.criteria.length <= 1) {
      showToast('Action Disallowed', 'At least one rubric criterion is required', 'warning');
      return;
    }
    setRubric(prev => ({
      ...prev,
      criteria: prev.criteria.filter(c => c.id !== id),
    }));
  };

  const handleUpdateCriterion = (id: string, updates: Partial<RubricCriterion>) => {
    setRubric(prev => ({
      ...prev,
      criteria: prev.criteria.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  };

  const handleSave = async () => {
    try {
      await realtimeStore.updateRubric(rubric);
      showToast('Rubric Updated! ⚖️', 'Judging criteria and weighting matrix updated in real time.', 'success');
    } catch (err: any) {
      showToast('Save Error', err.message || 'Could not save rubric', 'error');
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-panel shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Phase 4: Judging Framework
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            Rubric & Weight Matrix Builder
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Define weighted evaluation criteria for judges. Score changes aggregate dynamically onto the live leaderboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddCriterion}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Criterion
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-bold shadow-lg shadow-brand-500/20 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Save Rubric
          </button>
        </div>
      </div>

      {/* Aggregation Formula Setting */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Scale className="w-4 h-4 text-indigo-400" />
          <div>
            <span className="text-xs font-bold text-white">Score Aggregation Formula</span>
            <p className="text-[11px] text-slate-400">Controls how individual judge submissions roll up into leaderboard ranks</p>
          </div>
        </div>
        <select
          value={rubric.aggregationMethod}
          onChange={(e) => setRubric({ ...rubric, aggregationMethod: e.target.value as any })}
          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-brand-500 outline-none"
        >
          <option value="weighted_average">Normalized Weighted Average (0-100 pts)</option>
          <option value="total_sum">Total Cumulative Sum of Points</option>
        </select>
      </div>

      {/* Criteria List */}
      <div className="space-y-3">
        {rubric.criteria.map((criterion, index) => (
          <div
            key={criterion.id}
            className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={criterion.name}
                  onChange={(e) => handleUpdateCriterion(criterion.id, { name: e.target.value })}
                  placeholder="Criterion Name"
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-brand-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Weight:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="5.0"
                    value={criterion.weight}
                    onChange={(e) => handleUpdateCriterion(criterion.id, { weight: parseFloat(e.target.value) || 1.0 })}
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white text-center"
                  />
                  <span>x</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Max:</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={criterion.maxScore}
                    onChange={(e) => handleUpdateCriterion(criterion.id, { maxScore: parseInt(e.target.value, 10) || 10 })}
                    className="w-14 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white text-center"
                  />
                  <span>pts</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveCriterion(criterion.id)}
                  aria-label={`Remove criterion ${criterion.name}`}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <textarea
              rows={2}
              value={criterion.description}
              onChange={(e) => handleUpdateCriterion(criterion.id, { description: e.target.value })}
              placeholder="Rubric guidance for judges evaluating this standard..."
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 placeholder-slate-500 focus:border-brand-500 outline-none resize-none"
            />
          </div>
        ))}
      </div>

    </div>
  );
};
