"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Attempt } from "@/lib/core/progress";
import { clearSnapshot, localSnapshot } from "@/lib/offline";
import type { Locale } from "@/lib/i18n";
export type Settings = {
  locale: Locale;
  theme: "dark" | "light" | "system";
  mode: "guided" | "strict" | "assist";
  language: string;
  lastLesson: string;
  fontSize: number;
  displayName: string;
  level: "beginner" | "intermediate" | "advanced";
};
export type LessonProgress = {
  stage: number;
  completed: boolean;
  touched: string[];
  updatedAt: number;
};
export const emptyLesson: LessonProgress = {
  stage: 0,
  completed: false,
  touched: [],
  updatedAt: 0,
};
export type LearningState = {
  settings: Settings;
  drafts: Record<string, string>;
  projects: Record<string, { step: number; code: string }>;
  lessonProgress: Record<string, LessonProgress>;
  attempts: Attempt[];
  revision: number;
};
export const initial: LearningState = {
  settings: {
    locale: "es",
    theme: "dark",
    mode: "guided",
    language: "python",
    lastLesson: "python-inicio",
    fontSize: 15,
    displayName: "",
    level: "beginner",
  },
  drafts: {},
  projects: {},
  lessonProgress: {},
  attempts: [],
  revision: 0,
};
export async function api<T = Record<string, unknown>>(
  path: string,
  method = "GET",
  data?: unknown,
) {
  const r = await fetch("/api/v1/" + path, {
    method,
    headers: data === undefined ? {} : { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const value = (await r.json()) as T & { error?: string };
  if (!r.ok) throw new Error(value.error || "Error de conexión.");
  return value;
}
function normalize(s: Partial<LearningState>): LearningState {
  return { ...initial, ...s, settings: { ...initial.settings, ...s.settings } };
}
export function useLearning(userId: string | null, localKey?: string) {
  const [state, setState] = useState<LearningState>(initial);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [online, setOnline] = useState(true);
  const [guestProgress, setGuestProgress] = useState<LearningState | null>(
    null,
  );
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  }, [state]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = useRef(false);
  const dirty = useRef(false);
  const enabled = useRef(false);
  const key = userId || localKey || "guest";
  useEffect(() => {
    let live = true;
    const connection = () => setOnline(navigator.onLine);
    connection();
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    (async () => {
      try {
        const cached = (await localSnapshot(key).catch(() => undefined)) as
          | (LearningState & { pending?: boolean })
          | undefined;
        await localSnapshot("session-index", { key }).catch(() => {});
        if (userId) {
          let remote: Partial<LearningState>;
          try {
            remote = await api<Partial<LearningState>>("state");
          } catch (e) {
            if (cached) {
              if (live) {
                setState(normalize(cached));
                setStatus("local");
              }
            } else throw e;
            return;
          }
          if (live) {
            const next = normalize(remote);
            if (cached?.pending) {
              next.drafts = { ...next.drafts, ...cached.drafts };
              next.projects = { ...next.projects, ...cached.projects };
              next.lessonProgress = {
                ...next.lessonProgress,
                ...cached.lessonProgress,
              };
              next.settings = { ...next.settings, ...cached.settings };
              next.attempts = [
                ...next.attempts,
                ...cached.attempts.filter(
                  (a) => a.local && !next.attempts.some((x) => x.id === a.id),
                ),
              ];
              next.revision = cached.revision;
              dirty.current = true;
            }
            setState(next);
            latest.current = next;
            enabled.current = true;
            setStatus(cached?.pending ? "local" : "saved");
            const guest = (await localSnapshot("guest").catch(
              () => undefined,
            )) as LearningState | undefined;
            const dismissed = await localSnapshot(
              "merge-dismissed:" + userId,
            ).catch(() => undefined);
            if (
              guest &&
              !dismissed &&
              (guest.attempts.length ||
                Object.keys(guest.drafts).length ||
                Object.keys(guest.lessonProgress || {}).length)
            )
              setGuestProgress(normalize(guest));
          }
        } else if (live) {
          if (cached) {
            const next = normalize(cached);
            setState(next);
            latest.current = next;
          }
          setStatus("local");
        }
      } catch (e) {
        if (live) {
          setError(e instanceof Error ? e.message : String(e));
          setStatus("error");
        }
      } finally {
        if (live) setLoaded(true);
      }
    })();
    return () => {
      live = false;
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [key, userId]);
  const save = useCallback(
    async function persist() {
      if (busy.current) {
        dirty.current = true;
        return;
      }
      if (!loaded) return;
      const snapshot = latest.current;
      if (!userId || !navigator.onLine) {
        await localSnapshot(key, { ...snapshot, pending: true }).catch(() =>
          setError("No se pudo guardar localmente. Exporta tu copia."),
        );
        setStatus("local");
        dirty.current = false;
        return;
      }
      busy.current = true;
      dirty.current = false;
      setStatus("saving");
      setError("");
      try {
        if (!enabled.current) {
          const remote = await api<Partial<LearningState>>("state");
          if ((remote.revision || 0) !== snapshot.revision)
            throw new Error(
              "Hay cambios en otro dispositivo. Exporta tu copia antes de recargar.",
            );
          enabled.current = true;
        }
        let revision: number;
        let attempts = snapshot.attempts;
        if (snapshot.attempts.some((a) => a.local)) {
          const r = await api<LearningState>("sync", "POST", {
            strategy: "combine",
            state: snapshot,
            locale: snapshot.settings.locale,
          });
          revision = r.revision;
          attempts = r.attempts;
        } else {
          const r = await api<{ revision: number }>("state", "PUT", {
            settings: snapshot.settings,
            drafts: snapshot.drafts,
            projects: snapshot.projects,
            lessonProgress: snapshot.lessonProgress,
            revision: snapshot.revision,
          });
          revision = r.revision;
        }
        const syncedIds = new Set(snapshot.attempts.map((a) => a.id));
        const next = {
          ...latest.current,
          revision,
          attempts: [
            ...attempts.filter((a) => !a.local),
            ...latest.current.attempts.filter(
              (a) => a.local && !syncedIds.has(a.id),
            ),
          ],
        };
        latest.current = next;
        setState(next);
        await localSnapshot(key, { ...next, pending: dirty.current });
        setStatus(dirty.current ? "local" : "saved");
      } catch (e) {
        await localSnapshot(key, { ...latest.current, pending: true }).catch(
          () => {},
        );
        setStatus("error");
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        busy.current = false;
        if (dirty.current) {
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => void persist(), 1400);
        }
      }
    },
    [loaded, userId, key],
  );
  function update(fn: (s: LearningState) => LearningState) {
    dirty.current = true;
    const next = fn(latest.current);
    latest.current = next;
    setState(next);
    void localSnapshot(key, { ...next, pending: true }).catch(() =>
      setError("No se pudo crear una copia local. Descarga tu código."),
    );
    setStatus("local");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(), 1400);
  }
  useEffect(() => {
    if (online && loaded && dirty.current) void save();
  }, [online, loaded, save]);
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, []);
  function addAttempts(attempts: Attempt[]) {
    const ids = new Set(latest.current.attempts.map((a) => a.id));
    const next = {
      ...latest.current,
      attempts: [
        ...latest.current.attempts,
        ...attempts.filter((a) => !ids.has(a.id)),
      ],
    };
    latest.current = next;
    setState(next);
    void localSnapshot(key, {
      ...next,
      pending: next.attempts.some((a) => a.local),
    });
    if (next.attempts.some((a) => a.local)) {
      dirty.current = true;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void save(), 1400);
    }
  }
  async function merge(strategy: "combine" | "account" | "local") {
    if (!userId || !guestProgress) return;
    if (strategy === "account") {
      await localSnapshot("merge-dismissed:" + userId, true);
      setGuestProgress(null);
      return;
    }
    await localSnapshot(
      "account-backup:" + userId + ":" + Date.now(),
      latest.current,
    );
    const cloud = latest.current;
    const local = guestProgress;
    const drafts =
      strategy === "local"
        ? { ...local.drafts }
        : { ...cloud.drafts, ...local.drafts };
    if (strategy === "combine")
      for (const id of Object.keys(local.drafts))
        if (cloud.drafts[id] && cloud.drafts[id] !== local.drafts[id])
          drafts[id + "@account-" + Date.now()] = cloud.drafts[id];
    const merged = {
      ...local,
      revision: cloud.revision,
      drafts,
      projects:
        strategy === "local"
          ? local.projects
          : { ...cloud.projects, ...local.projects },
      lessonProgress:
        strategy === "local"
          ? local.lessonProgress
          : { ...cloud.lessonProgress, ...local.lessonProgress },
    };
    const result = await api<LearningState>("sync", "POST", {
      strategy,
      state: merged,
      locale: local.settings.locale,
    });
    setState(normalize(result));
    latest.current = normalize(result);
    await localSnapshot(key, result);
    await localSnapshot("merge-dismissed:" + userId, true);
    setGuestProgress(null);
    setStatus("saved");
  }
  async function erase() {
    if (userId) await api("account", "DELETE", {});
    await clearSnapshot(key);
    dirty.current = false;
    enabled.current = true;
    setState(initial);
    latest.current = initial;
    setStatus(userId ? "saved" : "local");
  }
  return {
    state,
    update,
    status,
    error,
    setError,
    loaded,
    online,
    save,
    addAttempts,
    erase,
    guestProgress,
    merge,
  };
}
