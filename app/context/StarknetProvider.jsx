"use client";
import { sepolia, mainnet } from "@starknet-react/chains";
import {
  alchemyProvider,
  argent,
  braavos,
  jsonRpcProvider,
  infuraProvider,
  lavaProvider,
  blastProvider,
  cartridgeProvider,
  StarknetConfig,
  starkscan,
  useInjectedConnectors,
} from "@starknet-react/core";
import { ArgentMobileConnector } from "starknetkit/argentMobile";
import { WebWalletConnector } from "starknetkit/webwallet";
import dotenv from "dotenv";
import { RpcProvider } from "starknet";
dotenv.config();

export function StarknetProvider({ children }) {
  const { connectors: injected } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: "always",
  });

  const connectors = [
    ...injected,
    new WebWalletConnector({ url: "https://web.argent.xyz" }),
    new ArgentMobileConnector(),
  ];

  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const nodeProvider = process.env.NEXT_PUBLIC_PROVIDER;
  const explicitRpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  const envSepolia = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;
  const envMainnet = process.env.NEXT_PUBLIC_MAINNET_RPC_URL;

  let provider;
  // If per‑chain env URLs are provided, honor them and keep provider dynamic by chain
  if (envSepolia || envMainnet) {
    const fallbackMain = "https://starknet-mainnet.public.blastapi.io/rpc/v0_9";
    const fallbackSep = "https://starknet-sepolia.public.blastapi.io/rpc/v0_9";
    provider = jsonRpcProvider({
      rpc: (chain) => {
        const isMain = chain.id === mainnet.id;
        const nodeUrl = isMain
          ? envMainnet || fallbackMain
          : envSepolia || fallbackSep;
        return { nodeUrl };
      },
    });
  } else if (explicitRpcUrl) {
    // Legacy single-URL override (not chain-aware)
    provider = jsonRpcProvider({ rpc: () => ({ nodeUrl: explicitRpcUrl }) });
  } else if (nodeProvider == "infura" && apiKey) {
    provider = infuraProvider({ apiKey });
  } else if (nodeProvider == "alchemy" && apiKey) {
    provider = alchemyProvider({ apiKey });
  } else if (nodeProvider == "lava" && apiKey) {
    provider = lavaProvider({ apiKey });
  } else if (nodeProvider == "blast" && apiKey) {
    provider = blastProvider({ apiKey });
  } else if (nodeProvider == "reddio" && apiKey) {
    provider = cartridgeProvider({ apiKey });
  } else {
    // Default to Blast public RPC (non-random) per chain
    provider = jsonRpcProvider({
      rpc: (chain) => {
        const isMainnet = chain.id === mainnet.id;
        const nodeUrl = isMainnet
          ? "https://starknet-mainnet.public.blastapi.io/rpc/v0_9"
          : "https://starknet-sepolia.public.blastapi.io/rpc/v0_9";
        return { nodeUrl };
      },
    });
  }

  let lsHint = "";
  if (typeof window !== "undefined") {
    try {
      lsHint = (localStorage.getItem("preferredChain") || "").toLowerCase();
    } catch {}
  }
  const chainHint = (
    lsHint ||
    process.env.NEXT_PUBLIC_CHAIN ||
    ""
  ).toLowerCase();
  const defaultChainId = chainHint.includes("main") ? mainnet.id : sepolia.id;
  // const provider = new RpcProvider({ nodeUrl: 'https://free-rpc.nethermind.io/sepolia-juno/v0_7' });
  return (
    <StarknetConfig
      connectors={connectors}
      chains={[mainnet, sepolia]}
      provider={provider}
      explorer={starkscan}
      autoConnect={false}
      defaultChainId={defaultChainId}
    >
      {children}
    </StarknetConfig>
  );
}
