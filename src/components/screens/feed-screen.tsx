import { Layers3 } from "lucide-react";
import { CampaignBanner } from "@/components/campaign-banner";
import { DealFeed } from "@/components/deal-feed";
import type { DataSource, Deal } from "@/types/deal";
import type {
  CTAExperimentVariant,
  SponsoredCampaign,
  UserPreferences,
} from "@/types/prototype";

type FeedScreenProps = {
  deals: Deal[];
  dataSource: DataSource;
  activeDealId: number;
  focusDealId: number | null;
  savedIds: number[];
  hotVotedIds: number[];
  ctaVariant: CTAExperimentVariant;
  preferences: UserPreferences;
  campaign: SponsoredCampaign | null;
  onOpenCampaign: () => void;
  onActiveDealChange: (dealId: number) => void;
  onSaveDeal: (dealId: number) => void;
  onShareDeal: (dealId: number) => void;
  onHotVoteDeal: (dealId: number) => void;
  onOpenDeal: (dealId: number) => void;
};

function buildPreferenceLabel(preferences: UserPreferences) {
  const parts: string[] = [];

  if (preferences.shoppingMode !== "balanced") {
    parts.push(preferences.shoppingMode === "deals-first" ? "Deals first" : "Premium first");
  }

  if (preferences.pricePreference !== "all") {
    parts.push(preferences.pricePreference === "budget" ? "Budget bias" : "Premium bias");
  }

  if (preferences.favoriteCategories.length > 0) {
    parts.push(preferences.favoriteCategories[0]);
  }

  if (preferences.favoriteSponsors.length > 0) {
    parts.push(preferences.favoriteSponsors[0]);
  }

  if (preferences.sponsoredOnly) {
    parts.push("Sponsored focus");
  }

  return parts.length > 0 ? parts.join(" - ") : "Balanced discovery";
}

export function FeedScreen({
  deals,
  dataSource,
  activeDealId,
  focusDealId,
  savedIds,
  hotVotedIds,
  ctaVariant,
  preferences,
  campaign,
  onOpenCampaign,
  onActiveDealChange,
  onSaveDeal,
  onShareDeal,
  onHotVoteDeal,
  onOpenDeal,
}: FeedScreenProps) {
  return (
    <div className="relative h-full">
      <div className="px-4 pb-2 pt-1">
        {campaign ? (
          <div className="mb-3">
            <CampaignBanner campaign={campaign} onPrimaryAction={onOpenCampaign} />
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[11px] text-white/66">
            <Layers3 className="h-3.5 w-3.5 text-blue" />
            <span>
              {dataSource === "dummyjson"
                ? `Live curated from DummyJSON - ${deals.length} premium-fit deals`
                : "DummyJSON unavailable - running polished local mock deals"}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-lime/18 bg-lime/10 px-3 py-2 text-[11px] text-lime">
            <span>
              For-you ranking live - CTA{" "}
              {ctaVariant === "momentum" ? "Momentum" : "Social Proof"}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-white/62">
            <span>{buildPreferenceLabel(preferences)}</span>
          </div>
        </div>
      </div>
      <div className={`absolute inset-x-0 bottom-0 ${campaign ? "top-[178px]" : "top-10"}`}>
        <DealFeed
          activeDealId={activeDealId}
          ctaVariant={ctaVariant}
          deals={deals}
          focusDealId={focusDealId}
          hotVotedIds={hotVotedIds}
          onActiveDealChange={onActiveDealChange}
          onHotVoteDeal={onHotVoteDeal}
          onOpenDeal={onOpenDeal}
          onSaveDeal={onSaveDeal}
          onShareDeal={onShareDeal}
          savedIds={savedIds}
        />
      </div>
    </div>
  );
}
