"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  formatTokenAmount,
  formatUsd,
  type MarketOrder,
} from "@/lib/orders";

type OrdersResponse = {
  orders: MarketOrder[];
  total: number;
  page: number;
  pageSize: number;
};

type QuoteResponse = {
  usdPerBtc: number;
  source: string;
};

export default function MarketPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [maxUsd, setMaxUsd] = useState("30000");
  const [orders, setOrders] = useState<MarketOrder[]>([]);
  const [total, setTotal] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);

  const search = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "20",
      maxUsd,
    });
    if (query.trim()) params.set("query", query.trim());
    return params.toString();
  }, [maxUsd, page, query]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    void fetch(`/api/orders?${search}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((res) => res.json() as Promise<OrdersResponse>)
      .then((data) => {
        setOrders(data.orders ?? []);
        setTotal(data.total ?? 0);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/quote", { cache: "no-store", signal: controller.signal })
      .then((res) => res.json() as Promise<QuoteResponse>)
      .then((data) => setQuote(data))
      .catch(() => setQuote(null));
    return () => controller.abort();
  }, []);

  const pageCount = Math.max(1, Math.ceil(total / 20));

  return (
    <main className="section">
      <p className="eyebrow">CRC market</p>
      <h2>Order book</h2>
      <p className="section-lead">
        1,000 open CRC sell orders. USD is the listing reference; payable size
        is the live BTC equivalent.
        {quote
          ? ` Spot ${formatUsd(quote.usdPerBtc)} / BTC (${quote.source}).`
          : ""}
      </p>

      <div className="filters">
        <input
          aria-label="Search order id"
          placeholder="Search CRC-0001"
          value={query}
          onChange={(event) => {
            setPage(1);
            setQuery(event.target.value);
          }}
        />
        <select
          aria-label="Max USD"
          value={maxUsd}
          onChange={(event) => {
            setPage(1);
            setMaxUsd(event.target.value);
          }}
        >
          <option value="30000">Max $30,000</option>
          <option value="10000">Max $10,000</option>
          <option value="5000">Max $5,000</option>
          <option value="2000">Max $2,000</option>
          <option value="1000">Max $1,000</option>
        </select>
      </div>

      <table className="order-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Amount</th>
            <th>USD ref</th>
            <th>Side</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5}>Loading orders…</td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={5}>No orders match this filter.</td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link href={`/order/${order.id}`}>{order.id}</Link>
                </td>
                <td>{formatTokenAmount(order.amount)} CRC</td>
                <td>{formatUsd(order.priceUsd)}</td>
                <td>SELL</td>
                <td>
                  <Link className="btn btn-ghost" href={`/order/${order.id}`}>
                    Buy
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pager">
        <span>
          Page {page} / {pageCount} · {total.toLocaleString()} orders
        </span>
        <div className="cta-row">
          <button
            className="btn btn-ghost"
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Previous
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            disabled={page >= pageCount}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
