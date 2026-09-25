"use client";

import { useState } from "react";

export function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <p className="address">{address}</p>
      <button
        type="button"
        className="btn btn-primary"
        style={{ marginTop: "0.75rem", width: "100%" }}
        onClick={() => void onCopy()}
      >
        {copied ? "Copied" : "Copy treasury address"}
      </button>
    </div>
  );
}
