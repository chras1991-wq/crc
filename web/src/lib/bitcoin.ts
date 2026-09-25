export type BtcQuote = {
  usdPerBtc: number;
  amountBtc: number;
  amountSats: number;
  fetchedAt: string;
  source: string;
};

const SATS_PER_BTC = 100_000_000;

let cache: { usdPerBtc: number; fetchedAt: number; source: string } | null =
  null;
const CACHE_MS = 60_000;

async function fetchUsdPerBtc(): Promise<{ usdPerBtc: number; source: string }> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_MS) {
    return { usdPerBtc: cache.usdPerBtc, source: cache.source };
  }

  const endpoints: Array<{
    url: string;
    parse: (data: unknown) => number | null;
    source: string;
  }> = [
    {
      url: "https://mempool.space/api/v1/prices",
      source: "mempool.space",
      parse: (data) => {
        const usd = (data as { USD?: number })?.USD;
        return typeof usd === "number" && usd > 0 ? usd : null;
      },
    },
    {
      url: "https://api.coinbase.com/v2/prices/BTC-USD/spot",
      source: "coinbase",
      parse: (data) => {
        const amount = Number(
          (data as { data?: { amount?: string } })?.data?.amount,
        );
        return Number.isFinite(amount) && amount > 0 ? amount : null;
      },
    },
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint.url, {
        next: { revalidate: 60 },
        headers: { Accept: "application/json" },
      });
      if (!res.ok) continue;
      const json = await res.json();
      const usdPerBtc = endpoint.parse(json);
      if (usdPerBtc) {
        cache = { usdPerBtc, fetchedAt: now, source: endpoint.source };
        return { usdPerBtc, source: endpoint.source };
      }
    } catch {
      /* try next */
    }
  }

  if (cache) return { usdPerBtc: cache.usdPerBtc, source: cache.source };
  throw new Error("Unable to fetch BTC/USD rate");
}

export async function quoteUsdInBtc(priceUsd: number): Promise<BtcQuote> {
  const { usdPerBtc, source } = await fetchUsdPerBtc();
  const amountBtc = priceUsd / usdPerBtc;
  const amountSats = Math.max(1, Math.round(amountBtc * SATS_PER_BTC));
  return {
    usdPerBtc,
    amountBtc,
    amountSats,
    fetchedAt: new Date().toISOString(),
    source,
  };
}

export function formatBtc(amountBtc: number): string {
  if (amountBtc >= 1) return `${amountBtc.toFixed(6)} BTC`;
  if (amountBtc >= 0.01) return `${amountBtc.toFixed(8)} BTC`;
  return `${amountBtc.toFixed(8)} BTC`;
}

export function formatSats(sats: number): string {
  return `${sats.toLocaleString("en-US")} sats`;
}
