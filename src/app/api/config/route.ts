import { NextResponse } from "next/server";
import {
  readRemoteConfigFromDatabase,
  writeRemoteConfigToDatabase,
} from "@/lib/sqlite-db";
import type { RemoteConfig } from "@/types/prototype";

export async function GET() {
  return NextResponse.json(readRemoteConfigFromDatabase());
}

export async function POST(request: Request) {
  const payload = (await request.json()) as RemoteConfig;

  if (!payload?.experiments || !payload?.rankingWeights || !payload?.sponsoredCampaigns) {
    return NextResponse.json({ error: "Invalid config payload" }, { status: 400 });
  }

  return NextResponse.json(writeRemoteConfigToDatabase(payload));
}
