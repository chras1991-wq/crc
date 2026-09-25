"use client";

import {useMemo, useState} from "react";
import {formatBtc, formatSats} from "@/lib/bitcoin";
import {useBitcoinWallet} from "@/lib/bitcoin-wallet";
import {BitcoinWalletModal} from "@/components/BitcoinWalletModal";

function shorten(address: string): string {
  if (address.length < 18) return address;
  return `${address.slice(0, 10)}…${address.slice(-8)}`;
}

export function SettleWithWallet({
  orderId,
  treasuryAddress,
  amountSats,
  amountBtc,
}: {
  orderId: string;
  treasuryAddress: string;
  amountSats: number | null;
  amountBtc: number | null;
}) {
  const wallet = useBitcoinWallet();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txid, setTxid] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const ready = amountSats != null && amountSats > 0 && amountBtc != null;

  const payLabel = useMemo(() => {
    if (!ready || amountSats == null || amountBtc == null) return "Quote pending";
    return `Pay ${formatBtc(amountBtc)}`;
  }, [amountBtc, amountSats, ready]);

  async function onSelect(id: string) {
    setBusy(id);
    setError(null);
    try {
      await wallet.connect(id);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet connection failed");
    } finally {
      setBusy(null);
    }
  }

  async function onPay() {
    if (!ready || amountSats == null) return;
    setPaying(true);
    setError(null);
    try {
      const hash = await wallet.pay(treasuryAddress, amountSats, orderId);
      setTxid(hash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  }

  function onExternal() {
    if (!ready || amountSats == null) return;
    const uri = wallet.bip21Uri(treasuryAddress, amountSats, orderId);
    window.location.href = uri;
    setOpen(false);
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(treasuryAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="settle">
      <p className="address">{treasuryAddress}</p>

      {!wallet.address ? (
        <button
          type="button"
          className="btn btn-primary"
          style={{marginTop: "0.75rem", width: "100%"}}
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
          disabled={!ready}
        >
          {ready ? "Connect Bitcoin wallet" : "Waiting for BTC quote"}
        </button>
      ) : (
        <div className="settle-connected">
          <div className="kv-row" style={{borderBottom: "none", paddingBottom: 0}}>
            <span>Wallet</span>
            <strong>
              {wallet.name} · {shorten(wallet.address)}
            </strong>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{marginTop: "0.75rem", width: "100%"}}
            onClick={() => void onPay()}
            disabled={!ready || paying}
          >
            {paying ? "Confirm in wallet…" : payLabel}
          </button>
          <div className="cta-row" style={{marginTop: "0.6rem"}}>
            <button
              type="button"
              className="btn btn-ghost"
              style={{flex: 1}}
              onClick={() => setOpen(true)}
            >
              Switch wallet
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{flex: 1}}
              onClick={wallet.disconnect}
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="btn btn-ghost"
        style={{marginTop: "0.6rem", width: "100%"}}
        onClick={() => void onCopy()}
      >
        {copied ? "Address copied" : "Copy treasury address"}
      </button>

      {txid ? (
        <p className="settle-success">
          Broadcast ·{" "}
          <a
            href={`https://mempool.space/tx/${txid}`}
            target="_blank"
            rel="noreferrer"
          >
            {txid.slice(0, 18)}…
          </a>
        </p>
      ) : null}

      {error ? <p className="wallet-error inline">{error}</p> : null}

      <p className="section-lead" style={{marginTop: "0.9rem", marginBottom: 0}}>
        UniSat · OKX · Xverse · Leather · Magic Eden · Binance · Bitget · OneKey
        · Ctrl · OYL · MetaMask · Phantom. Amount due:{" "}
        {ready && amountSats != null ? formatSats(amountSats) : "—"}. Order id{" "}
        <strong>{orderId}</strong> is attached when the wallet supports memos.
      </p>

      <BitcoinWalletModal
        open={open}
        wallets={wallet.wallets}
        busy={busy}
        error={error}
        onClose={() => setOpen(false)}
        onSelect={(id) => void onSelect(id)}
        onExternal={onExternal}
      />
    </div>
  );
}
