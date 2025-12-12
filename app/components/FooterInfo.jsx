"use client";
import React from "react";
import { Github } from "lucide-react";
import { useNetwork } from "@starknet-react/core";
import { mainnet } from "@starknet-react/chains";
import typhoonMain from "../../typhoon.json" assert { type: "json" };
import typhoonTestnet from "../../typhoon-testnet.json" assert { type: "json" };

export default function FooterInfo() {
  const { chain } = useNetwork();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const { address, isMainnet } = React.useMemo(() => {
    let hint = "";
    if (typeof window !== "undefined") {
      try {
        hint = (localStorage.getItem("preferredChain") || "").toLowerCase();
      } catch {}
    }
    const preferMain = hint ? hint.includes("main") : chain?.id === mainnet.id;
    const envMain = process.env.NEXT_PUBLIC_TYPHOON_MAINNET_ADDR;
    const envSep = process.env.NEXT_PUBLIC_TYPHOON_SEPOLIA_ADDR;
    const addr = preferMain
      ? envMain || typhoonMain?.typhoon
      : envSep || typhoonTestnet?.typhoon;
    return { address: addr, isMainnet: preferMain };
  }, [chain?.id]);

  if (!mounted || !address) return null;
  const base = isMainnet
    ? "https://starkscan.co"
    : "https://sepolia.starkscan.co";
  const href = `${base}/contract/${address}`;

  return (
    <div className="mt-0 text-xs text-muted-foreground flex items-center justify-center gap-4 w-full text-center">
      <div className="truncate">
        Contract:
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="ml-2 underline text-accent font-mono break-all"
        >
          {address}
        </a>
      </div>
      <a
        href="https://github.com/typhoonmixer/typhoon-contracts"
        target="_blank"
        rel="noreferrer"
        aria-label="Typhoon contracts on GitHub"
        className="inline-flex items-center text-accent hover:opacity-90"
      >
        <Github className="h-4 w-4" />
      </a>
    </div>
  );
}
