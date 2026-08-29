import { 
  Event, User, Team, CheckIn, Announcement, Rubric, Score, 
  LeaderboardEntry, EventAnalytics, UserRole, TeamStatus 
} from '../types';
import { 
  SEED_EVENT, SEED_USERS, SEED_TEAMS, SEED_CHECKINS, 
  SEED_RUBRIC, SEED_SCORES, SEED_ANNOUNCEMENTS 
} from './seedData';
import { verifyAttendeeQRToken, generateAttendeeQRToken } from './qrService';
import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, doc, onSnapshot, setDoc, updateDoc, 
  query, where, orderBy 
} from 'firebase/firestore';

interface RealtimeState {
  event: Event;
  users: User[];
  teams: Team[];
  checkins: CheckIn[];
  announcements: Announcement[];
  rubric: Rubric;
  scores: Score[];
  currentUserId: string;
  currentRole: UserRole;
  isLiveFirebase: boolean;
}

const STORAGE_KEY = 'eventnexus_state_v1';
const CHANNEL_NAME = 'eventnexus_realtime_sync';

class RealtimeStore {
  private state: RealtimeState;
  private listeners: Set<() => void> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private firestoreUnsubscribers: (() => void)[] = [];

  constructor() {
    this.state = this.loadInitialState();
    this.setupBroadcastChannel();
    if (this.state.isLiveFirebase && isFirebaseConfigured && db) {
      this.initFirestoreListeners();
    }
  }

