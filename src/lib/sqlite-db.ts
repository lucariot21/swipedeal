import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { defaultRemoteConfig } from "@/lib/remote-config";
import type {
  AnalyticsEvent,
  RemoteConfig,
  ServerProfileSnapshot,
} from "@/types/prototype";
import type { DatabaseSync } from "node:sqlite";

type ConfigRow = {
  value: string;
};

type ProfileRow = {
  session_id: string;
  last_seen_at: number;
  points: number;
  streak: number;
  saved_count: number;
  hot_votes_count: number;
  viewed_count: number;
  experiment_variant: ServerProfileSnapshot["experimentVariant"];
  preferences_json: string;
};

type StorageMode = "sqlite" | "memory";

type MemoryStore = {
  events: AnalyticsEvent[];
  config: RemoteConfig;
  profiles: Record<string, ServerProfileSnapshot>;
};

type DatabaseSyncConstructor = new (
  path: string,
  options?: { open?: boolean; readOnly?: boolean },
) => DatabaseSync;

const dataDir = path.join(process.cwd(), "data");
const databasePath = path.join(dataDir, "volt-deals.sqlite");
const legacyAnalyticsPath = path.join(dataDir, "analytics-events.json");
const require = createRequire(import.meta.url);

declare global {
  var __voltDealsDatabase: DatabaseSync | undefined;
  var __voltDealsStorageMode: StorageMode | undefined;
  var __voltDealsMemoryStore: MemoryStore | undefined;
}

