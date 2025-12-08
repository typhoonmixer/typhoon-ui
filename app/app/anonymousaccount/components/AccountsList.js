"use client";
import { AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import AccountCard from "./AccountCard";
import { hash } from "starknet";
import { useAccount, useConnect } from "@starknet-react/core";
import { TyphoonSDK } from "typhoon-sdk";
import { Ghost, Loader2, Search, AlertCircle } from "lucide-react";

function AccountsList() {
  const { account, address } = useAccount();
  const { connector } = useConnect();

  const [accLoading, setAccLoading] = useState(false);
  const [validAccounts, setValidAccounts] = useState([]);
  const [error, setError] = useState(null);

  const anonAcc = [
    {
      address:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      privKey:
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      balances: { STRK: "100" },
    },
    {
      address:
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      privKey:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      balances: { USDC: "50" },
    },
  ];

  const handleScan = async () => {
    if (!address || !account) return;

    setAccLoading(true);
    setError(null);
    setValidAccounts([]);

    try {
      const sdk = new TyphoonSDK();
      const tm = sdk.get_typedMessage();

      const sig = await account.signMessage(tm);

      const privText = Array.from("head")
        .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("");

      const genPrivKey = hash.computePoseidonHash(
        hash.computePoseidonHash(sig[1], sig[2]),
        BigInt("0x" + privText)
      );

      const accs = await sdk.get_valid_anonymous_accounts(
        genPrivKey,
        address,
        connector?.id || "argentX"
      );

      setValidAccounts(accs);
    } catch (err) {
      console.error("Scan Error:", err);
      setError(err.message || "Failed to scan accounts. Please try again.");
    } finally {
      setAccLoading(false);
    }
  };

  return (
    <div className="lg:col-span-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-muted-foreground">
          Your Identities
        </h2>
        <button
          onClick={handleScan}
          disabled={accLoading || !address}
          className="text-xs flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {accLoading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Search size={12} />
          )}
          {accLoading ? "Scanning..." : "Scan Accounts"}
        </button>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-500 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-bold">Error Scanning Identity</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
        )}

        {accLoading ? (
          <div className="h-64 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground/50 gap-4 animate-pulse">
            <Loader2 size={48} className="animate-spin text-accent" />
            <p className="text-sm font-medium">
              Deriving keys & scanning chain...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {validAccounts.length > 0
              ? validAccounts.map((acc, i) => (
                  <AccountCard key={acc.address || i} account={acc} index={i} />
                ))
              : !error && (
                  <div className="h-64 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground/50 gap-4">
                    <Ghost size={48} strokeWidth={1} />
                    <p className="text-sm">No anonymous accounts found</p>
                  </div>
                )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default AccountsList;
