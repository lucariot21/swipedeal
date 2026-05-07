"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  SlidersHorizontal,
  WifiOff,
  Zap,
} from "lucide-react";
import { startTransition, useEffect, useRef, useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { DealTransitionOverlay } from "@/components/deal-transition-overlay";
import { InstallPrompt } from "@/components/install-prompt";
import { PhoneFrame } from "@/components/phone-frame";
import { PointsCounter } from "@/components/points-counter";
import { PreferencesSheet } from "@/components/preferences-sheet";
import { RewardModal } from "@/components/reward-modal";
import { FeedScreen } from "@/components/screens/feed-screen";
import { ProfileScreen } from "@/components/screens/profile-screen";
import { RewardsScreen } from "@/components/screens/rewards-screen";
import { TrendingScreen } from "@/components/screens/trending-screen";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { Toast } from "@/components/toast";
import { summarizeAnalytics } from "@/lib/analytics";
import {
  fetchProfileSnapshot,
  fetchRemoteConfig,
  fetchServerAnalyticsSnapshot,
  syncProfileSnapshot,
  syncAnalyticsEvent,
} from "@/lib/client-analytics";
import { rewardTiers } from "@/lib/deals";
import { triggerHaptic } from "@/lib/haptics";
import { personalizeDeals } from "@/lib/personalization";
import { buildDefaultPreferences, updatePrototypeState, usePrototypeState } from "@/lib/prototype-store";
import { defaultRemoteConfig } from "@/lib/remote-config";
import { formatPrice } from "@/lib/utils";
import type { AppTab, DataSource, Deal, RewardTier } from "@/types/deal";
import type {
  AnalyticsEvent,
  DealJumpOrigin,
  RemoteConfig,
  ServerAnalyticsSnapshot,
  ServerProfileSnapshot,
  SponsoredCampaign,
} from "@/types/prototype";

type PrototypeAppProps = {
  initialDeals: Deal[];
  dataSource: DataSource;
};

type TransitionDealState = {
  deal: Deal;
  origin: DealJumpOrigin;
};

const screenTransition = {
  initial: { opacity: 0, y: 14, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.985 },
  transition: { duration: 0.34, ease: "easeOut" },
} as const;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
}

function resolveStreak(lastViewDate: string, currentStreak: number) {
  const today = todayKey();

  if (lastViewDate === today) {
    return currentStreak;
  }

  return lastViewDate === yesterdayKey() ? currentStreak + 1 : 1;
}

