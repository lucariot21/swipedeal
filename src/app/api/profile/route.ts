import { NextResponse } from "next/server";
import { readProfileSnapshot, upsertProfileSnapshot } from "@/lib/sqlite-db";
import type { ServerProfileSnapshot } from "@/types/prototype";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const snapshot = readProfileSnapshot(sessionId);

  return NextResponse.json(snapshot);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ServerProfileSnapshot;

  if (!payload?.sessionId || !payload?.preferences || !payload?.experimentVariant) {
    return NextResponse.json({ error: "Invalid profile snapshot" }, { status: 400 });
  }

  upsertProfileSnapshot(payload);

  return NextResponse.json({
    ok: true,
    lastSeenAt: payload.lastSeenAt,
  });
}
