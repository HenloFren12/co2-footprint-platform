import { create } from 'zustand';

// --- 1. User Slice ---
interface UserState {
  userId: string;
  baselineFootprintKg: number;
  onboardingComplete: boolean;
  localeUnits: 'metric' | 'imperial';
  futureSelfLetter: string | null;
  setUserId: (id: string) => void;
  setBaselineFootprintKg: (kg: number) => void;
  setOnboardingComplete: (val: boolean) => void;
  setFutureSelfLetter: (letter: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: 'user-' + Math.random().toString(36).substr(2, 9),
  baselineFootprintKg: 0,
  onboardingComplete: false,
  localeUnits: 'metric',
  futureSelfLetter: null,
  setUserId: (id) => set({ userId: id }),
  setBaselineFootprintKg: (kg) => set({ baselineFootprintKg: kg }),
  setOnboardingComplete: (val) => set({ onboardingComplete: val }),
  setFutureSelfLetter: (letter) => set({ futureSelfLetter: letter }),
}));

// --- 2. Emissions Slice ---
interface ActivityLog {
  id: string;
  activityType: string;
  quantity: number;
  emissionKg: number;
  timestamp: string;
}

interface EmissionsState {
  activityLog: ActivityLog[];
  totalFootprintKg: number;
  topEmissionType: string;
  addActivity: (log: Omit<ActivityLog, 'id'>) => void;
}

export const useEmissionsStore = create<EmissionsState>((set) => ({
  activityLog: [],
  totalFootprintKg: 0,
  topEmissionType: 'car_petrol_km',
  addActivity: (log) =>
    set((state) => {
      const newEntry: ActivityLog = {
        ...log,
        id: Math.random().toString(36).substr(2, 9),
      };
      const newLog = [...state.activityLog, newEntry];

      // O(n) single pass for total
      const newTotal = newLog.reduce(
        (sum, a) => sum + a.emissionKg, 0
      );

      // O(n) single pass for top emission type
      const totals: Record<string, number> = {};
      newLog.forEach((a) => {
        totals[a.activityType] =
          (totals[a.activityType] ?? 0) + a.emissionKg;
      });
      const topType = Object.entries(totals).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] ?? 'car_petrol_km';

      return {
        activityLog: newLog,
        totalFootprintKg: newTotal,
        topEmissionType: topType,
      };
    }),
}));

// --- 3. Nudges Slice ---
interface NudgeHistory {
  id: string;
  activityId: string;
  shown: boolean;
  accepted: boolean;
}

interface NudgesState {
  nudgeHistory: NudgeHistory[];
  dailyCount: number;
  lastResetDate: string;
  incrementDailyCount: () => void;
  addNudgeHistory: (entry: NudgeHistory) => void;
}

export const useNudgesStore = create<NudgesState>((set) => ({
  nudgeHistory: [],
  dailyCount: 0,
  lastResetDate: new Date().toISOString().split('T')[0],
  incrementDailyCount: () =>
    set((state) => {
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = state.lastResetDate !== today;
      return {
        dailyCount: isNewDay ? 1 : state.dailyCount + 1,
        lastResetDate: today,
      };
    }),
  addNudgeHistory: (entry) =>
    set((state) => ({
      nudgeHistory: [...state.nudgeHistory, entry],
    })),
}));

// --- 4. Pacts Slice ---
interface PactMember {
  id: string;
  name: string;
}

interface Pact {
  id: string;
  name: string;
  commitment: string;
  memberIds: string[];
  members: PactMember[];
  trustScores: Record<string, number>;
  status: 'active' | 'completed' | 'failed';
}

interface PactsState {
  pacts: Pact[];
  addPact: (pact: Pact) => void;
  updateTrustScore: (
    pactId: string,
    memberId: string,
    score: number
  ) => void;
}

export const usePactsStore = create<PactsState>((set) => ({
  pacts: [],
  addPact: (pact) =>
    set((state) => ({ pacts: [...state.pacts, pact] })),
  updateTrustScore: (pactId, memberId, score) =>
    set((state) => ({
      pacts: state.pacts.map((p) =>
        p.id === pactId
          ? {
              ...p,
              trustScores: { ...p.trustScores, [memberId]: score },
            }
          : p
      ),
    })),
}));

// --- 5. Persona Slice ---
interface PersonaState {
  currentPersonaId: string;
  lastAssignedWeek: number | null;
  rotationIndex: number;
  setCurrentPersonaId: (id: string) => void;
}

export const usePersonaStore = create<PersonaState>((set) => ({
  currentPersonaId: 'arjun',
  lastAssignedWeek: null,
  rotationIndex: 0,
  setCurrentPersonaId: (id) => set({ currentPersonaId: id }),
}));