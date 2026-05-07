import { Layers3 } from "lucide-react";
import { DealFeed } from "@/components/deal-feed";
import type { DataSource, Deal } from "@/types/deal";
import type { CTAExperimentVariant, SponsoredCampaign } from "@/types/prototype";

type FeedScreenProps = {
  deals: Deal[];
  dataSource: DataSource;
  activeDealId: number;
  focusDealId: number | null;
  savedIds: number[];
  hotVotedIds: number[];
  ctaVariant: CTAExperimentVariant;
  campaign: SponsoredCampaign | null;
  onActiveDealChange: (dealId: number) => void;
  onSaveDeal: (dealId: number) => void;
  onShareDeal: (dealId: number) => void;
  onHotVoteDeal: (dealId: number) => void;
  onOpenDeal: (dealId: number) => void;
};

export function FeedScreen({
  deals,
  dataSource,
  activeDealId,
  focusDealId,
  savedIds,
  hotVotedIds,
  ctaVariant,
  campaign,
  onActiveDealChange,
  onSaveDeal,
  onShareDeal,
  onHotVoteDeal,
  onOpenDeal,
}: FeedScreenProps) {
  const statusLabel =
    dataSource === "dummyjson"
      ? `${deals.length} curated deals live`
      : "Running curated local demo deals";

  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-4">
      <div className="mb-3 flex min-w-0 items-center gap-2 px-1 text-[11px] text-white/52">
        <Layers3 className="h-3.5 w-3.5 shrink-0 text-blue" />
        <span className="truncate">{statusLabel}</span>
        {campaign ? <span className="shrink-0 text-white/28">·</span> : null}
        {campaign ? <span className="truncate">Sponsored by {campaign.sponsor}</span> : null}
      </div>
      <div className="min-h-0 flex-1">
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