function createEvent(
  name: AnalyticsEvent["name"],
  deal: Deal | null,
  extras: Omit<Partial<AnalyticsEvent>, "id" | "name" | "ts" | "dealId"> = {},
) {
  return {
    id: `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    ts: Date.now(),
    dealId: deal?.id,
    category: deal?.category,
    shop: deal?.shop,
    sponsored: deal?.isSponsored,
    sponsorLabel: deal?.sponsorLabel,
    ...extras,
  } satisfies AnalyticsEvent;
}

function appendEvent(events: AnalyticsEvent[], event: AnalyticsEvent) {
  return [...events, event].slice(-250);
}

function buildFeedQueue(
  nextDeals: Deal[],
  previousOrder: number[],
  activeDealId: number,
  preserveHistory: boolean,
) {
  if (!preserveHistory) {
    return nextDeals;
  }

  const dealsById = new Map(nextDeals.map((deal) => [deal.id, deal]));
  const previousDeals = previousOrder
    .map((dealId) => dealsById.get(dealId))
    .filter((deal): deal is Deal => Boolean(deal));

  if (previousDeals.length !== nextDeals.length) {
    return nextDeals;
  }

  const anchorIndex = previousDeals.findIndex((deal) => deal.id === activeDealId);

  if (anchorIndex < 0) {
    return nextDeals;
  }

  const lockedPrefix = previousDeals.slice(0, anchorIndex + 1);
  const lockedIds = new Set(lockedPrefix.map((deal) => deal.id));

  return [...lockedPrefix, ...nextDeals.filter((deal) => !lockedIds.has(deal.id))];
}

function buildAvailableCategories(deals: Deal[]) {
  return [...new Set(deals.map((deal) => deal.category))].sort();
}

export function PrototypeApp({ initialDeals, dataSource }: PrototypeAppProps) {
  const persistedState = usePrototypeState();
  const [activeTab, setActiveTab] = useState<AppTab>("feed");
  const [activeDealId, setActiveDealId] = useState(initialDeals[0]?.id ?? 0);
  const [feedOrderIds, setFeedOrderIds] = useState<number[]>(() =>
    initialDeals.map((deal) => deal.id),
  );
  const [pulseKey, setPulseKey] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeReward, setActiveReward] = useState<RewardTier | null>(null);
  const [focusDealId, setFocusDealId] = useState<number | null>(null);
  const [transitionDeal, setTransitionDeal] = useState<TransitionDealState | null>(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [remoteConfig, setRemoteConfig] = useState<RemoteConfig>(defaultRemoteConfig);
  const [serverSnapshot, setServerSnapshot] = useState<ServerAnalyticsSnapshot | null>(null);
  const [serverProfile, setServerProfile] = useState<ServerProfileSnapshot | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const timerRef = useRef<number[]>([]);
  const syncTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      timerRef.current.forEach((timer) => window.clearTimeout(timer));
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    void fetchRemoteConfig().then(setRemoteConfig);
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined") {
      return;
    }

    const syncOnlineState = () => setIsOffline(!navigator.onLine);

    syncOnlineState();
    window.addEventListener("online", syncOnlineState);
    window.addEventListener("offline", syncOnlineState);

    return () => {
      window.removeEventListener("online", syncOnlineState);
      window.removeEventListener("offline", syncOnlineState);
    };
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToastMessage(null);
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setFeedOrderIds((currentOrder) => {
        const nextPersonalizedDeals = personalizeDeals(
          initialDeals,
          persistedState,
          remoteConfig,
        );
        const nextOrder = buildFeedQueue(
          nextPersonalizedDeals,
          currentOrder,
          activeDealId,
          activeTab === "feed",
        ).map((deal) => deal.id);

        return currentOrder.join("|") === nextOrder.join("|") ? currentOrder : nextOrder;
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeDealId, activeTab, initialDeals, persistedState, remoteConfig]);

  useEffect(() => {
    if (syncTimerRef.current) {
      window.clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = window.setTimeout(() => {
      void fetchServerAnalyticsSnapshot()
        .then(setServerSnapshot)
        .catch(() => undefined);
    }, 260);

    return () => {
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }
    };
  }, [persistedState.analyticsEvents.length]);

  useEffect(() => {
    if (!persistedState.sessionId) {
      return;
    }

    void fetchProfileSnapshot(persistedState.sessionId)
      .then((snapshot) => {
        if (snapshot) {
          setServerProfile(snapshot);
        }
      })
      .catch(() => undefined);
  }, [persistedState.sessionId]);

  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
      const snapshot: ServerProfileSnapshot = {
        sessionId: persistedState.sessionId,
        lastSeenAt: Date.now(),
        points: persistedState.points,
        streak: persistedState.streak,
        savedCount: persistedState.savedIds.length,
        hotVotesCount: persistedState.hotVotedIds.length,
        viewedCount: persistedState.viewedIds.length,
        experimentVariant: persistedState.experimentVariant,
        preferences: persistedState.preferences,
      };

      void syncProfileSnapshot(snapshot)
        .then((response) => {
          setServerProfile(snapshot);
          updatePrototypeState((state) => ({
            ...state,
            lastSyncedAt: response.lastSeenAt,
          }));
        })
        .catch(() => undefined);
    }, 280);

    return () => window.clearTimeout(syncTimer);
  }, [
    persistedState.sessionId,
    persistedState.points,
    persistedState.streak,
    persistedState.savedIds.length,
    persistedState.hotVotedIds.length,
    persistedState.viewedIds.length,
    persistedState.experimentVariant,
    persistedState.preferences,
  ]);

  const nextReward = rewardTiers.find((reward) => persistedState.points < reward.threshold);
  const unlockedRewards = rewardTiers.filter(
    (reward) => persistedState.points >= reward.threshold,
  );
  const personalizedDeals = personalizeDeals(initialDeals, persistedState, remoteConfig);
  const feedDealsById = new Map<number, Deal>(
    personalizedDeals.map((deal) => [deal.id, deal]),
  );
  const orderedFeedDeals = feedOrderIds
    .map((dealId) => feedDealsById.get(dealId))
    .filter((deal): deal is Deal => Boolean(deal));
  const seenFeedIds = new Set(orderedFeedDeals.map((deal) => deal.id));
  const feedDeals = [
    ...orderedFeedDeals,
    ...personalizedDeals.filter((deal) => !seenFeedIds.has(deal.id)),
  ];
  const analyticsSummary = summarizeAnalytics(persistedState);
  const savedDeals = personalizedDeals.filter((deal) =>
    persistedState.savedIds.includes(deal.id),
  );
  const featuredDeal =
    personalizedDeals.find((deal) => deal.id !== activeDealId) ?? personalizedDeals[0] ?? null;
  const rewardLinkedDeals = rewardTiers.map((reward) => ({
    reward,
    deal:
      personalizedDeals.find(
        (deal) => deal.sponsorLabel === reward.sponsor || deal.shop === reward.sponsor,
      ) ?? null,
  }));
  const availableCategories = buildAvailableCategories(initialDeals);

  function showToast(message: string) {
    setToastMessage(message);
  }

  function syncEvents(events: AnalyticsEvent[]) {
    events.forEach(syncAnalyticsEvent);
  }

  function findDeal(dealId: number) {
    return (
      personalizedDeals.find((deal) => deal.id === dealId) ??
      initialDeals.find((deal) => deal.id === dealId) ??
      null
    );
  }

  function matchCampaignDeal(campaign: SponsoredCampaign | null) {
    if (!campaign) {
      return null;
    }

    return (
      personalizedDeals.find(
        (deal) =>
          (deal.sponsorLabel === campaign.sponsor || deal.shop === campaign.sponsor) &&
          (!campaign.featuredCategory || deal.category === campaign.featuredCategory),
      ) ??
      personalizedDeals.find(
        (deal) => deal.sponsorLabel === campaign.sponsor || deal.shop === campaign.sponsor,
      ) ??
      null
    );
  }

  const currentCampaign =
    remoteConfig.sponsoredCampaigns.find((campaign) => campaign.targetTab === activeTab) ??
    remoteConfig.sponsoredCampaigns[0] ??
    null;

  function buildOutboundUrl(deal: Deal) {
    const url = new URL(
      `${remoteConfig.experiments.outboundBasePath}/${deal.id}`,
      window.location.origin,
    );

    url.searchParams.set("title", deal.title);
    url.searchParams.set("shop", deal.shop);
    url.searchParams.set("price", formatPrice(deal.currentPrice));
    url.searchParams.set("discount", `-${deal.discountPercent.toFixed(0)}%`);
    url.searchParams.set("sponsor", deal.sponsorLabel ?? "Organic");

    return url.toString();
  }

  function trackOnly(event: AnalyticsEvent) {
    updatePrototypeState((state) => ({
      ...state,
      analyticsEvents: appendEvent(state.analyticsEvents, event),
    }));
    syncEvents([event]);
  }

  function changeTab(tab: AppTab) {
    startTransition(() => {
      setActiveTab(tab);
    });
    trackOnly(
      createEvent("tab_change", null, {
        tab,
        variant: persistedState.experimentVariant,
        transport: "local",
      }),
    );
  }

  function handleActiveDealChange(dealId: number) {
    setActiveDealId(dealId);

    if (persistedState.viewedIds.includes(dealId)) {
      return;
    }

    const deal = findDeal(dealId);

    if (!deal) {
      return;
    }

    triggerHaptic(10);
    const viewEvent = createEvent("deal_view", deal, {
      variant: persistedState.experimentVariant,
      transport: "local",
    });
    const rewardEvent =
      persistedState.points + 1 >= (nextReward?.threshold ?? Number.POSITIVE_INFINITY) && nextReward
        ? createEvent("reward_unlock", deal, {
            rewardThreshold: nextReward.threshold,
            variant: persistedState.experimentVariant,
            transport: "local",
          })
        : null;

    updatePrototypeState((state) => ({
      ...state,
      points: state.points + 1,
      streak: resolveStreak(state.lastViewDate, state.streak),
      lastViewDate: todayKey(),
      viewedIds: [...state.viewedIds, dealId],
      analyticsEvents: appendEvent(
        rewardEvent ? appendEvent(state.analyticsEvents, viewEvent) : state.analyticsEvents,
        rewardEvent ?? viewEvent,
      ),
    }));

    syncEvents(rewardEvent ? [viewEvent, rewardEvent] : [viewEvent]);
    setPulseKey((current) => current + 1);

    if (rewardEvent && nextReward) {
      triggerHaptic([18, 20, 18]);
      setActiveReward(nextReward);
      showToast(`${nextReward.title} unlocked.`);
    }
  }

  function toggleSavedDeal(dealId: number) {
    const deal = findDeal(dealId);

    if (!deal) {
      return;
    }

    const exists = persistedState.savedIds.includes(dealId);
    const event = createEvent(exists ? "deal_unsave" : "deal_save", deal, {
      variant: persistedState.experimentVariant,
      transport: "local",
    });

    updatePrototypeState((state) => ({
      ...state,
      savedIds: exists
        ? state.savedIds.filter((id) => id !== dealId)
        : [...state.savedIds, dealId],
      analyticsEvents: appendEvent(state.analyticsEvents, event),
    }));

    syncEvents([event]);
    triggerHaptic(exists ? 10 : [14, 10]);
    showToast(exists ? "Deal removed from saves." : "Deal saved for later.");
  }

  function toggleHotVote(dealId: number) {
    const deal = findDeal(dealId);

    if (!deal) {
      return;
    }

    const exists = persistedState.hotVotedIds.includes(dealId);
    const event = createEvent(exists ? "deal_unhot" : "deal_hot", deal, {
      variant: persistedState.experimentVariant,
      transport: "local",
    });

    updatePrototypeState((state) => ({
      ...state,
      hotVotedIds: exists
        ? state.hotVotedIds.filter((id) => id !== dealId)
        : [...state.hotVotedIds, dealId],
      analyticsEvents: appendEvent(state.analyticsEvents, event),
    }));

    syncEvents([event]);
    triggerHaptic(exists ? 10 : [18, 12]);
    showToast(exists ? "Hot vote removed." : "Hot vote added to momentum.");
  }

  async function shareDeal(dealId: number) {
    const deal = findDeal(dealId);

    if (!deal) {
      return;
    }

    const shareUrl = buildOutboundUrl(deal);
    const browserNavigator = window.navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
      clipboard?: Clipboard;
    };
    let transport: AnalyticsEvent["transport"] = "local";

    try {
      if (typeof window !== "undefined" && browserNavigator.share) {
        await browserNavigator.share({
          title: deal.title,
          text: `Hot deal at ${deal.shop} - ${deal.discountPercent.toFixed(0)}% off`,
          url: shareUrl,
        });
        transport = "web-share";
        showToast("Native share sheet opened.");
      } else if (browserNavigator.clipboard?.writeText) {
        await browserNavigator.clipboard.writeText(shareUrl);
        transport = "clipboard";
        showToast("Deal link copied to clipboard.");
      } else {
        window.open(shareUrl, "_blank", "noopener,noreferrer");
        transport = "deep-link";
        showToast("Share fallback opened in a new tab.");
      }

      triggerHaptic(12);
      const event = createEvent("deal_share", deal, {
        variant: persistedState.experimentVariant,
        transport,
      });
      trackOnly(event);
    } catch {
      showToast("Share flow was closed before sending.");
    }
  }

  function openDeal(dealId: number) {
    const deal = findDeal(dealId);

    if (!deal) {
      return;
    }

    const event = createEvent("cta_click", deal, {
      variant: persistedState.experimentVariant,
      transport: "deep-link",
    });

    triggerHaptic([16, 24, 12]);
    trackOnly(event);

    const outboundUrl = buildOutboundUrl(deal);
    const target = remoteConfig.experiments.ctaOpenMode === "same-tab" ? "_self" : "_blank";

    window.open(outboundUrl, target, "noopener,noreferrer");
    showToast(
      target === "_blank"
        ? "Demo partner handoff opened in a new tab."
        : "Demo partner handoff opened.",
    );
  }

  function jumpToDeal(dealId: number, origin: DealJumpOrigin) {
    const deal = findDeal(dealId);

    if (!deal) {
      return;
    }

    timerRef.current.forEach((timer) => window.clearTimeout(timer));
    timerRef.current = [];
    triggerHaptic([10, 18, 10]);
    trackOnly(
      createEvent("deep_link_jump", deal, {
        origin,
        variant: persistedState.experimentVariant,
        transport: "deep-link",
      }),
    );
    setTransitionDeal({ deal, origin });

    timerRef.current.push(
      window.setTimeout(() => {
        setFocusDealId(dealId);
        changeTab("feed");
      }, 150),
    );
    timerRef.current.push(
      window.setTimeout(() => {
        setTransitionDeal(null);
      }, 760),
    );
    timerRef.current.push(
      window.setTimeout(() => {
        setFocusDealId(null);
      }, 1100),
    );
  }

  function openCampaign(campaign: SponsoredCampaign | null) {
    const matchedDeal = matchCampaignDeal(campaign);

    if (matchedDeal) {
      jumpToDeal(matchedDeal.id, "campaign");
      return;
    }

    if (campaign) {
      changeTab(campaign.targetTab);
      showToast(`${campaign.sponsor} campaign moved to the front.`);
    }
  }

  function updatePreferences(nextPreferences: typeof persistedState.preferences) {
    updatePrototypeState((state) => ({
      ...state,
      preferences: nextPreferences,
    }));
  }

  function resetPreferences() {
    updatePreferences(buildDefaultPreferences());
    showToast("Feed tuning reset to balanced discovery.");
  }

  function markInstallDismissed() {
    triggerHaptic(10);
    const event = createEvent("install_dismiss", null, {
      variant: persistedState.experimentVariant,
      transport: "local",
    });

    updatePrototypeState((state) => ({
      ...state,
      installDismissedAt: Date.now(),
      analyticsEvents: appendEvent(state.analyticsEvents, event),
    }));

    syncEvents([event]);
  }

  function markInstallPromptShown() {
    trackOnly(
      createEvent("install_prompt_shown", null, {
        variant: persistedState.experimentVariant,
        transport: "beacon",
      }),
    );
  }

  function markInstallClicked() {
    triggerHaptic([12, 18, 8]);
    trackOnly(
      createEvent("install_click", null, {
        variant: persistedState.experimentVariant,
        transport: "beacon",
      }),
    );
  }

  function markInstallAccepted() {
    triggerHaptic([16, 20, 16]);
    const event = createEvent("install_success", null, {
      variant: persistedState.experimentVariant,
      transport: "beacon",
    });

    updatePrototypeState((state) => ({
      ...state,
      installedAt: Date.now(),
      analyticsEvents: appendEvent(state.analyticsEvents, event),
    }));

    syncEvents([event]);
    showToast("Volt Deals installed for faster relaunch.");
  }

  return (
    <PhoneFrame>
      <div className="relative flex h-full flex-col overflow-hidden">
        <ServiceWorkerRegistration />
        <div className="ambient-grid pointer-events-none absolute inset-0 opacity-[0.16]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(58,167,255,0.12),transparent_58%)]" />

        <div className="relative z-20 shrink-0 border-b border-white/8 bg-black/22 px-4 pb-2.5 pt-[max(env(safe-area-inset-top),0.8rem)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 overflow-hidden">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[15px] border border-white/8 bg-white/[0.04]">
                <Zap className="h-4.5 w-4.5 text-lime" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/38">Volt Deals</p>
                <p className="truncate font-display text-[18px] font-semibold text-white">
                  Swipe Feed
                </p>
              </div>
            </div>
            <button
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-white/76"
              onClick={() => setIsPreferencesOpen(true)}
              type="button"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          {isOffline ? (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-orange/18 bg-orange/10 px-3 py-1.5 text-[11px] text-orange">
              <WifiOff className="h-4 w-4" />
              <span>Offline shell active.</span>
            </div>
          ) : null}

          <div className="mt-2.5">
            <PointsCounter
              nextReward={nextReward}
              points={persistedState.points}
              pulseKey={pulseKey}
              streak={persistedState.streak}
            />
          </div>
        </div>

        <div className="relative z-10 min-h-0 flex-1">
          <AnimatePresence initial={false} mode="wait">
            {activeTab === "feed" ? (
              <motion.div className="h-full" key="feed" {...screenTransition}>
                <FeedScreen
                  activeDealId={activeDealId}
                  campaign={currentCampaign?.targetTab === "feed" ? currentCampaign : null}
                  ctaVariant={persistedState.experimentVariant}
                  dataSource={dataSource}
                  deals={feedDeals}
                  focusDealId={focusDealId}
                  hotVotedIds={persistedState.hotVotedIds}
                  onActiveDealChange={handleActiveDealChange}
                  onHotVoteDeal={toggleHotVote}
                  onOpenDeal={openDeal}
                  onSaveDeal={toggleSavedDeal}
                  onShareDeal={shareDeal}
                  savedIds={persistedState.savedIds}
                />
              </motion.div>
            ) : null}

            {activeTab === "trending" ? (
              <motion.div className="h-full" key="trending" {...screenTransition}>
                <TrendingScreen
                  campaign={currentCampaign?.targetTab === "trending" ? currentCampaign : null}
                  deals={personalizedDeals}
                  onOpenCampaign={() => openCampaign(currentCampaign)}
                  onWatchDeal={(dealId) => jumpToDeal(dealId, "trending")}
                />
              </motion.div>
            ) : null}

            {activeTab === "rewards" ? (
              <motion.div className="h-full" key="rewards" {...screenTransition}>
                <RewardsScreen
                  campaign={currentCampaign?.targetTab === "rewards" ? currentCampaign : null}
                  linkedDeals={rewardLinkedDeals}
                  onInspectReward={setActiveReward}
                  onOpenCampaign={() => openCampaign(currentCampaign)}
                  onWatchDeal={(dealId) => jumpToDeal(dealId, "rewards")}
                  points={persistedState.points}
                  rewardTiers={rewardTiers}
                />
              </motion.div>
            ) : null}

            {activeTab === "profile" ? (
              <motion.div className="h-full" key="profile" {...screenTransition}>
                <ProfileScreen
                  analyticsSummary={analyticsSummary}
                  deals={savedDeals.length > 0 ? savedDeals : personalizedDeals}
                  experimentVariant={persistedState.experimentVariant}
                  featuredDeal={featuredDeal}
                  hotVotesCount={persistedState.hotVotedIds.length}
                  lastSyncedAt={persistedState.lastSyncedAt}
                  onJumpToDeal={(dealId) => jumpToDeal(dealId, "profile")}
                  points={persistedState.points}
                  preferences={persistedState.preferences}
                  savedCount={persistedState.savedIds.length}
                  serverProfile={serverProfile}
                  serverSnapshot={serverSnapshot}
                  streak={persistedState.streak}
                  unlockedRewards={unlockedRewards}
                  viewedCount={persistedState.viewedIds.length}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {remoteConfig.experiments.installPromptEnabled &&
        process.env.NEXT_PUBLIC_ENABLE_PWA === "1" ? (
          <InstallPrompt
            dismissedAt={persistedState.installDismissedAt}
            installedAt={persistedState.installedAt}
            onDismiss={markInstallDismissed}
            onInstallAccepted={markInstallAccepted}
            onInstallClicked={markInstallClicked}
            onPromptShown={markInstallPromptShown}
          />
        ) : null}

        <div className="relative z-20 shrink-0 border-t border-white/8 bg-black/18 px-3 pb-[max(env(safe-area-inset-bottom),0.9rem)] pt-3 backdrop-blur-xl">
          <BottomNav
            activeTab={activeTab}
            onChange={changeTab}
            unlockedRewardsCount={unlockedRewards.length}
          />
        </div>

        <PreferencesSheet
          availableCategories={availableCategories}
          isOpen={isPreferencesOpen}
          onChange={updatePreferences}
          onClose={() => setIsPreferencesOpen(false)}
          onReset={resetPreferences}
          preferences={persistedState.preferences}
        />
        <Toast message={toastMessage} />
        <RewardModal onClose={() => setActiveReward(null)} reward={activeReward} />
        <DealTransitionOverlay
          deal={transitionDeal?.deal ?? null}
          origin={transitionDeal?.origin ?? null}
        />
      </div>
    </PhoneFrame>
  );
}
