"use client";

import type {BitcoinWalletOption} from "@/lib/bitcoin-wallet";

const FEATURED = new Set([
  "unisat",
  "okx",
  "xverse",
  "leather",
  "magicEden",
  "binance",
  "bitget",
  "onekey",
  "ctrl",
  "oyl",
  "metamask",
  "phantom",
]);

export function BitcoinWalletModal({
  open,
  wallets,
  busy,
  error,
  onClose,
  onSelect,
  onExternal,
}: {
  open: boolean;
  wallets: BitcoinWalletOption[];
  busy: string | null;
  error?: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  onExternal: () => void;
}) {
  if (!open) return null;

  const ordered = [...wallets].sort((a, b) => {
    const af = FEATURED.has(a.id) ? 0 : 1;
    const bf = FEATURED.has(b.id) ? 0 : 1;
    return af - bf || a.name.localeCompare(b.name);
  });

  return (
    <div className="wallet-modal-backdrop" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close wallet selector"
        className="wallet-modal-scrim"
        onClick={onClose}
      />
      <section className="wallet-modal">
        <header className="wallet-modal-header">
          <div>
            <p className="eyebrow">Bitcoin wallet · mainnet</p>
            <h2>Connect & pay</h2>
          </div>
          <button type="button" className="wallet-modal-close" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="wallet-grid">
          {ordered.map((wallet, index) => (
            <button
              key={wallet.id}
              type="button"
              disabled={Boolean(busy)}
              onClick={() => onSelect(wallet.id)}
              className="wallet-card"
            >
              <span className="wallet-icon">
                {wallet.icon ? (
                  // Connector icons are bundled data URIs or extension-owned URLs.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={wallet.icon} alt="" width={20} height={20} />
                ) : (
                  wallet.name.slice(0, 2).toUpperCase()
                )}
              </span>
              <span className="wallet-name">{wallet.name}</span>
              <span className="wallet-meta">
                {busy === wallet.id
                  ? "Connecting…"
                  : String(index + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>

        <button type="button" className="wallet-external" onClick={onExternal}>
          <span>
            <strong>Any other BTC wallet</strong>
            <span className="wallet-external-sub">
              Sparrow · BlueWallet · Trust · BIP-21
            </span>
          </span>
          <span aria-hidden>→</span>
        </button>

        {error ? <p className="wallet-error">{error}</p> : null}
      </section>
    </div>
  );
}
