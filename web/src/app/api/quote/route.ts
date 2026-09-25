import { NextResponse } from "next/server";
import { quoteUsdInBtc } from "@/lib/bitcoin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const quote = await quoteUsdInBtc(1);
    return NextResponse.json({
      usdPerBtc: quote.usdPerBtc,
      fetchedAt: quote.fetchedAt,
      source: quote.source,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "quote unavailable",
      },
      { status: 502 },
    );
  }
}