  private loadInitialState(): RealtimeState {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (
            parsed &&
            Array.isArray(parsed.users) &&
            Array.isArray(parsed.teams) &&
            Array.isArray(parsed.scores) &&
            Array.isArray(parsed.checkins) &&
            Array.isArray(parsed.announcements) &&
            parsed.rubric &&
            parsed.event
          ) {
            return {
              ...parsed,
              isLiveFirebase: isFirebaseConfigured,
            };
          }
        } catch (e) {
          console.warn('Failed to parse cached state, using seeds', e);
        }
      }
    }

    return {
      event: { ...SEED_EVENT },
      users: [...SEED_USERS],
      teams: [...SEED_TEAMS],
      checkins: [...SEED_CHECKINS],
      announcements: [...SEED_ANNOUNCEMENTS],
      rubric: { ...SEED_RUBRIC },
      scores: [...SEED_SCORES],
      currentUserId: 'user-part-1', // Default participant
      currentRole: 'participant',
      isLiveFirebase: isFirebaseConfigured,
    };
  }

  private saveState(notifyPeers = true) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Failed to persist state in localStorage', e);
      }
    }
    this.notifyListeners();
    if (notifyPeers && this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'STATE_UPDATED', payload: this.state });
    }
  }

  private setupBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'STATE_UPDATED' && event.data.payload) {
          this.state = {
            ...event.data.payload,
            // Keep local user and role selection
            currentUserId: this.state.currentUserId,
            currentRole: this.state.currentRole,
          };
          this.notifyListeners();
        }
      };
    }
  }

  private initFirestoreListeners() {
    if (!db) return;
    const eventId = this.state.event.id;

    // Listen to Announcements
    const annQuery = query(
      collection(db, 'announcements'),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc')
    );
    const unsubAnn = onSnapshot(annQuery, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
      if (docs.length > 0) {
        this.state.announcements = docs;
        this.saveState(false);
      }
    });
    this.firestoreUnsubscribers.push(unsubAnn);

    // Listen to Checkins
    const chkQuery = query(
      collection(db, 'checkins'),
      where('eventId', '==', eventId)
    );
    const unsubChk = onSnapshot(chkQuery, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as CheckIn));
      if (docs.length > 0) {
        this.state.checkins = docs;
        this.saveState(false);
      }
    });
    this.firestoreUnsubscribers.push(unsubChk);

    // Listen to Teams
    const teamsQuery = query(
      collection(db, 'teams'),
      where('eventId', '==', eventId)
    );
    const unsubTeams = onSnapshot(teamsQuery, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Team));
      if (docs.length > 0) {
        this.state.teams = docs;
        this.saveState(false);
      }
    });
    this.firestoreUnsubscribers.push(unsubTeams);

    // Listen to Scores
    const scoresQuery = query(
      collection(db, 'scores'),
      where('eventId', '==', eventId)
    );
    const unsubScores = onSnapshot(scoresQuery, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Score));
      if (docs.length > 0) {
        this.state.scores = docs;
        this.saveState(false);
      }
    });
    this.firestoreUnsubscribers.push(unsubScores);
  }

  // Reactive Subscription System
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in realtime listener:', err);
      }
    });
  }

  // Getters
  public getState(): RealtimeState {
    return this.state;
  }

  public getCurrentUser(): User | undefined {
    return this.state.users.find(u => u.id === this.state.currentUserId) || this.state.users[0];
  }

  public getCurrentRole(): UserRole {
    return this.state.currentRole;
  }

  public getEvent(): Event {
    return this.state.event;
  }

  public getUsers(): User[] {
    return this.state.users;
  }

  public getTeams(): Team[] {
    return this.state.teams;
  }

  public getCheckIns(): CheckIn[] {
    return this.state.checkins;
  }

  public getAnnouncements(): Announcement[] {
    return [...this.state.announcements].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public getRubric(): Rubric {
    return this.state.rubric;
  }

  public getScores(): Score[] {
    return this.state.scores;
  }

  // Real-time Leaderboard Computation
  public getLeaderboard(): LeaderboardEntry[] {
    const { teams, scores, rubric } = this.state;
    const isSum = rubric.aggregationMethod === 'total_sum';

    const entries: LeaderboardEntry[] = teams.map((team) => {
      const teamScores = scores.filter(s => s.teamId === team.id);
      let aggregateScore = 0;

      if (teamScores.length > 0) {
        if (isSum) {
          aggregateScore = teamScores.reduce((acc, s) => acc + s.totalScore, 0);
        } else {
          // Average across judges
          const sum = teamScores.reduce((acc, s) => acc + s.totalScore, 0);
          aggregateScore = parseFloat((sum / teamScores.length).toFixed(2));
        }
      }

      const allLocked = teamScores.length > 0 && teamScores.every(s => s.locked);

      return {
        teamId: team.id,
        teamName: team.name,
        projectTitle: team.projectTitle,
        category: team.category,
        memberCount: team.memberIds.length,
        aggregateScore,
        judgeCount: teamScores.length,
        rank: 0,
        scores: teamScores.map(s => ({
          judgeId: s.judgeId,
          judgeName: s.judgeName,
          score: s.totalScore,
        })),
        locked: allLocked,
      };
    });

    // Sort descending by aggregate score, then by judge count
    entries.sort((a, b) => {
      if (b.aggregateScore !== a.aggregateScore) {
        return b.aggregateScore - a.aggregateScore;
      }
      return b.judgeCount - a.judgeCount;
    });

    // Assign 1-indexed ranks
    entries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    return entries;
  }

  // Analytics Computation
  public getAnalytics(): EventAnalytics {
    const { users, checkins, teams, scores } = this.state;
    const participants = users.filter(u => u.role === 'participant');
    const judges = users.filter(u => u.role === 'judge');

    const totalRegistrations = participants.length;
    const totalCheckedIn = checkins.length;
    const checkInRate = totalRegistrations > 0 
      ? Math.round((totalCheckedIn / totalRegistrations) * 100) 
      : 0;

    const totalTeams = teams.length;
    const teamsLocked = teams.filter(t => t.status === 'locked').length;
    const teamsLookingForMembers = teams.filter(t => t.status === 'forming').length;

    // Total possible judge-team evaluations = teams * judges
    const expectedEvaluations = teams.length * judges.length;
    const submittedEvaluations = scores.length;
    const judgingCompletionRate = expectedEvaluations > 0 
      ? Math.round((submittedEvaluations / expectedEvaluations) * 100) 
      : 0;

    // Skills distribution
    const skillDistribution: Record<string, number> = {};
    participants.forEach(p => {
      p.skills.forEach(skill => {
        skillDistribution[skill] = (skillDistribution[skill] || 0) + 1;
      });
    });

    // Role distribution
    const roleDistribution: Record<string, number> = {};
    participants.forEach(p => {
      if (p.desiredRole) {
        roleDistribution[p.desiredRole] = (roleDistribution[p.desiredRole] || 0) + 1;
      }
    });

    // Score distribution (buckets: 90-100, 80-89, 70-79, <70)
    const buckets = [
      { range: '90-100 (Exceptional)', count: 0 },
      { range: '80-89 (Strong)', count: 0 },
      { range: '70-79 (Competent)', count: 0 },
      { range: '< 70 (Needs Work)', count: 0 },
    ];

    scores.forEach(s => {
      if (s.totalScore >= 90) buckets[0].count++;
      else if (s.totalScore >= 80) buckets[1].count++;
      else if (s.totalScore >= 70) buckets[2].count++;
      else buckets[3].count++;
    });

    return {
      totalRegistrations,
      totalCheckedIn,
      checkInRate,
      totalTeams,
      teamsLocked,
      teamsLookingForMembers,
      totalJudges: judges.length,
      scoresSubmitted: scores.length,
      judgingCompletionRate,
      totalAnnouncements: this.state.announcements.length,
      skillDistribution,
      roleDistribution,
      scoreDistribution: buckets,
      checkInTimeline: [
        { time: '09:00 AM', count: 1 },
        { time: '09:15 AM', count: 2 },
        { time: '09:30 AM', count: 3 },
      ],
    };
  }

  // --- ACTIONS ---

  public setRole(role: UserRole) {
    this.state.currentRole = role;
    // Auto-select a user of this role if available
    const userForRole = this.state.users.find(u => u.role === role);
    if (userForRole) {
      this.state.currentUserId = userForRole.id;
    }
    this.saveState(false);
  }

  public setUser(userId: string) {
    const user = this.state.users.find(u => u.id === userId);
    if (user) {
      this.state.currentUserId = user.id;
      this.state.currentRole = user.role;
      this.saveState(false);
    }
  }

  // Phase 1: Registration
  public async registerUser(payload: {
    name: string;
    email: string;
    skills: string[];
    desiredRole?: User['desiredRole'];
    bio?: string;
    rolePreference?: UserRole;
  }): Promise<{ user: User; checkInToken: string }> {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      role: payload.rolePreference || 'participant',
      eventId: this.state.event.id,
      skills: payload.skills,
      desiredRole: payload.desiredRole,
      bio: payload.bio || '',
      lookingForTeam: true,
      createdAt: new Date().toISOString(),
    };

    this.state.users.push(newUser);
    this.state.currentUserId = newUser.id;
    this.state.currentRole = newUser.role;
    this.saveState();

    if (this.state.isLiveFirebase && db) {
      try {
        await setDoc(doc(db, 'users', newUser.id), newUser);
      } catch (err) {
        console.warn('Firestore write fallback:', err);
      }
    }

    const checkInToken = generateAttendeeQRToken(this.state.event.id, newUser.id);

    return {
      user: newUser,
      checkInToken,
    };
  }

  // Phase 1: Attendee Check-In
  public async checkInAttendee(
    token: string, 
    method: 'onsite' | 'virtual' = 'onsite',
    verifiedBy = 'user-org-1'
  ): Promise<{ success: boolean; message: string; checkIn?: CheckIn }> {
    let targetUserId: string | undefined;

    // 1. Try standard signed QR token verification
    const decoded = verifyAttendeeQRToken(token, this.state.event.id);
    if (decoded.valid && decoded.userId) {
      targetUserId = decoded.userId;
    } else {
      // 2. Direct manual fallback: check if token matches user id or user email directly
      const cleanToken = token.trim();
      const directUser = this.state.users.find(
        u => u.id === cleanToken || u.email.toLowerCase() === cleanToken.toLowerCase()
      );
      if (directUser) {
        targetUserId = directUser.id;
      } else {
        return { success: false, message: decoded.error || 'Unrecognized pass or attendee token.' };
      }
    }

    // Check if already checked in
    const existing = this.state.checkins.find(c => c.userId === targetUserId && c.eventId === this.state.event.id);
    if (existing) {
      return { 
        success: true, 
        message: `Attendee ${existing.userName} is already checked in at ${new Date(existing.checkedInAt).toLocaleTimeString()}`, 
        checkIn: existing 
      };
    }

    const user = this.state.users.find(u => u.id === targetUserId);
    if (!user) {
      return { success: false, message: 'Attendee record not found for this badge.' };
    }

    const newCheckIn: CheckIn = {
      id: `chk-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      eventId: this.state.event.id,
      qrToken: token.startsWith('EVT_PASS:') ? token : generateAttendeeQRToken(this.state.event.id, user.id),
      checkedInAt: new Date().toISOString(),
      method,
      verifiedBy,
    };

    this.state.checkins.push(newCheckIn);
    this.saveState();

    if (this.state.isLiveFirebase && db) {
      try {
        await setDoc(doc(db, 'checkins', newCheckIn.id), newCheckIn);
      } catch (err) {
        console.warn('Firestore checkin write fallback:', err);
      }
    }

    return { success: true, message: `Successfully verified and checked in ${user.name}!`, checkIn: newCheckIn };
  }

  // Phase 2: Teams
  public async createTeam(payload: {
    name: string;
    projectTitle: string;
    projectDescription: string;
    category: string;
    lookingForRoles: string[];
  }): Promise<Team> {
    const currentUser = this.getCurrentUser();
    const leaderId = currentUser ? currentUser.id : 'user-part-1';

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      eventId: this.state.event.id,
      name: payload.name,
      leaderId,
      memberIds: [leaderId],
      projectTitle: payload.projectTitle,
      projectDescription: payload.projectDescription,
      category: payload.category,
      status: 'forming',
      lookingForRoles: payload.lookingForRoles,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.teams.push(newTeam);

    // Update user's teamId
    const userIndex = this.state.users.findIndex(u => u.id === leaderId);
    if (userIndex !== -1) {
      this.state.users[userIndex].teamId = newTeam.id;
      this.state.users[userIndex].lookingForTeam = false;
    }

    this.saveState();

    if (this.state.isLiveFirebase && db) {
      try {
        await setDoc(doc(db, 'teams', newTeam.id), newTeam);
      } catch (err) {
        console.warn('Firestore team write fallback:', err);
      }
    }

    return newTeam;
  }

  public async joinTeam(teamId: string, userId: string): Promise<boolean> {
    const team = this.state.teams.find(t => t.id === teamId);
    const user = this.state.users.find(u => u.id === userId);
    if (!team || !user) return false;

    if (team.status === 'locked') {
      throw new Error('This team roster is locked and not accepting new members');
    }

    if (team.memberIds.length >= this.state.event.maxTeamSize) {
      throw new Error(`Team has reached max capacity (${this.state.event.maxTeamSize} members)`);
    }

    // Remove user from any previous team
    if (user.teamId && user.teamId !== team.id) {
      const oldTeam = this.state.teams.find(t => t.id === user.teamId);
      if (oldTeam) {
        oldTeam.memberIds = oldTeam.memberIds.filter(id => id !== userId);
        oldTeam.updatedAt = new Date().toISOString();
      }
    }

    if (!team.memberIds.includes(userId)) {
      team.memberIds.push(userId);
      team.updatedAt = new Date().toISOString();
      user.teamId = team.id;
      user.lookingForTeam = false;
      this.saveState();

      if (this.state.isLiveFirebase && db) {
        try {
          await updateDoc(doc(db, 'teams', team.id), {
            memberIds: team.memberIds,
            updatedAt: team.updatedAt,
          });
        } catch (err) {
          console.warn('Firestore join team fallback:', err);
        }
      }
      return true;
    }
    return false;
  }

  public async toggleTeamLock(teamId: string): Promise<TeamStatus> {
    const team = this.state.teams.find(t => t.id === teamId);
    if (!team) throw new Error('Team not found');

    team.status = team.status === 'locked' ? 'forming' : 'locked';
    team.updatedAt = new Date().toISOString();
    this.saveState();

    if (this.state.isLiveFirebase && db) {
      try {
        await updateDoc(doc(db, 'teams', team.id), {
          status: team.status,
          updatedAt: team.updatedAt,
        });
      } catch (err) {
        console.warn('Firestore toggle lock fallback:', err);
      }
    }
    return team.status;
  }

  // Phase 3: Announcements
  public async postAnnouncement(payload: {
    title: string;
    body: string;
    severity: Announcement['severity'];
    category: Announcement['category'];
    pinned?: boolean;
  }): Promise<Announcement> {
    const currentUser = this.getCurrentUser();
    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      eventId: this.state.event.id,
      authorId: currentUser?.id || 'user-org-1',
      authorName: currentUser?.name || 'Lead Organizer',
      authorRole: currentUser?.role || 'organizer',
      title: payload.title,
      body: payload.body,
      severity: payload.severity,
      category: payload.category,
      pinned: payload.pinned || false,
      createdAt: new Date().toISOString(),
    };

    this.state.announcements.unshift(newAnnouncement);
    this.saveState();

    if (this.state.isLiveFirebase && db) {
      try {
        await setDoc(doc(db, 'announcements', newAnnouncement.id), newAnnouncement);
      } catch (err) {
        console.warn('Firestore announcement write fallback:', err);
      }
    }

    return newAnnouncement;
  }

  // Phase 4: Rubrics & Scores
  public async updateRubric(rubric: Rubric): Promise<void> {
    this.state.rubric = {
      ...rubric,
      updatedAt: new Date().toISOString(),
    };
    this.saveState();
  }

  public async submitScore(payload: {
    teamId: string;
    criterionScores: { criterionId: string; criterionName: string; score: number; maxScore: number; weight: number }[];
    feedback: string;
    lockImmediately?: boolean;
  }): Promise<Score> {
    const currentUser = this.getCurrentUser();
    const judgeId = currentUser?.id || 'user-judge-1';
    const judgeName = currentUser?.name || 'Evaluation Judge';
    const team = this.state.teams.find(t => t.id === payload.teamId);

    if (!team) throw new Error('Team not found for score submission');

    // Calculate normalized total score (0-100)
    let totalWeightedScore = 0;
    let totalWeight = 0;

    payload.criterionScores.forEach(cs => {
      const normalizedScore = (cs.score / cs.maxScore) * 100;
      totalWeightedScore += normalizedScore * cs.weight;
      totalWeight += cs.weight;
    });

    const totalScore = totalWeight > 0 
      ? parseFloat((totalWeightedScore / totalWeight).toFixed(2)) 
      : 0;

    const existingIndex = this.state.scores.findIndex(
      s => s.teamId === payload.teamId && s.judgeId === judgeId
    );

    const isLocking = payload.lockImmediately ?? false;
    const now = new Date().toISOString();

    let scoreObj: Score;

    if (existingIndex !== -1) {
      const existing = this.state.scores[existingIndex];
      if (existing.locked) {
        throw new Error('This evaluation is locked and cannot be edited after deadline.');
      }

      scoreObj = {
        ...existing,
        criterionScores: payload.criterionScores,
        totalScore,
        feedback: payload.feedback,
        submittedAt: now,
        locked: isLocking,
        auditTrail: [
          ...existing.auditTrail,
          {
            timestamp: now,
            action: isLocking ? 'locked' : 'updated',
            totalComputedScore: totalScore,
            judgeId,
          }
        ]
      };
      this.state.scores[existingIndex] = scoreObj;
    } else {
      scoreObj = {
        id: `score-${Date.now()}-${judgeId}`,
        eventId: this.state.event.id,
        teamId: team.id,
        teamName: team.name,
        judgeId,
        judgeName,
        rubricId: this.state.rubric.id,
        criterionScores: payload.criterionScores,
        totalScore,
        feedback: payload.feedback,
        submittedAt: now,
        locked: isLocking,
        auditTrail: [
          {
            timestamp: now,
            action: isLocking ? 'locked' : 'created',
            totalComputedScore: totalScore,
            judgeId,
          }
        ]
      };
      this.state.scores.push(scoreObj);
    }

    this.saveState();

    if (this.state.isLiveFirebase && db) {
      try {
        await setDoc(doc(db, 'scores', scoreObj.id), scoreObj);
      } catch (err) {
        console.warn('Firestore score write fallback:', err);
      }
    }

    return scoreObj;
  }

  public resetToSeedData() {
    this.state = {
      event: { ...SEED_EVENT },
      users: [...SEED_USERS],
      teams: [...SEED_TEAMS],
      checkins: [...SEED_CHECKINS],
      announcements: [...SEED_ANNOUNCEMENTS],
      rubric: { ...SEED_RUBRIC },
      scores: [...SEED_SCORES],
      currentUserId: 'user-part-1',
      currentRole: 'participant',
      isLiveFirebase: isFirebaseConfigured,
    };
    this.saveState();
  }
}

export const realtimeStore = new RealtimeStore();
