"use client";

import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import type { PrototypePersistedState, UserPreferences } from "@/types/prototype";

const STORAGE_KEY = "volt-deals-prototype/v3";
const STORAGE_EVENT = "volt-deals-storage-updated";
const DEMO_START_POINTS = 12;
const DEMO_START_STREAK = 3;
const FALLBACK_SESSION_ID = "boot-session";

let hasBootstrappedClientState = false;
let cachedPrototypeState: PrototypePersistedState | null = null;

function hashSeed(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function inferVariant(): PrototypePersistedState["experimentVariant"] {
  if (typeof window === "undefined") {
    return "momentum";
  }

  const seed = `${window.navigator.userAgent}-${window.screen.width}-${window.screen.height}`;
  return hashSeed(seed) % 2 === 0 ? "momentum" : "social-proof";
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function inferSessionId() {
  if (typeof window === "undefined") {
    return "server-preview-session";
  }

  if (typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildDefaultPreferences(): UserPreferences {
  return {
    pricePreference: "all",
    shoppingMode: "balanced",
    favoriteCategories: [],
    favoriteSponsors: [],
    sponsoredOnly: false,
  };
}

export function buildDefaultPrototypeState(): PrototypePersistedState {
  return {
    sessionId: inferSessionId(),
    points: DEMO_START_POINTS,
    streak: DEMO_START_STREAK,
    lastViewDate: todayKey(),
    savedIds: [],
    hotVotedIds: [],
    viewedIds: [],
    experimentVariant: inferVariant(),
    analyticsEvents: [],
    installDismissedAt: null,
    installedAt: null,
    lastSyncedAt: null,
    preferences: buildDefaultPreferences(),
  };
}

function buildHydrationSafeState(): PrototypePersistedState {
  return {
    sessionId: FALLBACK_SESSION_ID,
    points: DEMO_START_POINTS,
    streak: DEMO_START_STREAK,
    lastViewDate: "",
    savedIds: [],
    hotVotedIds: [],
    viewedIds: [],
    experimentVariant: "momentum",
    analyticsEvents: [],
    installDismissedAt: null,
    installedAt: null,
    lastSyncedAt: null,
    preferences: buildDefaultPreferences(),
  };
}

function getCachedPrototypeState() {
  if (cachedPrototypeState) {
    return cachedPrototypeState;
  }

  cachedPrototypeState = buildHydrationSafeState();
  return cachedPrototypeState;
}

function uniqueIds(values: number[]) {
  return [...new Set(values)].filter((value) => Number.isFinite(value));
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)].filter(Boolean);
}

function normalizeState(
  partialState: Partial<PrototypePersistedState> | PrototypePersistedState | null | undefined,
) {
  const defaults = buildDefaultPrototypeState();
  const nextState = {
    ...defaults,
    ...partialState,
  };

  return {
    ...nextState,
    savedIds: uniqueIds(nextState.savedIds),
    hotVotedIds: uniqueIds(nextState.hotVotedIds),
    viewedIds: uniqueIds(nextState.viewedIds),
    analyticsEvents: [...(nextState.analyticsEvents ?? [])].slice(-250),
    preferences: {
      ...defaults.preferences,
      ...nextState.preferences,
      favoriteCategories: uniqueStrings(nextState.preferences?.favoriteCategories ?? []),
      favoriteSponsors: [...new Set(nextState.preferences?.favoriteSponsors ?? [])],
    },
  } satisfies PrototypePersistedState;
}

export function readPrototypeState() {
  return getCachedPrototypeState();
}

function emitStateChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function bootstrapPrototypeState() {
  if (typeof window === "undefined" || hasBootstrappedClientState) {
    return;
  }

  hasBootstrappedClientState = true;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      writePrototypeState(normalizeState(buildDefaultPrototypeState()));
      return;
    }

    const normalized = normalizeState(JSON.parse(raw) as PrototypePersistedState);
    cachedPrototypeState = normalized;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    writePrototypeState(normalizeState(buildDefaultPrototypeState()));
    return;
  }

  emitStateChange();
}

export function writePrototypeState(nextState: PrototypePersistedState) {
  cachedPrototypeState = nextState;

  if (typeof window === "undefined") {
    return nextState;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  emitStateChange();

  return nextState;
}

export function updatePrototypeState(
  updater: (currentState: PrototypePersistedState) => PrototypePersistedState,
) {
  const previous = readPrototypeState();
  const next = normalizeState(updater(previous));

  writePrototypeState(next);

  return {
    previous,
    next,
  };
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      cachedPrototypeState = raw
        ? normalizeState(JSON.parse(raw) as PrototypePersistedState)
        : normalizeState(buildDefaultPrototypeState());
    } catch {
      cachedPrototypeState = normalizeState(buildDefaultPrototypeState());
    }

    callback();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(STORAGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(STORAGE_EVENT, handleChange);
  };
}

export function usePrototypeState() {
  const state = useSyncExternalStore(subscribe, readPrototypeState, getCachedPrototypeState);

  useEffect(() => {
    bootstrapPrototypeState();
  }, []);

  return state;
}
