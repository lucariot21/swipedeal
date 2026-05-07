"use client";

import { useEffect, useRef, useState } from "react";
import { Download, ShieldCheck, WifiOff, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

type InstallPromptProps = {
  dismissedAt: number | null;
  installedAt: number | null;
  onPromptShown: () => void;
  onDismiss: () => void;
  onInstallAccepted: () => void;
  onInstallClicked: () => void;
};

export function InstallPrompt({
  dismissedAt,
  installedAt,
  onPromptShown,
  onDismiss,
  onInstallAccepted,
  onInstallClicked,
}: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const shownRef = useRef(false);
  const isStandalone =
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);

      if (!shownRef.current) {
        shownRef.current = true;
        onPromptShown();
      }
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      onInstallAccepted();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [onInstallAccepted, onPromptShown]);

  if (isStandalone || installedAt || dismissedAt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="glass-panel absolute inset-x-3 bottom-[90px] z-30 rounded-[28px] px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-lime/18 bg-lime/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-lime">
            <Download className="h-3.5 w-3.5" />
            Install app
          </div>
          <h3 className="mt-3 font-display text-2xl font-semibold text-white">
            Put Volt Deals on the home screen.
          </h3>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/58">
            <span className="rounded-full bg-white/8 px-3 py-1">Offline shell</span>
            <span className="rounded-full bg-white/8 px-3 py-1">Faster launch</span>
            <span className="rounded-full bg-white/8 px-3 py-1">Native feel</span>
          </div>
        </div>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white/68"
          onClick={onDismiss}
          type="button"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/58">
        <div className="rounded-[22px] border border-white/10 bg-black/20 px-3 py-3">
          <ShieldCheck className="mb-2 h-4 w-4 text-blue" />
          Add-to-home-screen polish with browser-native install.
        </div>
        <div className="rounded-[22px] border border-white/10 bg-black/20 px-3 py-3">
          <WifiOff className="mb-2 h-4 w-4 text-orange" />
          Offline shell caching for a stronger pitch demo.
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          className="flex-1 rounded-[20px] bg-[linear-gradient(120deg,#D7FF57_0%,#3AA7FF_100%)] px-4 py-3 text-sm font-semibold text-black"
          onClick={async () => {
            onInstallClicked();
            await deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;

            if (choice.outcome === "accepted") {
              onInstallAccepted();
              setDeferredPrompt(null);
            }
          }}
          type="button"
        >
          Install now
        </button>
        <button
          className="rounded-[20px] border border-white/10 bg-white/8 px-4 py-3 text-sm font-medium text-white/72"
          onClick={onDismiss}
          type="button"
        >
          Later
        </button>
      </div>
    </div>
  );
}
