import type { RemoteConfig } from "@/types/prototype";

export const defaultRemoteConfig: RemoteConfig = {
  experiments: {
    installPromptEnabled: true,
    ctaOpenMode: "new-tab",
    outboundBasePath: "/out",
  },
  sponsoredCampaigns: [
    {
      id: "neontech-charge-week",
      sponsor: "NeonTech",
      headline: "NeonTech Charge Week",
      kicker: "Compact tech upgrades under 100 EUR are converting best on mobile.",
      ctaLabel: "Jump to NeonTech",
      accent: "#3AA7FF",
      glow: "#D7FF57",
      featuredCategory: "Mobile Accessories",
      preferredPrice: "budget",
      targetTab: "feed",
    },
    {
      id: "sneakervault-heat-drop",
      sponsor: "SneakerVault",
      headline: "SneakerVault Heat Drop",
      kicker: "Style-led energy with hotter CTR when social proof is visible.",
      ctaLabel: "Watch the drop",
      accent: "#FF7A18",
      glow: "#D7FF57",
      featuredCategory: "Mens Shoes",
      preferredPrice: "premium",
      targetTab: "trending",
    },
    {
      id: "homehackz-space-upgrade",
      sponsor: "HomeHackz",
      headline: "HomeHackz Space Upgrade",
      kicker: "Home utility and visual payoff lift save-intent for slower buyers.",
      ctaLabel: "See the reward lane",
      accent: "#61D6FF",
      glow: "#FF7A18",
      featuredCategory: "Home Decoration",
      preferredPrice: "all",
      targetTab: "rewards",
    },
  ],
  rankingWeights: {
    categoryPreference: 2.3,
    sponsorPreference: 2.7,
    pricePreference: 1.5,
  },
  fetchedAt: new Date("2026-05-07T09:00:00.000Z").toISOString(),
};
