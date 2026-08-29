import { describe, it, expect } from 'vitest';
import { matchCandidatesForTeam } from '../src/services/geminiService';
import { Team, User } from '../src/types';

describe('Phase 2: Gemini AI Matchmaking Engine Suite', () => {
  const mockTeam: Team = {
    id: 'team-mock-1',
    eventId: 'evt-test',
    name: 'VisionaryAI',
    leaderId: 'user-leader-1',
    memberIds: ['user-leader-1'],
    projectTitle: 'AI Vision Assistant',
    projectDescription: 'Multimodal computer vision system for automated triage.',
    category: 'AI & Cloud',
    status: 'forming',
    lookingForRoles: ['Backend', 'UI/UX Designer'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockLeader: User = {
    id: 'user-leader-1',
    name: 'Alice Leader',
    email: 'alice@test.com',
    role: 'participant',
    eventId: 'evt-test',
    skills: ['Python', 'PyTorch', 'Gemini API'],
    desiredRole: 'AI/ML Engineer',
    lookingForTeam: false,
    createdAt: new Date().toISOString(),
  };

  const mockCandidates: User[] = [
    {
      id: 'candidate-backend',
      name: 'Bob Backend',
      email: 'bob@test.com',
      role: 'participant',
      eventId: 'evt-test',
      skills: ['Firebase', 'Cloud Run', 'Node.js', 'PostgreSQL'],
      desiredRole: 'Backend',
      lookingForTeam: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'candidate-designer',
      name: 'Claire Design',
      email: 'claire@test.com',
      role: 'participant',
      eventId: 'evt-test',
      skills: ['Figma', 'UI/UX Design', 'Tailwind CSS'],
      desiredRole: 'UI/UX Designer',
      lookingForTeam: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'candidate-ml-duplicate',
      name: 'Dan ML',
      email: 'dan@test.com',
      role: 'participant',
      eventId: 'evt-test',
      skills: ['Python', 'PyTorch'],
      desiredRole: 'AI/ML Engineer',
      lookingForTeam: true,
      createdAt: new Date().toISOString(),
    },
  ];

  it('should rank candidates that fill critical role gaps higher', async () => {
    const result = await matchCandidatesForTeam(mockTeam, [mockLeader], mockCandidates);

    expect(result.teamId).toBe(mockTeam.id);
    expect(result.recommendations.length).toBeGreaterThan(0);

    // Candidates matching 'Backend' or 'UI/UX Designer' should score higher than duplicate 'AI/ML Engineer'
    const topMatch = result.recommendations[0];
    expect(['candidate-backend', 'candidate-designer']).toContain(topMatch.userId);
    expect(topMatch.matchScorePercentage).toBeGreaterThanOrEqual(70);
    expect(topMatch.aiRationale).toBeDefined();
  });
});
