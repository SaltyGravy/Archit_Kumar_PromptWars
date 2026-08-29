export type UserRole = 'participant' | 'judge' | 'organizer';

export type EventStatus = 'draft' | 'active' | 'judging' | 'completed';

export type CheckInMethod = 'onsite' | 'virtual';

export type AnnouncementSeverity = 'info' | 'warning' | 'critical';

export type AnnouncementCategory = 'General' | 'Schedule' | 'Venue' | 'Judging' | 'Urgent';

export type TeamStatus = 'forming' | 'locked';

export interface Event {
  id: string;
  name: string;
  tagline: string;
  description: string;
  dates: {
    start: string;
    end: string;
    checkInDeadline: string;
    judgingLockDeadline: string;
  };
  location: string;
  status: EventStatus;
  maxTeamSize: number;
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  eventId: string;
  skills: string[];
  desiredRole?: 'Frontend' | 'Backend' | 'Fullstack' | 'AI/ML Engineer' | 'UI/UX Designer' | 'Product/Strategy';
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  avatarUrl?: string;
  teamId?: string | null;
  lookingForTeam: boolean;
  createdAt: string;
}

export interface TeamJoinRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  userSkills: string[];
  requestedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Team {
  id: string;
  eventId: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  projectTitle: string;
  projectDescription: string;
  demoUrl?: string;
  repoUrl?: string;
  category: string;
  status: TeamStatus;
  lookingForRoles: string[];
  joinRequests?: TeamJoinRequest[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  eventId: string;
  qrToken: string;
  checkedInAt: string;
  method: CheckInMethod;
  verifiedBy: string; // Organizer ID or auto-verified
}

export interface Announcement {
  id: string;
  eventId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  title: string;
  body: string;
  severity: AnnouncementSeverity;
  category: AnnouncementCategory;
  createdAt: string;
  pinned?: boolean;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  weight: number; // e.g. 1.0, 1.5, 2.0
}

export interface Rubric {
  id: string;
  eventId: string;
  name: string;
  criteria: RubricCriterion[];
  aggregationMethod: 'weighted_average' | 'total_sum';
  updatedAt: string;
}

export interface CriterionScore {
  criterionId: string;
  criterionName: string;
  score: number;
  maxScore: number;
  weight: number;
}

export interface ScoreAuditEntry {
  timestamp: string;
  action: 'created' | 'updated' | 'locked';
  totalComputedScore: number;
  judgeId: string;
}

export interface Score {
  id: string;
  eventId: string;
  teamId: string;
  teamName: string;
  judgeId: string;
  judgeName: string;
  rubricId: string;
  criterionScores: CriterionScore[];
  totalScore: number; // Normalized aggregate score (e.g. out of 100)
  feedback: string;
  submittedAt: string;
  locked: boolean;
  auditTrail: ScoreAuditEntry[];
}

export interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  projectTitle: string;
  category: string;
  memberCount: number;
  aggregateScore: number;
  judgeCount: number;
  rank: number;
  previousRank?: number;
  scores: {
    judgeId: string;
    judgeName: string;
    score: number;
  }[];
  locked: boolean;
}

export interface EventAnalytics {
  totalRegistrations: number;
  totalCheckedIn: number;
  checkInRate: number;
  totalTeams: number;
  teamsLocked: number;
  teamsLookingForMembers: number;
  totalJudges: number;
  scoresSubmitted: number;
  judgingCompletionRate: number;
  totalAnnouncements: number;
  skillDistribution: Record<string, number>;
  roleDistribution: Record<string, number>;
  scoreDistribution: { range: string; count: number }[];
  checkInTimeline: { time: string; count: number }[];
}

export interface GeminiMatchmakingRecommendation {
  userId: string;
  userName: string;
  desiredRole: string;
  matchingSkills: string[];
  skillGapFilled: string[];
  matchScorePercentage: number;
  aiRationale: string;
}

export interface GeminiMatchmakingResult {
  teamId: string;
  teamName: string;
  neededRoles: string[];
  recommendations: GeminiMatchmakingRecommendation[];
  summary: string;
}