function ensureDatabaseDirectory() {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

function resolvePreferredStorageMode(): StorageMode {
  const configuredMode = process.env.PROTOTYPE_STORAGE_MODE;

  if (configuredMode === "memory" || configuredMode === "sqlite") {
    return configuredMode;
  }

  return process.env.VERCEL === "1" ? "memory" : "sqlite";
}

function getStorageMode() {
  if (globalThis.__voltDealsStorageMode) {
    return globalThis.__voltDealsStorageMode;
  }

  const resolvedMode = resolvePreferredStorageMode();
  globalThis.__voltDealsStorageMode = resolvedMode;

  return resolvedMode;
}

function setStorageMode(mode: StorageMode) {
  globalThis.__voltDealsStorageMode = mode;
}

function buildMemoryStore(): MemoryStore {
  return {
    events: [],
    config: defaultRemoteConfig,
    profiles: {},
  };
}

function getMemoryStore() {
  if (globalThis.__voltDealsMemoryStore) {
    return globalThis.__voltDealsMemoryStore;
  }

  const store = buildMemoryStore();
  globalThis.__voltDealsMemoryStore = store;

  return store;
}

function loadDatabaseSync() {
  return (require("node:sqlite") as { DatabaseSync: DatabaseSyncConstructor }).DatabaseSync;
}

function getDatabase() {
  if (globalThis.__voltDealsDatabase) {
    return globalThis.__voltDealsDatabase;
  }

  ensureDatabaseDirectory();
  const DatabaseSync = loadDatabaseSync();
  const database = new DatabaseSync(databasePath);
  initializeSchema(database);
  seedConfig(database);
  migrateLegacyAnalytics(database);
  globalThis.__voltDealsDatabase = database;

  return database;
}

function withStorageFallback<T>(
  sqliteHandler: (database: DatabaseSync) => T,
  memoryHandler: (store: MemoryStore) => T,
) {
  if (getStorageMode() === "memory") {
    return memoryHandler(getMemoryStore());
  }

  try {
    return sqliteHandler(getDatabase());
  } catch {
    setStorageMode("memory");
    return memoryHandler(getMemoryStore());
  }
}

function initializeSchema(database: DatabaseSync) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      ts INTEGER NOT NULL,
      deal_id INTEGER,
      category TEXT,
      shop TEXT,
      sponsored INTEGER,
      sponsor_label TEXT,
      reward_threshold INTEGER,
      origin TEXT,
      tab TEXT,
      variant TEXT,
      transport TEXT
    );

    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profile_snapshots (
      session_id TEXT PRIMARY KEY,
      last_seen_at INTEGER NOT NULL,
      points INTEGER NOT NULL,
      streak INTEGER NOT NULL,
      saved_count INTEGER NOT NULL,
      hot_votes_count INTEGER NOT NULL,
      viewed_count INTEGER NOT NULL,
      experiment_variant TEXT NOT NULL,
      preferences_json TEXT NOT NULL
    );
  `);
}

function seedConfig(database: DatabaseSync) {
  const existing = database
    .prepare<{ total: number }>("SELECT COUNT(*) as total FROM app_config WHERE key = :key")
    .get({ key: "remote-config" });

  if ((existing?.total ?? 0) > 0) {
    return;
  }

  database
    .prepare(
      `
        INSERT INTO app_config (key, value, updated_at)
        VALUES (:key, :value, :updatedAt)
      `,
    )
    .run({
      key: "remote-config",
      value: JSON.stringify(defaultRemoteConfig),
      updatedAt: Date.now(),
    });
}

function migrateLegacyAnalytics(database: DatabaseSync) {
  const hasRows = database
    .prepare<{ total: number }>("SELECT COUNT(*) as total FROM analytics_events")
    .get();

  if ((hasRows?.total ?? 0) > 0 || !existsSync(legacyAnalyticsPath)) {
    return;
  }

  try {
    const raw = readFileSync(legacyAnalyticsPath, "utf8");
    const parsed = JSON.parse(raw) as { events?: AnalyticsEvent[] };
    const insertStatement = database.prepare(
      `
        INSERT OR IGNORE INTO analytics_events (
          id, name, ts, deal_id, category, shop, sponsored, sponsor_label,
          reward_threshold, origin, tab, variant, transport
        ) VALUES (
          :id, :name, :ts, :dealId, :category, :shop, :sponsored, :sponsorLabel,
          :rewardThreshold, :origin, :tab, :variant, :transport
        )
      `,
    );

    for (const event of parsed.events ?? []) {
      insertStatement.run({
        id: event.id,
        name: event.name,
        ts: event.ts,
        dealId: event.dealId ?? null,
        category: event.category ?? null,
        shop: event.shop ?? null,
        sponsored: event.sponsored ? 1 : 0,
        sponsorLabel: event.sponsorLabel ?? null,
        rewardThreshold: event.rewardThreshold ?? null,
        origin: event.origin ?? null,
        tab: event.tab ?? null,
        variant: event.variant ?? null,
        transport: event.transport ?? null,
      });
    }
  } catch {
    // Ignore malformed legacy imports and continue with a clean database.
  }
}

function mapEventRow(row: {
  id: string;
  name: AnalyticsEvent["name"];
  ts: number;
  deal_id: number | null;
  category: string | null;
  shop: string | null;
  sponsored: number | null;
  sponsor_label: AnalyticsEvent["sponsorLabel"] | null;
  reward_threshold: number | null;
  origin: AnalyticsEvent["origin"] | null;
  tab: AnalyticsEvent["tab"] | null;
  variant: AnalyticsEvent["variant"] | null;
  transport: AnalyticsEvent["transport"] | null;
}): AnalyticsEvent {
  return {
    id: row.id,
    name: row.name,
    ts: row.ts,
    dealId: row.deal_id ?? undefined,
    category: row.category ?? undefined,
    shop: row.shop ?? undefined,
    sponsored: Boolean(row.sponsored),
    sponsorLabel: row.sponsor_label ?? undefined,
    rewardThreshold: row.reward_threshold ?? undefined,
    origin: row.origin ?? undefined,
    tab: row.tab ?? undefined,
    variant: row.variant ?? undefined,
    transport: row.transport ?? undefined,
  };
}

export function listAnalyticsEvents(limit = 2000) {
  return withStorageFallback(
    (database) => {
      const rows = database
        .prepare<{
          id: string;
          name: AnalyticsEvent["name"];
          ts: number;
          deal_id: number | null;
          category: string | null;
          shop: string | null;
          sponsored: number | null;
          sponsor_label: AnalyticsEvent["sponsorLabel"] | null;
          reward_threshold: number | null;
          origin: AnalyticsEvent["origin"] | null;
          tab: AnalyticsEvent["tab"] | null;
          variant: AnalyticsEvent["variant"] | null;
          transport: AnalyticsEvent["transport"] | null;
        }>(
          `
            SELECT
              id, name, ts, deal_id, category, shop, sponsored, sponsor_label,
              reward_threshold, origin, tab, variant, transport
            FROM analytics_events
            ORDER BY ts ASC
            LIMIT :limit
          `,
        )
        .all({ limit });

      return rows.map(mapEventRow);
    },
    (store) => store.events.slice(-limit),
  );
}

export function insertAnalyticsEvent(event: AnalyticsEvent) {
  withStorageFallback(
    (database) => {
      database
        .prepare(
          `
            INSERT OR IGNORE INTO analytics_events (
              id, name, ts, deal_id, category, shop, sponsored, sponsor_label,
              reward_threshold, origin, tab, variant, transport
            ) VALUES (
              :id, :name, :ts, :dealId, :category, :shop, :sponsored, :sponsorLabel,
              :rewardThreshold, :origin, :tab, :variant, :transport
            )
          `,
        )
        .run({
          id: event.id,
          name: event.name,
          ts: event.ts,
          dealId: event.dealId ?? null,
          category: event.category ?? null,
          shop: event.shop ?? null,
          sponsored: event.sponsored ? 1 : 0,
          sponsorLabel: event.sponsorLabel ?? null,
          rewardThreshold: event.rewardThreshold ?? null,
          origin: event.origin ?? null,
          tab: event.tab ?? null,
          variant: event.variant ?? null,
          transport: event.transport ?? null,
        });
    },
    (store) => {
      if (!store.events.some((existingEvent) => existingEvent.id === event.id)) {
        store.events.push(event);
      }
    },
  );
}

export function readRemoteConfigFromDatabase() {
  return withStorageFallback(
    (database) => {
      const row = database
        .prepare<ConfigRow>("SELECT value FROM app_config WHERE key = :key LIMIT 1")
        .get({ key: "remote-config" });

      if (!row?.value) {
        return defaultRemoteConfig;
      }

      try {
        return JSON.parse(row.value) as RemoteConfig;
      } catch {
        return defaultRemoteConfig;
      }
    },
    (store) => store.config,
  );
}

export function writeRemoteConfigToDatabase(config: RemoteConfig) {
  withStorageFallback(
    (database) => {
      database
        .prepare(
          `
            INSERT INTO app_config (key, value, updated_at)
            VALUES (:key, :value, :updatedAt)
            ON CONFLICT(key) DO UPDATE SET
              value = excluded.value,
              updated_at = excluded.updated_at
          `,
        )
        .run({
          key: "remote-config",
          value: JSON.stringify(config),
          updatedAt: Date.now(),
        });
    },
    (store) => {
      store.config = config;
    },
  );

  return config;
}

export function upsertProfileSnapshot(snapshot: ServerProfileSnapshot) {
  withStorageFallback(
    (database) => {
      database
        .prepare(
          `
            INSERT INTO profile_snapshots (
              session_id, last_seen_at, points, streak, saved_count, hot_votes_count,
              viewed_count, experiment_variant, preferences_json
            ) VALUES (
              :sessionId, :lastSeenAt, :points, :streak, :savedCount, :hotVotesCount,
              :viewedCount, :experimentVariant, :preferencesJson
            )
            ON CONFLICT(session_id) DO UPDATE SET
              last_seen_at = excluded.last_seen_at,
              points = excluded.points,
              streak = excluded.streak,
              saved_count = excluded.saved_count,
              hot_votes_count = excluded.hot_votes_count,
              viewed_count = excluded.viewed_count,
              experiment_variant = excluded.experiment_variant,
              preferences_json = excluded.preferences_json
          `,
        )
        .run({
          sessionId: snapshot.sessionId,
          lastSeenAt: snapshot.lastSeenAt,
          points: snapshot.points,
          streak: snapshot.streak,
          savedCount: snapshot.savedCount,
          hotVotesCount: snapshot.hotVotesCount,
          viewedCount: snapshot.viewedCount,
          experimentVariant: snapshot.experimentVariant,
          preferencesJson: JSON.stringify(snapshot.preferences),
        });
    },
    (store) => {
      store.profiles[snapshot.sessionId] = snapshot;
    },
  );
}

export function readProfileSnapshot(sessionId: string) {
  return withStorageFallback(
    (database) => {
      const row = database
        .prepare<ProfileRow>(
          `
            SELECT
              session_id, last_seen_at, points, streak, saved_count, hot_votes_count,
              viewed_count, experiment_variant, preferences_json
            FROM profile_snapshots
            WHERE session_id = :sessionId
            LIMIT 1
          `,
        )
        .get({ sessionId });

      if (!row) {
        return null;
      }

      return {
        sessionId: row.session_id,
        lastSeenAt: row.last_seen_at,
        points: row.points,
        streak: row.streak,
        savedCount: row.saved_count,
        hotVotesCount: row.hot_votes_count,
        viewedCount: row.viewed_count,
        experimentVariant: row.experiment_variant,
        preferences: JSON.parse(row.preferences_json) as ServerProfileSnapshot["preferences"],
      } satisfies ServerProfileSnapshot;
    },
    (store) => store.profiles[sessionId] ?? null,
  );
}
