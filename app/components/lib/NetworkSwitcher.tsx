"use client";
import React from "react";
import { useNetwork, useSwitchChain } from "@starknet-react/core";
import { mainnet, sepolia } from "@starknet-react/chains";

const networks = [
  { id: sepolia.id, name: "Sepolia" },
  { id: mainnet.id, name: "Mainnet" },
];

export default function NetworkSwitcher() {
  const { chain } = useNetwork();
  const { switchChain, switchChainAsync, isPending } = useSwitchChain({});

  const current = networks.find((n) => n.id === chain?.id)?.name || "Unknown";

  return (
    <div className="relative inline-block text-left mr-2">
      <div className="flex items-center gap-2">
        <label className="text-white text-sm">Network:</label>
        <select
          disabled={isPending}
          className="bg-zinc-900 text-white rounded-md px-2 py-1 border border-zinc-700"
          value={String(chain?.id || sepolia.id)}
          onChange={(e) => {
            const id = BigInt(e.target.value);
            switchChain({ chainId: id });
          }}
        >
          {networks.map((n) => (
            <option key={String(n.id)} value={String(n.id)}>
              {n.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

