# CRC — Covenant token market

Bitcoin L1 market for **CRC-20** with **1,000** open sell orders.

- USD listing band: **$500 – $30,000** (random deterministic distribution)
- Settlement asset: **BTC** at a live spot rate
- Treasury: `bc1p6r2ve3qnwuyxen6pphzgkdwn8h8wdz8fyl4yd46duvgdnv3uq0dqjxrnwv`

## Develop

```bash
cd web
npm install
npm run dev
```

- `/` — protocol home
- `/market` — order book
- `/order/[id]` — buy / settle
- `/about` — CRC-20 notes
- `/api/orders` — catalog
- `/api/quote` — BTC/USD spot

## Deploy

Root directory: `web`
