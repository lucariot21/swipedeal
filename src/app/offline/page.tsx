import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(58,167,255,0.18),transparent_34%),linear-gradient(145deg,#07070A_0%,#0C1220_100%)] px-6 text-white">
      <div className="max-w-md rounded-[32px] border border-white/10 bg-white/6 p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
        <p className="text-[10px] uppercase tracking-[0.32em] text-white/42">Offline mode</p>
        <h1 className="mt-4 font-display text-[38px] leading-none font-semibold text-white">
          Volt Deals is still demo-ready.
        </h1>
        <p className="mt-4 text-sm leading-7 text-white/68">
          The network dropped, but the cached shell is active. Reconnect to sync analytics and
          refresh live deals. Local preferences and session points remain available.
        </p>
        <Link
          className="mt-6 inline-flex rounded-[20px] bg-[linear-gradient(120deg,#D7FF57_0%,#3AA7FF_100%)] px-5 py-3 text-sm font-semibold text-black"
          href="/"
        >
          Back to the app shell
        </Link>
      </div>
    </main>
  );
}
