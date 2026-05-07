export type DataSource = "dummyjson" | "mock";

export type AppTab = "feed" | "trending" | "rewards" | "profile";

export type SponsoredShop = "NeonTech" | "SneakerVault" | "HomeHackz";

export type RewardTier = {
  threshold: number;
  title: string;
  subtitle: string;
  sponsor: SponsoredShop;
  accent: string;
  glow: string;
};

export type Deal = {
  id: number;
  title: string;
  description: string;
  image: string | null;
  artwork: string;
  currentPrice: number;
  oldPrice: number;
  discountPercent: number;
  rating: number;
  stock: number;
  dealScore: number;
  category: string;
  shop: string;
  isSponsored: boolean;
  sponsorLabel?: SponsoredShop;
  aiSummary: string;
  saves: number;
  views: number;
  popularity: number;
  timeDropMinutes: number;
  tag: string;
  accentPrimary: string;
  accentSecondary: string;
  heatLevel: "warm" | "hot" | "wild";
  personalizationBoost?: number;
  personalizationReason?: string;
};
