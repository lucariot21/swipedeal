import { round } from "@/lib/utils";
import type { Deal } from "@/types/deal";
import type {
  AnalyticsEvent,
  CTAExperimentVariant,
  PrototypePersistedState,
} from "@/types/prototype";

export type AnalyticsSummary = {
  views: number;
  ctaClicks: number;
  ctaCtr: number;
  saveActions: number;
  hotActions: number;
  shareActions: number;
  sponsorClicks: number;
  sponsorCtr: number;
  rewardUnlocks: number;
  topResponsiveCategory: string;
  hypothesis: string;
  recentEvents: AnalyticsEvent[];
  variant: CTAExperimentVariant;
};

function buildTopCategory(events: AnalyticsEvent[]) {
  const categoryScore = new Map<string, number>();

  events.forEach((event) => {
    if (!event.category) {
      return;
    }

    const weight = event.name === "cta_click" ? 3 : event.name === "deal_save" ? 2 : 1;
    categoryScore.set(event.category, (categoryScore.get(event.category) ?? 0) + weight);
  });

  return [...categoryScore.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ??
    "No clear favorite yet";
}

function buildHypothesis(
  summary: Pick<
    AnalyticsSummary,
    "ctaCtr" | "sponsorCtr" | "saveActions" | "views" | "topResponsiveCategory" | "variant"
  >,
) {
  if (summary.ctaCtr >= 28) {
    return `${summary.variant === "momentum" ? "Momentum" : "Social proof"} CTA is landing. Lean harder into ${summary.topResponsiveCategory.toLowerCase()} inventory.`;
  }

  if (summary.sponsorCtr >= summary.ctaCtr) {
    return `Sponsored relevance is strong. Pair more ${summary.topResponsiveCategory.toLowerCase()} drops with premium sponsor framing.`;
  }

  if (summary.saveActions >= Math.max(2, Math.floor(summary.views * 0.25))) {
    return `Users are hesitating less than they are bouncing. Add price-history context to push saved deals into clicks.`;
  }

  return `Top of funnel is healthy, but CTA friction remains. Test a proof-heavy CTA treatment on ${summary.topResponsiveCategory.toLowerCase()} deals next.`;
}

export function summarizeAnalytics(persistedState: PrototypePersistedState): AnalyticsSummary {
  const recentEvents = [...persistedState.analyticsEvents].slice(-6).reverse();
  const views = persistedState.analyticsEvents.filter((event) => event.name === "deal_view").length;
  const ctaClicks = persistedState.analyticsEvents.filter((event) => event.name === "cta_click")
    .length;
  const sponsorClicks = persistedState.analyticsEvents.filter(
    (event) => event.name === "cta_click" && event.sponsored,
  ).length;
  const sponsorViews = persistedState.analyticsEvents.filter(
    (event) => event.name === "deal_view" && event.sponsored,
  ).length;
  const saveActions = persistedState.analyticsEvents.filter((event) => event.name === "deal_save")
    .length;
  const hotActions = persistedState.analyticsEvents.filter((event) => event.name === "deal_hot")
    .length;
  const shareActions = persistedState.analyticsEvents.filter(
    (event) => event.name === "deal_share",
  ).length;
  const rewardUnlocks = persistedState.analyticsEvents.filter(
    (event) => event.name === "reward_unlock",
  ).length;
  const ctaCtr = round((ctaClicks / Math.max(views, 1)) * 100, 1);
  const sponsorCtr = round((sponsorClicks / Math.max(sponsorViews, 1)) * 100, 1);
  const topResponsiveCategory = buildTopCategory(
    persistedState.analyticsEvents.filter((event) => Boolean(event.category)),
  );
  const variant = persistedState.experimentVariant;
  const summary = {
    views,
    ctaClicks,
    ctaCtr,
    saveActions,
    hotActions,
    shareActions,
    sponsorClicks,
    sponsorCtr,
    rewardUnlocks,
    topResponsiveCategory,
    recentEvents,
    variant,
    hypothesis: "",
  } satisfies AnalyticsSummary;

  return {
    ...summary,
    hypothesis: buildHypothesis(summary),
  };
}

export function buildEventLabel(event: AnalyticsEvent, deals: Deal[]) {
  const deal = event.dealId ? deals.find((entry) => entry.id === event.dealId) : null;
  const dealLabel = deal?.title ?? event.category ?? event.tab ?? "session";

  switch (event.name) {
    case "cta_click":
      return `CTA clicked on ${dealLabel}`;
    case "deal_save":
      return `Saved ${dealLabel}`;
    case "deal_hot":
      return `Hot-voted ${dealLabel}`;
    case "deal_share":
      return `Shared ${dealLabel}`;
    case "reward_unlock":
      return `Unlocked reward at ${event.rewardThreshold} pts`;
    case "install_success":
      return "App installed successfully";
    case "deep_link_jump":
      return `Jumped from ${event.origin} to ${dealLabel}`;
    case "tab_change":
      return `Opened ${dealLabel}`;
    default:
      return `Viewed ${dealLabel}`;
  }
}
