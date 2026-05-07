import Link from "next/link";

type OutboundPageProps = {
  params: Promise<{
    dealId: string;
  }>;
  searchParams: Promise<{
    title?: string;
    shop?: string;
    price?: string;
    discount?: string;
    sponsor?: string;
  }>;
};

export default async function OutboundPage({
  params,
  searchParams,
}: OutboundPageProps) {
  const { dealId } = await params;
  const query = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,122,24,0.16),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(58,167,255,0.16),transparent_26%),linear-gradient(145deg,#07070A_0%,#0C1220_100%)] px-6 text-white">
      <div className="max-w-lg rounded-[34px] border border-white/10 bg-white/6 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
        <p className="text-[10px] uppercase tracking-[0.32em] text-white/42">Demo handoff</p>
        <h1 className="mt-4 font-display text-[42px] leading-none font-semibold text-white">
          Affiliate transition simulated.
        </h1>
        <p className="mt-4 text-sm leading-7 text-white/68">
          In production this screen would be replaced by a tracked affiliate redirect or a deep
          partner handoff. For the prototype, it keeps the flow visible without leaving the local
          demo.
        </p>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-5">
          <p className="text-sm font-semibold text-white">{query.title ?? `Deal ${dealId}`}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/72">
            <div className="rounded-[18px] border border-white/10 bg-white/6 p-3">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Shop</p>
              <p className="mt-2">{query.shop ?? "Partner flow"}</p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/6 p-3">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Price</p>
              <p className="mt-2">{query.price ?? "Demo price"}</p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/6 p-3">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Discount</p>
              <p className="mt-2">{query.discount ?? "Offer"}</p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/6 p-3">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">Sponsor</p>
              <p className="mt-2">{query.sponsor ?? "Organic"}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="rounded-[20px] bg-[linear-gradient(120deg,#D7FF57_0%,#3AA7FF_100%)] px-5 py-3 text-sm font-semibold text-black"
            href="/"
          >
            Back to Volt Deals
          </Link>
          <Link
            className="rounded-[20px] border border-white/10 bg-white/8 px-5 py-3 text-sm font-medium text-white/78"
            href="/offline"
          >
            Inspect offline shell
          </Link>
        </div>
      </div>
    </main>
  );
}
