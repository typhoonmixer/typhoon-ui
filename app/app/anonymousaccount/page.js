"use client";
import React, { useState } from "react";
import DeployCard from "./components/DeployCard";
import AccountsList from "./components/AccountsList";

const TOKENS = [
  { name: "STRK", src: "/starknetlogo.svg" },
  {
    name: "ETH",
    src: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
  },
  {
    name: "WBTC",
    src: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
  },
  { name: "tBTC", src: "/tbtclogo.png" },
  {
    name: "SolvBTC",
    src: "https://assets.coingecko.com/coins/images/36800/standard/solvBTC.png",
  },
  {
    name: "USDC",
    src: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  },
  {
    name: "USDT",
    src: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
  },
  { name: "SCHIZODIO", src: "/schizodio_logo.jpg" },
  {
    name: "LORDS",
    src: "https://assets.coingecko.com/coins/images/22171/small/Frame_1.png",
  },
  {
    name: "SURVIVOR",
    src: "https://lootsurvivor.io/images/survivor_token.png",
  },
  { name: "UNO", src: "/unologo.png" },
];

export default function AnonymousAccountPage() {
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);

  return (
    <div className="min-h-screen bg-background text-foreground py-4 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-2xl font-bold text-card-foreground">
            Anonymous Accounts
          </h1>

          <div className="max-w-3xl mx-auto space-y-4 text-muted-foreground leading-relaxed text-sm/7 text-justify">
            <p>
              Typhoon Anonymous accounts will empower you with a second layer of
              privacy. Create an Anonymous Account on Typhoon to transact freely
              without exposing your real address to observers. Enjoy the freedom
              of anonymity, protect your identity in DeFi protocols, and
              participate anonymously in the Starknet ecosystem. Your privacy
              matters, and we're here to safeguard it. To deploy an Anonymous
              Account, you need to deposit an arbitrary amount into any
              Typhoon's pools first, then this amount is mixed and sended to
              your anonymous account, this ensure that there is no link between
              you and your anonymous account and at the same time you have total
              control over your anonymous account.
            </p>
            <div className="bg-accent/5 border border-accent/10 p-3 rounded-lg mx-auto w-fit text-accent text-xs font-bold uppercase tracking-wide">
              Warning: If using Browser Extension, deploy using a Ready (Argent)
              Account.
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <DeployCard
            selectedToken={selectedToken}
            setSelectedToken={setSelectedToken}
            tokens={TOKENS}
          />

          <AccountsList />
        </div>
      </div>
    </div>
  );
}
