import { describe, it, expect, beforeEach } from 'vitest';
import { realtimeStore } from '../src/services/realtimeStore';

describe('Phase 4: Judging Rubric Calculation, Audit Trail & Score Locking', () => {
  beforeEach(() => {
    realtimeStore.resetToSeedData();
    realtimeStore.setRole('judge');
    realtimeStore.setUser('user-judge-1');
  });

  it('should compute weighted normalized total score accurately', async () => {
    // Create scores: Innovation (10/10, wt 1.2), Tech (8/10, wt 1.5), Google (9/10, wt 1.3), UI (10/10, wt 1.0)
    // Total weights: 1.2 + 1.5 + 1.3 + 1.0 = 5.0
    // Weighted points: (100 * 1.2) + (80 * 1.5) + (90 * 1.3) + (100 * 1.0) = 120 + 120 + 117 + 100 = 457
    // Expected normalized score: 457 / 5.0 = 91.4
    const criterionScores = [
      { criterionId: 'crit-innovation', criterionName: 'Innovation', score: 10, maxScore: 10, weight: 1.2 },
      { criterionId: 'crit-tech-realtime', criterionName: 'Technical', score: 8, maxScore: 10, weight: 1.5 },
      { criterionId: 'crit-google-services', criterionName: 'Google Services', score: 9, maxScore: 10, weight: 1.3 },
      { criterionId: 'crit-ui-a11y', criterionName: 'UI/UX', score: 10, maxScore: 10, weight: 1.0 },
    ];

    const score = await realtimeStore.submitScore({
      teamId: 'team-3',
      criterionScores,
      feedback: 'Very solid architectural design.',
      lockImmediately: false,
    });

    expect(score.totalScore).toBe(91.4);
    expect(score.locked).toBe(false);
    expect(score.auditTrail.length).toBeGreaterThan(0);
    expect(score.auditTrail[0].action).toBe('created');
  });

  it('should prevent edits once an evaluation is locked', async () => {
    // Submit and lock score
    const criterionScores = [
      { criterionId: 'crit-innovation', criterionName: 'Innovation', score: 9, maxScore: 10, weight: 1.2 },
      { criterionId: 'crit-tech-realtime', criterionName: 'Technical', score: 9, maxScore: 10, weight: 1.5 },
      { criterionId: 'crit-google-services', criterionName: 'Google Services', score: 9, maxScore: 10, weight: 1.3 },
      { criterionId: 'crit-ui-a11y', criterionName: 'UI/UX', score: 9, maxScore: 10, weight: 1.0 },
    ];

    await realtimeStore.submitScore({
      teamId: 'team-3',
      criterionScores,
      feedback: 'Preliminary assessment',
      lockImmediately: true,
    });

    // Attempting to modify locked score should throw error
    await expect(
      realtimeStore.submitScore({
        teamId: 'team-3',
        criterionScores,
        feedback: 'Tampered assessment after lock',
        lockImmediately: false,
      })
    ).rejects.toThrow('locked and cannot be edited');
  });
});
