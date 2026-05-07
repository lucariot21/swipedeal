import { defaultRemoteConfig } from "@/lib/remote-config";
import { calculateDealSignal } from "@/lib/deals";
import { round } from "@/lib/utils";
import type { Deal } from "@/types/deal";
import type { PrototypePersistedState, RemoteConfig } from "@/types/prototype";

function pushWeight(target: Map<string, number>, key: string | undefined, value: number) {
  if (!key) {
    return;
  }

  target.set(key, (target.get(key) ?? 0) + value);
}

function buildReason(
  deal: Deal,
  categoryScore: number,
  shopScore: number,
  sponsorScore: number,
  saved: boolean,
  hot: boolean,
  preferenceReason: string | null,
) {
  if (saved) {
    return `For you: you already saved this ${deal.category.toLowerCase()} drop.`;
  }

  if (hot) {
    return `For you: you hot-voted similar ${deal.shop} energy.`;
  }

  if (preferenceReason) {
    return preferenceReason;
  }

  if (categoryScore >= Math.max(shopScore, sponsorScore) && categoryScore > 1.5) {
    return `For you: your session keeps leaning into ${deal.category.toLowerCase()}.`;
  }

  if (sponsorScore > 1.5 && deal.sponsorLabel) {
    return `For you: ${deal.sponsorLabel} sponsor deals are converting in this session.`;
  }

  if (shopScore > 1.1) {
    return `For you: you respond well to ${deal.shop} style deals.`;
  }

  return "For you: this matches your current browsing momentum.";
}

function pricePreferenceBoost(deal: Deal, mode: PrototypePersistedState["preferences"]["pricePreference"]) {
  if (mode === "all") {
    return { score: 0, reason: null as string | null };
  }

  if (mode === "budget") {
    return deal.currentPrice <= 100
      ? { score: 1.6, reason: "For you: your feed is tuned toward budget wins under 100 EUR." }
      : { score: -0.7, reason: null };
  }

  return deal.currentPrice > 100
    ? { score: 1.8, reason: "For you: premium-first mode is lifting higher-ticket picks." }
    : { score: -0.7, reason: null };
}

function shoppingModeBoost(
  deal: Deal,
  mode: PrototypePersistedState["preferences"]["shoppingMode"],
) {
  if (mode === "deals-first") {
    return deal.discountPercent * 0.18 + deal.dealScore * 0.34;
  }

  if (mode === "premium-first") {
    return deal.rating * 0.78 + deal.currentPrice / 170;
  }

  return deal.popularity * 0.015;
}

export function personalizeDeals(
  deals: Deal[],
  persistedState: PrototypePersistedState,
  remoteConfig: RemoteConfig = defaultRemoteConfig,
): Deal[] {
  const dealsById = new Map(deals.map((deal) => [deal.id, deal]));
  const categoryAffinity = new Map<string, number>();
  const shopAffinity = new Map<string, number>();
  const sponsorAffinity = new Map<string, number>();
  const { preferences } = persistedState;

  persistedState.viewedIds.forEach((dealId) => {
    const deal = dealsById.get(dealId);

    if (!deal) {
      return;
    }

    pushWeight(categoryAffinity, deal.category, 0.35);
    pushWeight(shopAffinity, deal.shop, 0.18);
    pushWeight(sponsorAffinity, deal.sponsorLabel, 0.24);
  });

  persistedState.hotVotedIds.forEach((dealId) => {
    const deal = dealsById.get(dealId);

    if (!deal) {
      return;
    }

    pushWeight(categoryAffinity, deal.category, 1.3);
    pushWeight(shopAffinity, deal.shop, 0.8);
    pushWeight(sponsorAffinity, deal.sponsorLabel, 0.95);
  });

  persistedState.savedIds.forEach((dealId) => {
    const deal = dealsById.get(dealId);

    if (!deal) {
      return;
    }

    pushWeight(categoryAffinity, deal.category, 1.9);
    pushWeight(shopAffinity, deal.shop, 1.1);
    pushWeight(sponsorAffinity, deal.sponsorLabel, 1.25);
  });

  persistedState.analyticsEvents.forEach((event) => {
    if (event.name !== "cta_click") {
      return;
    }

    pushWeight(categoryAffinity, event.category, 1.4);
    pushWeight(shopAffinity, event.shop, 1);
    pushWeight(sponsorAffinity, event.sponsorLabel, 1.45);
  });

  return deals
    .map((deal, index) => {
      const categoryScore = categoryAffinity.get(deal.category) ?? 0;
      const shopScore = shopAffinity.get(deal.shop) ?? 0;
      const sponsorScore = deal.sponsorLabel
        ? (sponsorAffinity.get(deal.sponsorLabel) ?? 0)
        : 0;
      const saved = persistedState.savedIds.includes(deal.id);
      const hot = persistedState.hotVotedIds.includes(deal.id);
      const viewed = persistedState.viewedIds.includes(deal.id);
      const preferenceCategoryBoost = preferences.favoriteCategories.includes(deal.category)
        ? remoteConfig.rankingWeights.categoryPreference
        : 0;
      const preferenceSponsorBoost =
        deal.sponsorLabel && preferences.favoriteSponsors.includes(deal.sponsorLabel)
          ? remoteConfig.rankingWeights.sponsorPreference
          : 0;
      const pricePreference = pricePreferenceBoost(deal, preferences.pricePreference);
      const sponsoredFocusBoost = preferences.sponsoredOnly
        ? deal.isSponsored
          ? 2.8
          : -4.2
        : 0;
      const noveltyBoost = viewed ? (saved || hot ? 0.8 : -0.45) : 1;
      const modeBoost = shoppingModeBoost(deal, preferences.shoppingMode);
      const preferenceReason = preferenceCategoryBoost
        ? `For you: ${deal.category.toLowerCase()} is pinned as a preferred lane.`
        : preferenceSponsorBoost && deal.sponsorLabel
          ? `For you: ${deal.sponsorLabel} is pinned as a preferred sponsor.`
          : pricePreference.reason;
      const personalBoost = round(
        categoryScore * 0.72 +
          shopScore * 0.52 +
          sponsorScore * 0.82 +
          noveltyBoost +
          modeBoost +
          pricePreference.score * remoteConfig.rankingWeights.pricePreference +
          preferenceCategoryBoost +
          preferenceSponsorBoost +
          sponsoredFocusBoost +
          (saved ? 3.8 : 0) +
          (hot ? 2.1 : 0),
        2,
      );

      return {
        ...deal,
        personalizationBoost: personalBoost,
        personalizationReason:
          personalBoost >= 1.5
            ? buildReason(
                deal,
                categoryScore,
                shopScore,
                sponsorScore,
                saved,
                hot,
                preferenceReason,
              )
            : undefined,
        __rank: calculateDealSignal(deal) + personalBoost,
        __seed: index,
      };
    })
    .sort((left, right) => {
      if (right.__rank === left.__rank) {
        return left.__seed - right.__seed;
      }

      return right.__rank - left.__rank;
    })
    .map((deal) => {
      const { __rank, __seed, ...sanitizedDeal } = deal;
      void __rank;
      void __seed;

      return sanitizedDeal as Deal;
    });
}
