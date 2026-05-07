import { PrototypeApp } from "@/components/prototype-app";
import { getDeals } from "@/lib/deals";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { deals, source } = await getDeals();

  return <PrototypeApp initialDeals={deals} dataSource={source} />;
}
