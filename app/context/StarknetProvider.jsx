"use client";
import { sepolia, mainnet } from "@starknet-react/chains";
import {
  alchemyProvider,
  argent,
  braavos,
  publicProvider,
  jsonRpcProvider,
  infuraProvider,
  lavaProvider,
  blastProvider,
  nethermindProvider,
  reddioProvider,
  StarknetConfig,
  starkscan,
  useInjectedConnectors,
} from "@starknet-react/core";
import { ArgentMobileConnector } from "starknetkit/argentMobile";
import { WebWalletConnector } from "starknetkit/webwallet";
import dotenv from 'dotenv'
import { RpcProvider} from 'starknet';
dotenv.config()



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

  const apiKey = process.env.NEXT_PUBLIC_API_KEY
  const nodeProvider = process.env.NEXT_PUBLIC_PROVIDER
  const explicitRpcUrl = process.env.NEXT_PUBLIC_RPC_URL

  let provider;
  if (explicitRpcUrl) {
    provider = jsonRpcProvider({ rpc: () => ({ nodeUrl: explicitRpcUrl }) });
  } else if (nodeProvider == "infura" && apiKey) {
    provider = infuraProvider({ apiKey });
  } else if (nodeProvider == "alchemy" && apiKey) {
    provider = alchemyProvider({ apiKey });
  } else if (nodeProvider == "lava" && apiKey) {
    provider = lavaProvider({ apiKey });
  } else if (nodeProvider == "nethermind" && apiKey) {
    provider = nethermindProvider({ apiKey });
  } else if (nodeProvider == "blast" && apiKey) {
    provider = blastProvider({ apiKey });
  } else if (nodeProvider == "reddio" && apiKey) {
    provider = reddioProvider({ apiKey });
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

  const chainHint = (process.env.NEXT_PUBLIC_CHAIN || '').toLowerCase();
  const defaultChainId = chainHint.includes('main') ? mainnet.id : sepolia.id;
  // const provider = new RpcProvider({ nodeUrl: 'https://free-rpc.nethermind.io/sepolia-juno/v0_7' });
  return (
    <StarknetConfig
      connectors={connectors}
      chains={[mainnet, sepolia]}
      provider={provider}
      explorer={starkscan}
      autoConnect
      defaultChainId={defaultChainId}
    >
      {children}
    </StarknetConfig>
  );
}
