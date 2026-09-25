import Link from "next/link";
import { notFound } from "next/navigation";
import { TREASURY_ADDRESS } from "@/lib/constants";
import { formatBtc, formatSats, quoteUsdInBtc } from "@/lib/bitcoin";
import {
  formatTokenAmount,
  formatUsd,
  getOrder,
  parseOrderId,
} from "@/lib/orders";
import { SettleWithWallet } from "@/components/SettleWithWallet";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ordinal = parseOrderId(id);
  if (ordinal == null) notFound();

  const order = getOrder(ordinal);
  const quote = await quoteUsdInBtc(order.priceUsd).catch(() => null);

  return (
    <main className="section">
      <Link href="/market" className="eyebrow">
        ← Order book
      </Link>
      <h2 style={{ marginTop: "0.8rem" }}>{order.id}</h2>
      <p className="section-lead">
        Sell {formatTokenAmount(order.amount)} CRC · USD reference{" "}
        {formatUsd(order.priceUsd)}. Connect any Bitcoin wallet and transfer the
        live BTC amount to settle this lot on L1.
      </p>

      <div className="grid-2">
        <article className="panel">
          <h3>Listing</h3>
          <div className="kv">
            <div className="kv-row">
              <span>Token</span>
              <strong>CRC</strong>
            </div>
            <div className="kv-row">
              <span>Amount</span>
              <strong>{formatTokenAmount(order.amount)} CRC</strong>
            </div>
            <div className="kv-row">
              <span>USD reference</span>
              <strong>{formatUsd(order.priceUsd)}</strong>
            </div>
            <div className="kv-row">
              <span>Side</span>
              <strong>SELL</strong>
            </div>
            <div className="kv-row">
              <span>Status</span>
              <strong>OPEN</strong>
            </div>
          </div>
        </article>

        <article className="panel">
          <h3>Bitcoin settlement</h3>
          <div className="kv">
            <div className="kv-row">
              <span>Pay</span>
              <strong>
                {quote ? formatBtc(quote.amountBtc) : "Quote pending"}
              </strong>
            </div>
            <div className="kv-row">
              <span>Sats</span>
              <strong>{quote ? formatSats(quote.amountSats) : "—"}</strong>
            </div>
            <div className="kv-row">
              <span>Spot</span>
              <strong>
                {quote
                  ? `${formatUsd(quote.usdPerBtc)} · ${quote.source}`
                  : "refreshing"}
              </strong>
            </div>
          </div>
          <p className="section-lead" style={{ marginTop: "1rem" }}>
            Connect a Bitcoin wallet, then confirm the transfer to the CRC
            treasury:
          </p>
          <SettleWithWallet
            orderId={order.id}
            treasuryAddress={TREASURY_ADDRESS}
            amountSats={quote?.amountSats ?? null}
            amountBtc={quote?.amountBtc ?? null}
          />
        </article>
      </div>
    </main>
  );
}
