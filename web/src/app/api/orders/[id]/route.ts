import { NextResponse } from "next/server";
import { getOrder, parseOrderId } from "@/lib/orders";
import { quoteUsdInBtc } from "@/lib/bitcoin";
import { TREASURY_ADDRESS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const ordinal = parseOrderId(id);
  if (ordinal == null) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  const order = getOrder(ordinal);
  const quote = await quoteUsdInBtc(order.priceUsd).catch(() => null);

  return NextResponse.json({
    order,
    quote,
    treasuryAddress: TREASURY_ADDRESS,
  });
}
