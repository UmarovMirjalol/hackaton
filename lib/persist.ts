import { defaultProfile, type Profile, type TaskStatus } from "./types";

export const STORAGE_KEY = "route.admissions.v2";

export type Persisted = {
  profile: Profile;
  compareIds: string[];
  taskStatus: Record<string, TaskStatus>;
};

export const defaultPersisted: Persisted = {
  profile: defaultProfile,
  compareIds: [],
  taskStatus: {},
};

const listeners = new Set<() => void>();

export function subscribePersist(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function readStore(): Persisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      profile: { ...defaultProfile, ...parsed.profile },
      compareIds: parsed.compareIds ?? [],
      taskStatus: parsed.taskStatus ?? {},
    };
  } catch {
    return null;
  }
}

let cachedRaw: string | null | undefined;
let cachedSnapshot: Persisted = defaultPersisted;

export function getPersistedSnapshot(): Persisted {
  if (typeof window === "undefined") return defaultPersisted;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  cachedSnapshot = readStore() ?? defaultPersisted;
  return cachedSnapshot;
}

export function writeStore(data: Persisted) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(data);
  localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedSnapshot = data;
  listeners.forEach((l) => l());
}
