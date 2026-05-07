import type { AppTab, SponsoredShop } from "@/types/deal";

export type CTAExperimentVariant = "momentum" | "social-proof";

export type DealJumpOrigin = "trending" | "rewards" | "profile" | "campaign";

export type PricePreference = "all" | "budget" | "premium";

export type ShoppingMode = "balanced" | "deals-first" | "premium-first";

export type UserPreferences = {
  pricePreference: PricePreference;
  shoppingMode: ShoppingMode;
  favoriteCategories: string[];
  favoriteSponsors: SponsoredShop[];
  sponsoredOnly: boolean;
};

export type AnalyticsEventName =
  | "deal_view"
  | "deal_save"
  | "deal_unsave"
  | "deal_hot"
  | "deal_unhot"
  | "deal_share"
  | "cta_click"
  | "tab_change"
  | "reward_unlock"
  | "install_prompt_shown"
  | "install_click"
  | "install_dismiss"
  | "install_success"
  | "deep_link_jump";

export type AnalyticsTransport = "local" | "web-share" | "clipboard" | "deep-link" | "beacon";

export type AnalyticsEvent = {
  id: string;
  name: AnalyticsEventName;
  ts: number;
  dealId?: number;
  category?: string;
  shop?: string;
  sponsored?: boolean;
  sponsorLabel?: SponsoredShop;
  rewardThreshold?: number;
  origin?: DealJumpOrigin;
  tab?: AppTab;
  variant?: CTAExperimentVariant;
  transport?: AnalyticsTransport;
};

export type PrototypePersistedState = {
  sessionId: string;
  points: number;
  streak: number;
  lastViewDate: string;
  savedIds: number[];
  hotVotedIds: number[];
  viewedIds: number[];
  experimentVariant: CTAExperimentVariant;
  analyticsEvents: AnalyticsEvent[];
  installDismissedAt: number | null;
  installedAt: number | null;
  lastSyncedAt: number | null;
  preferences: UserPreferences;
};

export type SponsoredCampaign = {
  id: string;
  sponsor: SponsoredShop;
  headline: string;
  kicker: string;
  ctaLabel: string;
  accent: string;
  glow: string;
  featuredCategory?: string;
  preferredPrice: PricePreference;
  targetTab: AppTab;
};

export type RemoteConfig = {
  experiments: {
    installPromptEnabled: boolean;
    ctaOpenMode: "new-tab" | "same-tab";
    outboundBasePath: string;
  };
  sponsoredCampaigns: SponsoredCampaign[];
  rankingWeights: {
    categoryPreference: number;
    sponsorPreference: number;
    pricePreference: number;
  };
  fetchedAt: string;
};

export type ServerAnalyticsSnapshot = {
  totalEvents: number;
  lastEventAt: number | null;
  topCategories: string[];
  variantPerformance: Array<{
    variant: CTAExperimentVariant;
    views: number;
    clicks: number;
    ctr: number;
  }>;
  sponsorClickShare: number;
};

export type ServerProfileSnapshot = {
  sessionId: string;
  lastSeenAt: number;
  points: number;
  streak: number;
  savedCount: number;
  hotVotesCount: number;
  viewedCount: number;
  experimentVariant: CTAExperimentVariant;
  preferences: UserPreferences;
};
