import { ArrowUpRight, Bookmark, Flame, Layers2, SlidersHorizontal, Trophy } from "lucide-react";
import { AnalyticsPanel } from "@/components/analytics-panel";
import type { AnalyticsSummary } from "@/lib/analytics";
import { formatCompactNumber } from "@/lib/utils";
import type { Deal, RewardTier } from "@/types/deal";
import type {
  CTAExperimentVariant,
  ServerProfileSnapshot,
  ServerAnalyticsSnapshot,
  UserPreferences,
} from "@/types/prototype";

type ProfileScreenProps = {
  points: number;
  streak: number;
  deals: Deal[];
  viewedCount: number;
  savedCount: number;
  hotVotesCount: number;
  unlockedRewards: RewardTier[];
  featuredDeal: Deal | null;
  onJumpToDeal: (dealId: number) => void;
  analyticsSummary: AnalyticsSummary;
  experimentVariant: CTAExperimentVariant;
  preferences: UserPreferences;
  serverProfile: ServerProfileSnapshot | null;
  serverSnapshot: ServerAnalyticsSnapshot | null;
  lastSyncedAt: number | null;
};

function findFavoriteCategory(deals: Deal[]) {
  const categoryCount = new Map<string, number>();

  deals.forEach((deal) => {
    categoryCount.set(deal.category, (categoryCount.get(deal.category) ?? 0) + 1);
  });

  return [...categoryCount.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "Tech";
}

function summarizePreferences(preferences: UserPreferences) {
  const rows = [];

  rows.push(
    preferences.shoppingMode === "balanced"
      ? "Balanced mode"
      : preferences.shoppingMode === "deals-first"
        ? "Deals first"
        : "Premium first",
  );
  rows.push(
    preferences.pricePreference === "all"
      ? "All prices"
      : preferences.pricePreference === "budget"
        ? "Budget bias"
        : "Premium bias",
  );

  if (preferences.favoriteCategories[0]) {
    rows.push(preferences.favoriteCategories[0]);
  }

  if (preferences.favoriteSponsors[0]) {
    rows.push(preferences.favoriteSponsors[0]);
  }

  if (preferences.sponsoredOnly) {
    rows.push("Sponsored focus");
  }

  return rows;
}

export function ProfileScreen({
  points,
  streak,
  deals,
  viewedCount,
  savedCount,
  hotVotesCount,
  unlockedRewards,
  featuredDeal,
  onJumpToDeal,
  analyticsSummary,
  experimentVariant,
  preferences,
  serverProfile,
  serverSnapshot,
  lastSyncedAt,
}: ProfileScreenProps) {
  const favoriteCategory = findFavoriteCategory(deals.slice(0, Math.max(savedCount, 6)));
  const communityRank = points >= 50 ? "Insider" : points >= 25 ? "Scout" : "Rookie";
  const preferenceSummary = summarizePreferences(preferences);

  return (
    <div className="no-scrollbar h-full overflow-y-auto px-4 pb-10">
      <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04)_44%,rgba(7,7,10,0.96)_100%)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/10 bg-[linear-gradient(145deg,rgba(58,167,255,0.24),rgba(215,255,87,0.18))] font-display text-2xl font-semibold text-white">
              V
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">
                Demo profile
              </p>
              <h2 className="mt-1 font-display text-[30px] leading-none font-semibold text-white">
                Volt Member
              </h2>
              <p className="mt-2 text-sm text-white/60">
                {communityRank} tier - {streak} day streak - {unlockedRewards.length} rewards live
              </p>
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/42">Points</p>
            <p className="mt-2 font-display text-3xl font-semibold text-lime">{points}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
            <div className="flex items-center gap-2 text-white/54">
              <Layers2 className="h-4 w-4 text-blue" />
              <span className="text-xs uppercase tracking-[0.24em]">Viewed deals</span>
            </div>
            <p className="mt-3 font-display text-3xl font-semibold text-white">{viewedCount}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
            <div className="flex items-center gap-2 text-white/54">
              <Bookmark className="h-4 w-4 text-lime" />
              <span className="text-xs uppercase tracking-[0.24em]">Saved deals</span>
            </div>
            <p className="mt-3 font-display text-3xl font-semibold text-white">{savedCount}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
            <div className="flex items-center gap-2 text-white/54">
              <Flame className="h-4 w-4 text-orange" />
              <span className="text-xs uppercase tracking-[0.24em]">Hot votes</span>
            </div>
            <p className="mt-3 font-display text-3xl font-semibold text-white">{hotVotesCount}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
            <div className="flex items-center gap-2 text-white/54">
              <Trophy className="h-4 w-4 text-blue" />
              <span className="text-xs uppercase tracking-[0.24em]">Favorite lane</span>
            </div>
            <p className="mt-3 text-lg font-semibold text-white">{favoriteCategory}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[30px] border border-white/10 bg-white/6 p-5">
        <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">Session pulse</p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-white/58">Projected intent score</p>
            <p className="mt-2 font-display text-[34px] font-semibold text-white">
              {formatCompactNumber(points * 182)}
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/68">
            Based on profile demo stats
          </div>
        </div>
        <div className="mt-5 space-y-3">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-white/46">
              <span>Reward momentum</span>
              <span>{unlockedRewards.length}/3 unlocked</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#3AA7FF_0%,#D7FF57_60%,#FF7A18_100%)]"
                style={{ width: `${Math.min((points / 100) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-white/46">
              <span>Save behavior</span>
              <span>{savedCount} kept for later</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#D7FF57_0%,#3AA7FF_100%)]"
                style={{ width: `${Math.min(savedCount * 12, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[30px] border border-white/10 bg-white/6 p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <SlidersHorizontal className="h-4 w-4 text-blue" />
          Taste profile
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {preferenceSummary.map((entry) => (
            <div
              className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/72"
              key={entry}
            >
              {entry}
            </div>
          ))}
        </div>
        {serverSnapshot?.topCategories.length ? (
          <p className="mt-4 text-sm leading-6 text-white/56">
            Server-side category pull currently leans toward{" "}
            <span className="text-white">{serverSnapshot.topCategories.join(" - ")}</span>.
          </p>
        ) : null}
      </div>

      <div className="mt-5 rounded-[30px] border border-white/10 bg-white/6 p-5">
        <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">Server sync</p>
        {serverProfile ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Server points</p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">
                {serverProfile.points}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Last sync</p>
              <p className="mt-2 text-sm text-white/74">
                {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString("de-DE") : "Pending"}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Saved on server</p>
              <p className="mt-2 text-lg font-semibold text-white">{serverProfile.savedCount}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Session ID</p>
              <p className="mt-2 truncate text-sm text-white/74">{serverProfile.sessionId}</p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-white/52">
            Waiting for the first profile sync.
          </p>
        )}
      </div>

      {featuredDeal ? (
        <div className="mt-5 rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,122,24,0.12),rgba(58,167,255,0.1)_52%,rgba(7,7,10,0.92)_100%)] p-5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">Best next action</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <h3 className="font-display text-[28px] leading-none font-semibold text-white">
                Resume your strongest match
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                {featuredDeal.title} is currently the best personalized continuation for this
                session.
              </p>
            </div>
            <button
              className="shrink-0 rounded-[20px] bg-[linear-gradient(120deg,#D7FF57_0%,#3AA7FF_100%)] px-4 py-3 text-sm font-semibold text-black"
              onClick={() => onJumpToDeal(featuredDeal.id)}
              type="button"
            >
              <span className="flex items-center gap-2">
                Continue
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      ) : null}

      <AnalyticsPanel
        deals={deals}
        serverSnapshot={serverSnapshot}
        summary={analyticsSummary}
        variant={experimentVariant}
      />
    </div>
  );
}
