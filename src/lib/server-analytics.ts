import { insertAnalyticsEvent, listAnalyticsEvents } from "@/lib/sqlite-db";
import type { AnalyticsEvent, ServerAnalyticsSnapshot } from "@/types/prototype";

export function readAnalyticsStore() {
  return {
    events: listAnalyticsEvents(),
  };
}

export function appendAnalyticsEvent(event: AnalyticsEvent) {
  insertAnalyticsEvent(event);

  return readAnalyticsStore();
}

export function buildServerAnalyticsSnapshot(events: AnalyticsEvent[]): ServerAnalyticsSnapshot {
  const totalEvents = events.length;
  const lastEventAt = events.at(-1)?.ts ?? null;
  const categories = new Map<string, number>();

  events.forEach((event) => {
    if (!event.category) {
      return;
    }

    categories.set(event.category, (categories.get(event.category) ?? 0) + 1);
  });

  const topCategories = [...categories.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([category]) => category);

  const variants = ["momentum", "social-proof"] as const;
  const variantPerformance = variants.map((variant) => {
    const views = events.filter(
      (event) => event.variant === variant && event.name === "deal_view",
    ).length;
    const clicks = events.filter(
      (event) => event.variant === variant && event.name === "cta_click",
    ).length;

    return {
      variant,
      views,
      clicks,
      ctr: Number(((clicks / Math.max(views, 1)) * 100).toFixed(1)),
    };
  });

  const sponsorClicks = events.filter(
    (event) => event.name === "cta_click" && event.sponsored,
  ).length;
  const totalClicks = events.filter((event) => event.name === "cta_click").length;

  return {
    totalEvents,
    lastEventAt,
    topCategories,
    variantPerformance,
    sponsorClickShare: Number(((sponsorClicks / Math.max(totalClicks, 1)) * 100).toFixed(1)),
  };
}
