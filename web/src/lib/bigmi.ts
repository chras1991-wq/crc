import {
  binance,
  bitget,
  createConfig,
  ctrl,
  leather,
  magicEden,
  metamask,
  okx,
  onekey,
  oyl,
  unisat,
  xverse,
} from "@bigmi/client";
import {bitcoin, createClient, mempool} from "@bigmi/core";

export const bitcoinWalletConfig = createConfig({
  chains: [bitcoin],
  connectors: [
    unisat(),
    okx(),
    xverse(),
    leather(),
    magicEden(),
    binance(),
    bitget(),
    onekey(),
    ctrl(),
    oyl(),
    metamask(),
  ],
  client: ({chain}) => createClient({chain, transport: mempool()}),
  ssr: true,
});
