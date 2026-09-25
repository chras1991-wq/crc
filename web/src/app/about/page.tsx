import { PROTOCOL, TOKEN_NAME, TOKEN_SYMBOL, TREASURY_ADDRESS } from "@/lib/constants";

export default function AboutPage() {
  return (
    <main className="section">
      <p className="eyebrow">{PROTOCOL}</p>
      <h2>CRC-20 on Bitcoin.</h2>
      <p className="section-lead">
        CRC-20 is a covenant-oriented token convention on Bitcoin L1. {TOKEN_NAME}{" "}
        ({TOKEN_SYMBOL}) trades here as open sell orders that settle in native
        BTC — not as a custodial IOU.
      </p>

      <div className="grid-2">
        <article className="panel">
          <h3>Market rules</h3>
          <div className="kv">
            <div className="kv-row">
              <span>Catalog</span>
              <strong>1,000 sell orders</strong>
            </div>
            <div className="kv-row">
              <span>USD band</span>
              <strong>$500 – $30,000</strong>
            </div>
            <div className="kv-row">
              <span>Pricing</span>
              <strong>Live BTC/USD</strong>
            </div>
            <div className="kv-row">
              <span>Network</span>
              <strong>Bitcoin mainnet</strong>
            </div>
          </div>
        </article>
        <article className="panel">
          <h3>Settlement address</h3>
          <p className="section-lead">
            All market payments are directed to the CRC treasury Taproot
            address:
          </p>
          <p className="address">{TREASURY_ADDRESS}</p>
        </article>
      </div>
    </main>
  );
}
