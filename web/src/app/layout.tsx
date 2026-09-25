import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Sora } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = Sora({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "CRC — Covenant token market on Bitcoin",
  description:
    "CRC-20 market: 1,000 open sell orders priced in USD and settled in Bitcoin at a live exchange rate.",
  applicationName: "CRC",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <div className="shell">
          <header className="site-header">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden>
                🌱
              </span>
              CRC
            </Link>
            <nav className="nav" aria-label="Primary">
              <Link href="/">Home</Link>
              <Link href="/market">Market</Link>
              <Link href="/about">Protocol</Link>
            </nav>
          </header>
          {children}
          <footer className="foot">
            CRC-20 market · settlement on Bitcoin L1 · prices quoted from live
            BTC/USD feeds
          </footer>
        </div>
      </body>
    </html>
  );
}
