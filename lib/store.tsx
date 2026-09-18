"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { synthesize } from "./diagnosis";
import { recommended } from "./matching";
import { buildRoadmap, nextTask } from "./roadmap";
import {
  defaultProfile,
  type Profile,
  type TaskStatus,
} from "./types";

/** Bump when persisted shape changes so stale demos cannot resurrect old exam flags. */
const STORAGE_KEY = "route.admissions.v2";

type Store = {
  profile: Profile;
  compareIds: string[];
  taskStatus: Record<string, TaskStatus>;
  hydrated: boolean;
};

type Ctx = Store & {
  setProfile: (patch: Partial<Profile>) => void;
  replaceProfile: (profile: Profile) => void;
  toggleCompare: (id: string) => void;
  setCompareIds: (ids: string[]) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  reset: () => void;
};

const RouteContext = createContext<Ctx | null>(null);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>({
    profile: defaultProfile,
    compareIds: [],
    taskStatus: {},
    hydrated: false,
  });
  /** Prevents localStorage hydrate from clobbering an early demo/profile write. */
  const userWrote = useRef(false);

  useEffect(() => {
    if (userWrote.current) {
      setStore((s) => (s.hydrated ? s : { ...s, hydrated: true }));
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Store>;
        setStore((s) => {
          if (userWrote.current) return { ...s, hydrated: true };
          return {
            ...s,
            profile: { ...defaultProfile, ...parsed.profile },
            compareIds: parsed.compareIds ?? [],
            taskStatus: parsed.taskStatus ?? {},
            hydrated: true,
          };
        });
        return;
      }
    } catch {
      // ignore broken storage
    }
    setStore((s) => ({ ...s, hydrated: true }));
  }, []);

  useEffect(() => {
    if (!store.hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        profile: store.profile,
        compareIds: store.compareIds,
        taskStatus: store.taskStatus,
      }),
    );
  }, [store]);

  const value = useMemo<Ctx>(
    () => ({
      ...store,
      setProfile: (patch) => {
        userWrote.current = true;
        setStore((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
      },
      replaceProfile: (profile) => {
        userWrote.current = true;
        setStore((s) => ({
          ...s,
          profile,
          compareIds: [],
          taskStatus: {},
          hydrated: true,
        }));
      },
      toggleCompare: (id) => {
        userWrote.current = true;
        setStore((s) => {
          const has = s.compareIds.includes(id);
          if (has) return { ...s, compareIds: s.compareIds.filter((x) => x !== id) };
          if (s.compareIds.length >= 3) return s;
          return { ...s, compareIds: [...s.compareIds, id] };
        });
      },
      setCompareIds: (ids) => {
        userWrote.current = true;
        setStore((s) => ({ ...s, compareIds: ids.slice(0, 3) }));
      },
      setTaskStatus: (id, status) => {
        userWrote.current = true;
        setStore((s) => ({ ...s, taskStatus: { ...s.taskStatus, [id]: status } }));
      },
      reset: () => {
        userWrote.current = true;
        setStore({
          profile: defaultProfile,
          compareIds: [],
          taskStatus: {},
          hydrated: true,
        });
      },
    }),
    [store],
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
  const recs = useMemo(() => recommended(profile, 6), [profile]);
  const compare = useMemo(() => {
    const picked = recs.filter((r) => compareIds.includes(r.university.id));
    if (picked.length >= 2) return picked;
    return recs.slice(0, 3);
  }, [recs, compareIds]);
  const roadmap = useMemo(() => buildRoadmap(profile, compare), [profile, compare]);
  const next = useMemo(() => nextTask(roadmap, taskStatus), [roadmap, taskStatus]);
  return { diagnosis, recs, compare, roadmap, next };
}
