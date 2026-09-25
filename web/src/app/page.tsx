import Link from "next/link";
import { marketStats, formatUsd } from "@/lib/orders";
import { ORDER_COUNT, PROTOCOL, TOKEN_SYMBOL } from "@/lib/constants";

export default function HomePage() {
  const stats = marketStats();

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">{PROTOCOL} · Bitcoin L1</p>
        <h1>Covenant tokens. Open orders. Bitcoin settlement.</h1>
        <p>
          CRC lists {ORDER_COUNT.toLocaleString()} deterministic sell orders for{" "}
          {TOKEN_SYMBOL}. Each order carries a USD reference from $500 to
          $30,000 and clears in BTC using a live exchange rate.
        </p>
        <div className="cta-row">
          <Link className="btn btn-primary" href="/market">
            Open market
          </Link>
          <Link className="btn btn-ghost" href="/about">
            How CRC-20 works
          </Link>
        </div>
      </section>

      <dl className="metrics">
        <div className="metric">
          <dt>Open orders</dt>
          <dd>{stats.catalogSize.toLocaleString()}</dd>
        </div>
        <div className="metric">
          <dt>Floor</dt>
          <dd>{formatUsd(stats.floorUsd)}</dd>
        </div>
        <div className="metric">
          <dt>High</dt>
          <dd>{formatUsd(stats.highUsd)}</dd>
        </div>
        <div className="metric">
          <dt>Average</dt>
          <dd>{formatUsd(stats.avgUsd)}</dd>
        </div>
      </dl>

      <section className="section">
        <h2>Built for CRC-20 discovery.</h2>
        <p className="section-lead">
          Browse the order book, inspect amount and USD reference, then settle
          the quoted BTC amount to the CRC treasury on Bitcoin mainnet. No
          wrapped assets — settlement stays on L1.
        </p>
        <div className="grid-2">
          <article className="panel">
            <h3>Order book</h3>
            <p className="section-lead" style={{ marginBottom: 0 }}>
              One thousand randomly distributed sell lots across the $500–
              $30,000 band. Order IDs are stable: CRC-0001 through CRC-1000.
            </p>
          </article>
          <article className="panel">
            <h3>Live BTC quote</h3>
            <p className="section-lead" style={{ marginBottom: 0 }}>
              USD is a reference only. Payable size is recomputed from
              mempool.space / Coinbase spot every minute before you send.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
