# Volt Deals Prototype

Premium mobile-first Next.js prototype for a vertical full-screen deal feed. The app is built as a pitch artifact: strong dark UI, clear sponsored labeling, lightweight gamification, fast CTA hierarchy and a centered phone preview on desktop.

## What is included

- Full-screen vertical deal feed with scroll snap
- Feed, Trending, Rewards and Profile screens
- Points loop with streak, reward ladder and unlock modal
- Sponsored deals for NeonTech, SneakerVault and HomeHackz
- DummyJSON product ingestion with curated mapping and local mock fallback
- Personalized ranking based on views, saves, hot votes and CTA clicks
- Local event analytics and CTA experiment tracking
- PWA install prompt, manifest, icons and offline shell service worker
- Local persistence for points, saves, hot votes, viewed deals and experiment state
- Lightweight local analytics API with server-side event aggregation
- Preference sheet for shopping mode, price bias, category pins and sponsor affinity
- Real Web Share / clipboard fallback and demo outbound handoff pages
- Remote-config style sponsor campaign simulation via `/api/config`
- Tailwind CSS v4, TypeScript, Framer Motion and reusable component structure

## Assumptions

- Pitch mode starts at `24` points so the first reward can unlock almost immediately during a demo.
- Prices are shown in `EUR` formatting to fit the intended presentation context, while raw numeric values still come from DummyJSON.
- The live API data is visually curated into categories that fit the premium commerce pitch better.
- CTA actions are simulated only. No payment, no login and no real reward redemption flow exists.
- User state is stored locally in `localStorage` and mirrored into a lightweight local SQLite prototype backend.
- The CTA experiment is intentionally deterministic per browser/device profile to keep the variant stable in a local prototype.
- The prototype backend uses `node:sqlite`, so a current Node.js version with built-in SQLite support is expected.
- The config API is a local simulation layer and can be replaced by a real remote-config system later.

## Installation

```bash
npm install
```

Recommended runtime: `Node.js 22+` so the built-in `node:sqlite` backend is available locally.

## Local start

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Production build

```bash
npm run build
npm run start
```

## DummyJSON note

- Live product data is loaded from `https://dummyjson.com/products`.
- If DummyJSON is unavailable, the app automatically falls back to a local curated mock set so the prototype still works.
- The feed sorts the generated deals by a custom hotness signal based on discount, rating, stock and social proof.
- After load, the client personalizes the ranking further based on local interaction signals.
- Personalization is also steered by explicit user preferences from the in-app tuning sheet.

## Mobile testing

- Open Chrome DevTools
- Toggle Device Toolbar
- Use a viewport close to `390 x 844`
- Scroll the feed in full-screen mode to test snap behavior, point gains and reward unlocks
- Save, hot-vote and open deals to see the personalized ranking and profile analytics update
- Trigger Chrome's install flow to test the PWA prompt and home-screen behavior
- Toggle offline mode in DevTools to test the cached shell and `/offline` fallback
- Open CTA handoffs and share actions to verify the outbound demo routes and Web Share fallback

## Persistence and analytics

- Local app state persists across refreshes:
  points, streak, saves, hot votes, viewed deals, install state, experiment variant and user preferences
- Interaction events are tracked locally:
  deal views, saves, hot votes, shares, CTA clicks, reward unlocks, deep-link jumps and PWA install events
- The profile screen contains a small conversion lab panel to support pitch conversations around funnel hypotheses
- Local development stores synced analytics events, remote config and profile snapshots in `data/volt-deals.sqlite`
- Vercel deployments automatically switch to an in-memory demo backend so the prototype remains shareable without depending on unsupported persistent SQLite storage
- If a legacy `data/analytics-events.json` file exists, the app imports it once into SQLite on first access
- `GET /api/analytics?summary=1` exposes an aggregated server snapshot used by the profile screen

## Local APIs

- `GET /api/config`
  returns the local sponsor campaign and experiment configuration
- `POST /api/config`
  updates the local remote-config simulation inside SQLite
- `POST /api/analytics`
  stores a single analytics event on the local prototype backend
- `GET /api/analytics?summary=1`
  returns aggregated event totals, variant CTR and top categories
- `GET /api/profile?sessionId=...`
  returns the latest synced server-side snapshot for the current browser session
- `POST /api/profile`
  upserts points, streak and preference state into the local SQLite profile table

## PWA notes

- A web manifest is exposed at `/manifest.webmanifest`
- Dynamic app icons are generated via Next.js metadata routes
- A lightweight service worker caches the shell for stronger demo resilience
- Best tested in Chrome or Edge where `beforeinstallprompt` is available
- Navigation failures fall back to `/offline`
- Demo affiliate handoffs open under `/out/[dealId]`

## Deployment

Deploy directly to [Vercel](https://vercel.com?utm_source=chatgpt.com).

Recommended flow:

1. Push the project to a Git repository
2. Import the repository into Vercel
3. Keep the default Next.js build settings
4. Deploy

Vercel note:

- This repo is prepared for Vercel previews and production sharing.
- Local development uses SQLite.
- Vercel automatically falls back to ephemeral in-memory demo persistence for analytics, config and profile sync.
- That means the shared online demo works well for showcasing, but server-side event/profile data can reset between cold starts or deployments.

## Architecture

- `src/app`
  App Router entry, API routes, metadata routes, offline/outbound pages, global theme and loading state
- `src/components`
  Reusable UI building blocks plus screen-level compositions
- `src/lib`
  Deal generation, API fallback logic, persistence, analytics, personalization, remote config and utilities
- `src/types`
  Shared TypeScript types for deals, rewards and navigation state
- `data`
  local SQLite database for analytics events, remote config and synced profile snapshots

## Core components

- `DealFeed`
- `DealCard`
- `PointsCounter`
- `RewardModal`
- `BottomNav`
- `DealScoreBadge`
- `SponsoredBadge`
- `TrendingList`
- `RewardCard`
- `PhoneFrame`
