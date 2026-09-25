"use client";

import {useCallback, useMemo, useState} from "react";
import {
  connect as connectBigmi,
  getConnectors,
  type Connector,
} from "@bigmi/client";
import {bitcoinWalletConfig} from "./bigmi";

type BitcoinProvider = {
  sendBitcoin?: (
    to: string,
    sats: number,
    options?: {feeRate?: number},
  ) => Promise<string>;
  request?: (
    method: string,
    params?: unknown,
  ) => Promise<{
    status?: string;
    result?: {txid?: string};
    error?: {message?: string};
  }>;
};

type PhantomBitcoinAccount = {
  address: string;
  purpose?: "payment" | "ordinals";
};

type NativeWindowProvider = {
  requestAccounts?: () => Promise<string[]>;
  getAccounts?: () => Promise<string[]>;
  sendBitcoin?: (to: string, sats: number) => Promise<string>;
  request?: (
    method: string,
    params?: unknown,
  ) => Promise<unknown>;
};

declare global {
  interface Window {
    phantom?: {
      bitcoin?: {
        requestAccounts: () => Promise<PhantomBitcoinAccount[]>;
        request?: (
          method: string,
          params?: unknown,
        ) => Promise<{txid?: string} | string>;
      };
    };
    unisat?: NativeWindowProvider;
    okxwallet?: {bitcoin?: NativeWindowProvider};
    leatherProvider?: NativeWindowProvider;
    XverseProviders?: {BitcoinProvider?: NativeWindowProvider};
    bitkeep?: {unisat?: NativeWindowProvider};
  }
}

export type BitcoinWalletOption = {
  id: string;
  name: string;
  icon?: string;
};

type ConnectorWithProvider = Connector & {
  getInternalProvider?: () => Promise<BitcoinProvider>;
};

function bip21Uri(address: string, sats: number, label?: string): string {
  const amountBtc = (sats / 100_000_000).toFixed(8);
  const params = new URLSearchParams({amount: amountBtc});
  if (label) params.set("label", label);
  return `bitcoin:${address}?${params.toString()}`;
}

export function useBitcoinWallet() {
  const [connector, setConnector] = useState<Connector | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [nativePayment, setNativePayment] = useState(false);
  const [nativeProvider, setNativeProvider] = useState<BitcoinProvider | null>(
    null,
  );

  const connectors = useMemo(() => getConnectors(bitcoinWalletConfig), []);
  const wallets = useMemo<BitcoinWalletOption[]>(
    () => [
      ...connectors.map((item) => ({
        id: item.id,
        name: item.name,
        icon: item.icon,
      })),
      {id: "phantom", name: "Phantom"},
    ],
    [connectors],
  );

  const connect = useCallback(
    async (walletId: string) => {
      if (walletId === "phantom") {
        const provider = window.phantom?.bitcoin;
        if (!provider) throw new Error("Phantom Bitcoin wallet not detected");
        const accounts = await provider.requestAccounts();
        const payment =
          accounts.find((account) => account.purpose === "payment") ??
          accounts[0];
        if (!payment?.address) {
          throw new Error("Phantom payment address unavailable");
        }
        setConnector(null);
        setNativeProvider({
          request: async (method, params) => {
            const result = await provider.request?.(method, params);
            if (typeof result === "string") return {result: {txid: result}};
            if (result && typeof result === "object" && "txid" in result) {
              return {result: {txid: (result as {txid?: string}).txid}};
            }
            return {result: {}};
          },
        });
        setSelectedId("phantom");
        setSelectedName("Phantom");
        setAddress(payment.address);
        setNativePayment(Boolean(provider.request));
        return payment.address;
      }

      const selected = connectors.find((item) => item.id === walletId);
      if (!selected) throw new Error("Wallet connector unavailable");

      const result = await connectBigmi(bitcoinWalletConfig, {
        connector: selected,
      });
      const payment =
        result.accounts.find((account) => account.purpose === "payment") ??
        result.accounts[0];
      if (!payment?.address) {
        throw new Error("Bitcoin payment address unavailable");
      }

      const provider = await (
        selected as ConnectorWithProvider
      ).getInternalProvider?.();
      setConnector(selected);
      setNativeProvider(provider ?? null);
      setSelectedId(selected.id);
      setSelectedName(selected.name);
      setAddress(payment.address);
      setNativePayment(Boolean(provider?.sendBitcoin || provider?.request));
      return payment.address;
    },
    [connectors],
  );

  const pay = useCallback(
    async (to: string, sats: number, memo?: string) => {
      if (!address) throw new Error("Connect a Bitcoin wallet first");
      if (!Number.isFinite(sats) || sats < 546) {
        throw new Error("Payment amount too small for Bitcoin mainnet");
      }

      const provider =
        nativeProvider ??
        (connector
          ? await (connector as ConnectorWithProvider).getInternalProvider?.()
          : null);

      if (provider?.sendBitcoin) {
        return provider.sendBitcoin(to, sats);
      }

      if (provider?.request) {
        const response = await provider.request("sendTransfer", {
          recipients: [{address: to, amount: sats}],
          ...(memo ? {memo} : {}),
        });
        if (response.result?.txid) return response.result.txid;
        if (response.error?.message) throw new Error(response.error.message);
      }

      // Last resort: open BIP-21 URI so any installed wallet can complete payment.
      const uri = bip21Uri(to, sats, memo);
      window.location.href = uri;
      throw new Error(
        "Opened BIP-21 payment URI. Confirm the transfer in your wallet, then return with the txid.",
      );
    },
    [address, connector, nativeProvider],
  );

  const disconnect = useCallback(() => {
    setConnector(null);
    setNativeProvider(null);
    setSelectedId(null);
    setSelectedName(null);
    setAddress(null);
    setNativePayment(false);
  }, []);

  return {
    wallets,
    kind: selectedId,
    name: selectedName,
    address,
    nativePayment,
    connect,
    pay,
    disconnect,
    bip21Uri: (to: string, sats: number, memo?: string) =>
      bip21Uri(to, sats, memo),
  };
}
