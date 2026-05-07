import { Gift, ShieldCheck } from "lucide-react";
import { CampaignBanner } from "@/components/campaign-banner";
import { RewardCard } from "@/components/reward-card";
import type { Deal, RewardTier } from "@/types/deal";
import type { SponsoredCampaign } from "@/types/prototype";

type RewardsScreenProps = {
  points: number;
  rewardTiers: RewardTier[];
  onInspectReward: (reward: RewardTier) => void;
  linkedDeals: Array<{
    reward: RewardTier;
    deal: Deal | null;
  }>;
  campaign: SponsoredCampaign | null;
  onOpenCampaign: () => void;
  onWatchDeal: (dealId: number) => void;
};

export function RewardsScreen({
  points,
  rewardTiers,
  onInspectReward,
  linkedDeals,
  campaign,
  onOpenCampaign,
  onWatchDeal,
}: RewardsScreenProps) {
  const unlockedCount = rewardTiers.filter((reward) => points >= reward.threshold).length;

  return (
    <div className="no-scrollbar h-full overflow-y-auto px-4 pb-10">
      {campaign ? (
        <div className="mb-4">
          <CampaignBanner campaign={campaign} onPrimaryAction={onOpenCampaign} />
        </div>
      ) : null}

      <div className="glass-panel rounded-[26px] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-white/60">
              <Gift className="h-3.5 w-3.5 text-lime" />
              Reward ladder
            </div>
            <h2 className="mt-4 font-display text-[30px] leading-none font-semibold text-white">
              Rewards that feel clear, not manipulative.
            </h2>
          </div>
          <div className="rounded-[20px] border border-white/8 bg-white/[0.04] px-4 py-3 text-center">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/42">Unlocked</p>
            <p className="mt-2 font-display text-3xl font-semibold text-lime">{unlockedCount}</p>
          </div>
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-[20px] border border-white/8 bg-black/20 p-4 text-sm leading-6 text-white/62">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue" />
          <p>
            Rewards are simulated on purpose. The loop is visible, the sponsorship is clear,
            and there is no real claim flow or dark pattern in this prototype.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {rewardTiers.map((reward) => (
          <RewardCard
            key={reward.threshold}
            linkedDeal={
              linkedDeals.find((entry) => entry.reward.threshold === reward.threshold)?.deal ?? null
            }
            onInspect={() => onInspectReward(reward)}
            onWatchDeal={onWatchDeal}
            points={points}
            reward={reward}
          />
        ))}
      </div>
    </div>
  );
}
