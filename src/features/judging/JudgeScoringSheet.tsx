import React, { useState, useEffect } from 'react';
import { Team, Score, CriterionScore } from '../../types';
import { realtimeStore } from '../../services/realtimeStore';
import { useToast } from '../../components/shared/Toast';
import { synthesizeJudgeFeedback } from '../../services/geminiService';
import { Award, Lock, CheckCircle2, Save, Sparkles, History } from 'lucide-react';

interface JudgeScoringSheetProps {
  team: Team;
  existingScore?: Score;
  onSaved?: () => void;
}

export const JudgeScoringSheet: React.FC<JudgeScoringSheetProps> = ({
  team,
  existingScore,
  onSaved,
}) => {
  const { showToast } = useToast();
  const rubric = realtimeStore.getRubric();

  const [criterionScores, setCriterionScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);

  const isLocked = existingScore?.locked ?? false;

  // Initialize or reset scores when team changes
  useEffect(() => {
    const scoresMap: Record<string, number> = {};
    rubric.criteria.forEach((crit) => {
      const existingCrit = existingScore?.criterionScores.find(cs => cs.criterionId === crit.id);
      scoresMap[crit.id] = existingCrit ? existingCrit.score : Math.round(crit.maxScore * 0.8);
    });
    setCriterionScores(scoresMap);
    setFeedback(existingScore?.feedback || '');
  }, [team.id, existingScore, rubric]);

  // Compute live weighted score
  let totalWeightedScore = 0;
  let totalWeight = 0;
  rubric.criteria.forEach((crit) => {
    const scoreVal = criterionScores[crit.id] || 0;
    const normalized = (scoreVal / crit.maxScore) * 100;
    totalWeightedScore += normalized * crit.weight;
    totalWeight += crit.weight;
  });
  const liveTotalScore = totalWeight > 0 ? parseFloat((totalWeightedScore / totalWeight).toFixed(2)) : 0;

  const handleScoreChange = (critId: string, val: number) => {
    if (isLocked) return;
    setCriterionScores(prev => ({
      ...prev,
      [critId]: val,
    }));
  };

  const handleSaveScore = async (lockImmediately: boolean) => {
    if (isLocked) {
      showToast('Evaluation Locked', 'Locked submissions cannot be altered', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const preparedScores: CriterionScore[] = rubric.criteria.map((crit) => ({
        criterionId: crit.id,
        criterionName: crit.name,
        score: criterionScores[crit.id] || 0,
        maxScore: crit.maxScore,
        weight: crit.weight,
      }));

      await realtimeStore.submitScore({
        teamId: team.id,
        criterionScores: preparedScores,
        feedback,
        lockImmediately,
      });

      showToast(
        lockImmediately ? 'Score Locked! 🔒' : 'Draft Score Saved 💾',
        `Evaluation for "${team.name}" saved with score ${liveTotalScore}/100.`,
        'success'
      );

      if (onSaved) onSaved();
    } catch (err: any) {
      showToast('Submission Error', err.message || 'Could not save score', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiPolishFeedback = async () => {
    if (!feedback.trim()) {
      showToast('Feedback Required', 'Enter preliminary judge notes first to polish with AI', 'info');
      return;
    }
    setIsAiSummarizing(true);
    try {
      const polished = await synthesizeJudgeFeedback(team.name, [feedback]);
      setFeedback(polished);
      showToast('Polished with Gemini AI ✨', 'Synthesized constructive feedback summary.', 'success');
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiSummarizing(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-panel shadow-xl space-y-6">
      
      {/* Header & Lock Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Interactive Rubric Sheet
            </span>
            {isLocked ? (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                <Lock className="w-3.5 h-3.5" /> Locked & Finalized
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Evaluation
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white mt-1">{team.name}</h3>
          <p className="text-xs text-slate-400">{team.projectTitle}</p>
        </div>

        {/* Live Total Score Pill */}
        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <Award className="w-6 h-6 text-brand-400" />
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Total Computed Score</div>
            <div className="text-xl font-extrabold text-white font-mono">
              {liveTotalScore} <span className="text-xs text-slate-500 font-normal">/ 100 pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Criteria Sliders */}
      <div className="space-y-4">
        {rubric.criteria.map((crit) => {
          const currentScore = criterionScores[crit.id] ?? Math.round(crit.maxScore * 0.8);
          return (
            <div
              key={crit.id}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-white">{crit.name}</h4>
                  <p className="text-[11px] text-slate-400">{crit.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">Weight: {crit.weight}x</span>
                  <span className="text-xs font-mono font-extrabold text-brand-400 px-2 py-1 rounded bg-slate-900 border border-slate-700 min-w-[50px] text-center">
                    {currentScore} / {crit.maxScore}
                  </span>
                </div>
              </div>

              {/* Range Slider */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min="0"
                  max={crit.maxScore}
                  step="0.5"
                  disabled={isLocked}
                  value={currentScore}
                  onChange={(e) => handleScoreChange(crit.id, parseFloat(e.target.value))}
                  aria-label={`Score for ${crit.name}`}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 disabled:opacity-50"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Qualitative Feedback */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="judge-fb" className="block text-xs font-semibold text-slate-300">
            Qualitative Feedback & Constructive Critique
          </label>
          {!isLocked && (
            <button
              type="button"
              onClick={handleAiPolishFeedback}
              disabled={isAiSummarizing}
              className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isAiSummarizing ? 'Synthesizing...' : 'Polish with Gemini AI'}
            </button>
          )}
        </div>
        <textarea
          id="judge-fb"
          rows={3}
          disabled={isLocked}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Strengths, technical ingenuity, and architecture suggestions..."
          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-brand-500 outline-none resize-none disabled:opacity-60"
        />
      </div>

      {/* Audit Trail (if edited) */}
      {existingScore && existingScore.auditTrail && existingScore.auditTrail.length > 0 && (
        <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-1 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-300 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-slate-400" />
            Evaluation Audit Trail
          </div>
          {existingScore.auditTrail.map((entry, idx) => (
            <div key={idx} className="font-mono text-[10px] text-slate-500">
              • {new Date(entry.timestamp).toLocaleTimeString()} — Action: <span className="text-slate-300">{entry.action}</span> (Score: {entry.totalComputedScore} pts)
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {!isLocked ? (
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSaveScore(false)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              if (confirm('Lock this score? Once locked, evaluations cannot be edited.')) {
                handleSaveScore(true);
              }
            }}
            className="flex items-center gap-1.5 px-5 py-2 bg-brand-500 hover:bg-brand-400 text-black text-xs font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            Lock Final Score
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
          🔒 Score has been locked by judge. Score changes are disabled per hackathon audit rules.
        </div>
      )}

    </div>
  );
};
