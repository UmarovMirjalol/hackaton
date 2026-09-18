"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { synthesize } from "./diagnosis";
import { rankUniversities, recommended } from "./matching";
import {
  defaultPersisted,
  getPersistedSnapshot,
  subscribePersist,
  writeStore,
} from "./persist";
import { buildRoadmap, nextTask } from "./roadmap";
import { demoProfile, type Profile, type TaskStatus } from "./types";

type Persisted = ReturnType<typeof getPersistedSnapshot>;

type Ctx = Persisted & {
  hydrated: boolean;
  setProfile: (patch: Partial<Profile>) => void;
  replaceProfile: (profile: Profile) => void;
  loadDemo: () => void;
  toggleCompare: (id: string) => void;
  setCompareIds: (ids: string[]) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  setOnboardingStep: (step: number) => void;
  reset: () => void;
};

const RouteContext = createContext<Ctx | null>(null);

function usePersisted(): Persisted {
  return useSyncExternalStore(
    subscribePersist,
    getPersistedSnapshot,
    () => defaultPersisted,
  );
}

function useClientHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function RouteProvider({ children }: { children: ReactNode }) {
  const persisted = usePersisted();
  const hydrated = useClientHydrated();

  const actions = useMemo(
    () => ({
      setProfile: (patch: Partial<Profile>) => {
        const cur = getPersistedSnapshot();
        writeStore({ ...cur, profile: { ...cur.profile, ...patch } });
      },
      replaceProfile: (profile: Profile) => {
        writeStore({ profile, compareIds: [], taskStatus: {}, onboardingStep: 0 });
      },
      loadDemo: () => {
        writeStore({
          profile: { ...demoProfile },
          compareIds: [],
          taskStatus: {},
          onboardingStep: 0,
        });
      },
      toggleCompare: (id: string) => {
        const cur = getPersistedSnapshot();
        const has = cur.compareIds.includes(id);
        let compareIds = cur.compareIds;
        if (has) compareIds = compareIds.filter((x) => x !== id);
        else if (compareIds.length < 3) compareIds = [...compareIds, id];
        writeStore({ ...cur, compareIds });
      },
      setCompareIds: (ids: string[]) => {
        const cur = getPersistedSnapshot();
        writeStore({ ...cur, compareIds: ids.slice(0, 3) });
      },
      setTaskStatus: (id: string, status: TaskStatus) => {
        const cur = getPersistedSnapshot();
        writeStore({ ...cur, taskStatus: { ...cur.taskStatus, [id]: status } });
      },
      setOnboardingStep: (step: number) => {
        const cur = getPersistedSnapshot();
        writeStore({ ...cur, onboardingStep: step });
      },
      reset: () => {
        writeStore(defaultPersisted);
      },
    }),
    [],
  );

  const value = useMemo<Ctx>(
    () => ({ ...persisted, hydrated, ...actions }),
    [persisted, hydrated, actions],
  );

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

export function useRoute() {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error("useRoute must be used inside RouteProvider");
  return ctx;
}

export function useDerived() {
  const { profile, compareIds, taskStatus } = useRoute();
  const diagnosis = useMemo(() => synthesize(profile), [profile]);
  const allRanked = useMemo(() => rankUniversities(profile), [profile]);
  const recs = useMemo(() => recommended(profile, 6), [profile]);
  const compare = useMemo(() => {
    const byId = new Map(allRanked.map((r) => [r.university.id, r]));
    return compareIds.map((id) => byId.get(id)).filter((r): r is NonNullable<typeof r> => Boolean(r));
  }, [allRanked, compareIds]);
  const roadmapPicks = useMemo(() => {
    if (compare.length >= 2) return compare;
    return recs.filter((r) => profile.countries.includes(r.university.countryId)).slice(0, 3);
  }, [compare, recs, profile.countries]);
  const roadmap = useMemo(() => buildRoadmap(profile, roadmapPicks), [profile, roadmapPicks]);
  const next = useMemo(() => nextTask(roadmap, taskStatus), [roadmap, taskStatus]);
  return { diagnosis, recs, compare, roadmapPicks, roadmap, next };
}
