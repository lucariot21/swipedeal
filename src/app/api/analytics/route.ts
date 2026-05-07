import { NextResponse } from "next/server";
import {
  appendAnalyticsEvent,
  buildServerAnalyticsSnapshot,
  readAnalyticsStore,
} from "@/lib/server-analytics";
import type { AnalyticsEvent } from "@/types/prototype";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const store = await readAnalyticsStore();

  if (url.searchParams.get("summary") === "1") {
    return NextResponse.json(buildServerAnalyticsSnapshot(store.events));
  }

  return NextResponse.json(store);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as AnalyticsEvent;

  if (!payload?.id || !payload?.name || !payload?.ts) {
    return NextResponse.json({ error: "Invalid analytics event" }, { status: 400 });
  }

  const store = await appendAnalyticsEvent(payload);

  return NextResponse.json({
    ok: true,
    totalEvents: store.events.length,
  });
}
