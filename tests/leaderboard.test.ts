import { describe, it, expect, beforeEach } from 'vitest';
import { realtimeStore } from '../src/services/realtimeStore';

describe('Phase 5: Live Leaderboard Real-Time Aggregation & Ranking', () => {
  beforeEach(() => {
    realtimeStore.resetToSeedData();
  });

  it('should compute leaderboard entries sorted descending by aggregate score', () => {
    const leaderboard = realtimeStore.getLeaderboard();

    expect(leaderboard.length).toBeGreaterThan(0);
    // Verify rank 1 is highest score
    expect(leaderboard[0].rank).toBe(1);
    for (let i = 0; i < leaderboard.length - 1; i++) {
      expect(leaderboard[i].aggregateScore).toBeGreaterThanOrEqual(leaderboard[i + 1].aggregateScore);
      expect(leaderboard[i].rank).toBe(i + 1);
    }
  });

  it('should dynamically update ranks when a new judge score is submitted', async () => {
    realtimeStore.setRole('judge');
    realtimeStore.setUser('user-judge-3');

    // Give team-3 a maximum score of 100 to propel it to rank 1
    const criterionScores = [
      { criterionId: 'crit-innovation', criterionName: 'Innovation', score: 10, maxScore: 10, weight: 1.2 },
      { criterionId: 'crit-tech-realtime', criterionName: 'Technical', score: 10, maxScore: 10, weight: 1.5 },
      { criterionId: 'crit-google-services', criterionName: 'Google Services', score: 10, maxScore: 10, weight: 1.3 },
      { criterionId: 'crit-ui-a11y', criterionName: 'UI/UX', score: 10, maxScore: 10, weight: 1.0 },
    ];

    await realtimeStore.submitScore({
      teamId: 'team-3',
      criterionScores,
      feedback: 'Flawless execution!',
      lockImmediately: true,
    });

    const updatedLeaderboard = realtimeStore.getLeaderboard();
    const team3Entry = updatedLeaderboard.find(e => e.teamId === 'team-3');

    expect(team3Entry).toBeDefined();
    expect(team3Entry?.aggregateScore).toBe(100);
    expect(team3Entry?.rank).toBe(1);
  });
});
