import { NextResponse } from "next/server";
import { listOrders, marketStats } from "@/lib/orders";

export const dynamic = "force-dynamic";

function optionalNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function optionalInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = listOrders({
    page: optionalInt(searchParams.get("page")),
    pageSize: optionalInt(searchParams.get("pageSize")),
    minUsd: optionalNumber(searchParams.get("minUsd")),
    maxUsd: optionalNumber(searchParams.get("maxUsd")),
    query: searchParams.get("query") || undefined,
  });

  return NextResponse.json({
    ...result,
    stats: marketStats(),
  });
}
