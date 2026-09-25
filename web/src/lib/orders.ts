import {
  MAX_PRICE_USD,
  MIN_PRICE_USD,
  ORDER_COUNT,
  TOKEN_SYMBOL,
} from "./constants";

export type MarketOrder = {
  id: string;
  ordinal: number;
  priceUsd: number;
  amount: number;
  side: "sell";
  status: "open";
};

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic USD prices across $500–$30,000 for a stable catalog. */
function priceForOrdinal(ordinal: number): number {
  const rand = mulberry32(ordinal * 97_531 + 17);
  const skew = Math.pow(rand(), 1.35);
  const raw = MIN_PRICE_USD + skew * (MAX_PRICE_USD - MIN_PRICE_USD);
  return Math.round(raw * 100) / 100;
}

function amountForOrdinal(ordinal: number, priceUsd: number): number {
  const rand = mulberry32(ordinal * 13_337 + 42);
  const base = 1_000 + rand() * 49_000;
  const scale = 5_000 / Math.max(500, priceUsd);
  return Math.round(base * scale * 100) / 100;
}

export function orderId(ordinal: number): string {
  return `CRC-${String(ordinal).padStart(4, "0")}`;
}

export function parseOrderId(id: string): number | null {
  const match = /^CRC-(\d{4})$/i.exec(id.trim());
  if (!match) return null;
  const ordinal = Number(match[1]);
  return ordinal >= 1 && ordinal <= ORDER_COUNT ? ordinal : null;
}

export function getOrder(ordinal: number): MarketOrder {
  if (!Number.isInteger(ordinal) || ordinal < 1 || ordinal > ORDER_COUNT) {
    throw new RangeError("order out of range");
  }
  const priceUsd = priceForOrdinal(ordinal);
  return {
    id: orderId(ordinal),
    ordinal,
    priceUsd,
    amount: amountForOrdinal(ordinal, priceUsd),
    side: "sell",
    status: "open",
  };
}

export function listOrders(input: {
  page?: number;
  pageSize?: number;
  minUsd?: number;
  maxUsd?: number;
  query?: string;
}): { orders: MarketOrder[]; total: number; page: number; pageSize: number } {
  const pageSize = Math.min(50, Math.max(1, Math.floor(input.pageSize ?? 20)));
  const page = Math.max(1, Math.floor(input.page ?? 1));
  const needle = input.query?.trim().toUpperCase();
  const direct = needle ? parseOrderId(needle) : null;

  if (needle && direct == null && !/^\d+$/.test(needle)) {
    return { orders: [], total: 0, page, pageSize };
  }

  const orders: MarketOrder[] = [];
  let total = 0;
  const first = direct ?? 1;
  const last = direct ?? ORDER_COUNT;

  for (let ordinal = first; ordinal <= last; ordinal += 1) {
    const order = getOrder(ordinal);
    if (input.minUsd != null && order.priceUsd < input.minUsd) continue;
    if (input.maxUsd != null && order.priceUsd > input.maxUsd) continue;
    if (needle && /^\d+$/.test(needle) && !order.id.includes(needle)) continue;

    const start = (page - 1) * pageSize;
    if (total >= start && orders.length < pageSize) orders.push(order);
    total += 1;
  }

  return { orders, total, page, pageSize };
}

export function marketStats() {
  let floor = Number.POSITIVE_INFINITY;
  let high = 0;
  let sum = 0;
  for (let i = 1; i <= ORDER_COUNT; i += 1) {
    const price = getOrder(i).priceUsd;
    floor = Math.min(floor, price);
    high = Math.max(high, price);
    sum += price;
  }
  return {
    catalogSize: ORDER_COUNT,
    floorUsd: floor,
    highUsd: high,
    avgUsd: Math.round((sum / ORDER_COUNT) * 100) / 100,
    symbol: TOKEN_SYMBOL,
  };
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

export function formatTokenAmount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}
