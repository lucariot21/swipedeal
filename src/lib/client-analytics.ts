"use client";

import { defaultRemoteConfig } from "@/lib/remote-config";
import type {
  AnalyticsEvent,
  RemoteConfig,
  ServerAnalyticsSnapshot,
  ServerProfileSnapshot,
} from "@/types/prototype";

export function syncAnalyticsEvent(event: AnalyticsEvent) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = JSON.stringify(event);

  if ("sendBeacon" in navigator) {
    const blob = new Blob([payload], { type: "application/json" });
    const sent = navigator.sendBeacon("/api/analytics", blob);

    if (sent) {
      return;
    }
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

export async function fetchServerAnalyticsSnapshot() {
  const response = await fetch("/api/analytics?summary=1", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch analytics snapshot");
  }

  return (await response.json()) as ServerAnalyticsSnapshot;
}

export async function fetchRemoteConfig() {
  try {
    const response = await fetch("/api/config", {
      cache: "no-store",
    });

    if (!response.ok) {
      return defaultRemoteConfig;
    }

    return (await response.json()) as RemoteConfig;
  } catch {
    return defaultRemoteConfig;
  }
}

export async function syncProfileSnapshot(snapshot: ServerProfileSnapshot) {
  const response = await fetch("/api/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(snapshot),
    keepalive: true,
  });

  if (!response.ok) {
    throw new Error("Failed to sync profile snapshot");
  }

  return (await response.json()) as { ok: true; lastSeenAt: number };
}

export async function fetchProfileSnapshot(sessionId: string) {
  const response = await fetch(`/api/profile?sessionId=${encodeURIComponent(sessionId)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch profile snapshot");
  }

  return (await response.json()) as ServerProfileSnapshot | null;
}
