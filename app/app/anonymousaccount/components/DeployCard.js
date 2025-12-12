"use client";
import {
  getCompressedDenomination,
  getFullDenomination,
} from "../../../utils/depositUtils";
import {
  tokenDecimals,
  tokenList,
} from "../../../utils/SupportedDenominations";
import {
  useAccount,
  useBalance,
  useProvider,
  useConnect,
} from "@starknet-react/core";
import { ArrowRight, Check, ChevronDown, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { TyphoonSDK } from "typhoon-sdk";
import { hash } from "starknet";

function summarizeNumber(num) {
  if (typeof num !== "number" || isNaN(num)) return "0";
  const suffixes = [
    { threshold: 1e9, suffix: "B" },
    { threshold: 1e6, suffix: "M" },
    { threshold: 1e3, suffix: "k" },
    { threshold: 1, suffix: "" },
  ];
  for (let { threshold, suffix } of suffixes) {
    if (Math.abs(num) >= threshold) {
      return (num / threshold).toFixed(1).replace(/\.0$/, "") + suffix;
    }
  }
  return num.toString();
}

function DeployCard({ selectedToken, setSelectedToken, tokens }) {
  const [isTokenOpen, setIsTokenOpen] = useState(false);
  const [transferValue, setTransferValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [split, setSplit] = useState(false);

  const [minimalRequired, setMinimalRequired] = useState("-");
  const [minLoading, setMinLoading] = useState(false);

  const { address, account } = useAccount();
  const { provider } = useProvider();
  const { connector } = useConnect();

  useEffect(() => {
    let sdk = new TyphoonSDK();
    async function getMin() {
      setMinLoading(true);
      try {
        if (tokenList[selectedToken.name]) {
          let min = await sdk.get_token_minimal_amount(
            tokenList[selectedToken.name]
          );
          setMinimalRequired(
            getCompressedDenomination(
              min.toString(),
              tokenDecimals[selectedToken.name]
            )
          );
        }
      } catch (e) {
        console.error("Error fetching min amount", e);
      } finally {
        setMinLoading(false);
      }
    }
    getMin();
  }, [selectedToken]);

  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    address,
    token: tokenList[selectedToken.name],
    refetchInterval: 10000,
    watch: true,
  });

  const handleDeploy = async () => {
    if (!connector) return;
    setLoading(true);
    try {
      setLoadingText("Generating deposit calls...");
      let sdk = new TyphoonSDK();

      let depositCalls = await sdk.generate_approve_and_deposit_calls(
        BigInt(
          getFullDenomination(transferValue, tokenDecimals[selectedToken.name])
        ),
        tokenList[selectedToken.name]
      );

      setLoadingText("Executing deposit transaction...");
      let res = await account.execute(depositCalls);
      await provider.waitForTransaction(res.transaction_hash);

      await sdk.download_notes(res.transaction_hash);

      let tm = sdk.get_typedMessage();
      let sig = await account.signMessage(tm);

      let privText = Array.from("head")
        .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("");

      let genPrivKey = hash.computePoseidonHash(
        hash.computePoseidonHash(sig[1], sig[2]),
        BigInt("0x" + privText)
      );

      let nextText = Array.from("next")
        .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("");

      let validacc = await sdk.get_valid_anonymous_accounts(
        genPrivKey,
        address,
        connector.id
      );

      let lastPrivKey = "";
      if (validacc.length > 0) {
        lastPrivKey = hash.computePoseidonHash(
          BigInt(validacc[validacc.length - 1].privKey),
          BigInt("0x" + nextText)
        );
      } else {
        lastPrivKey = genPrivKey;
      }

      setLoadingText("Withdrawing to anonymous account...");
      await sdk.withdraw_to_anonymous_account(
        res.transaction_hash,
        lastPrivKey,
        split,
        address,
        connector.id
      );
      setTransferValue("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  return (
    <div className="lg:col-span-6 bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl">
      <h2 className="text-base lg:text-xl font-medium mb-5 lg:mb-8">
        Deploy Account
      </h2>

      <div className="space-y-6">
        <div className={`space-y-2 ${!account || loading ? "opacity-60" : ""}`}>
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Amount to Fund</span>
            <span>
              Balance:{" "}
              {isLoadingBalance ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                <>
                  {balance?.formatted
                    ? parseFloat(balance.formatted).toFixed(4)
                    : "0.00"}{" "}
                  {selectedToken.name}
                </>
              )}
            </span>
          </div>

          <div className="relative">
            <div
              className={`flex items-center bg-muted/40 w-full border border-border rounded-xl focus-within:border-accent transition-colors overflow-hidden ${
                !account || loading ? "cursor-not-allowed" : ""
              }`}
            >
              <button
                onClick={() => account && setIsTokenOpen(!isTokenOpen)}
                disabled={!account || loading}
                className="flex items-center gap-2 px-4 py-4 border-r border-border hover:bg-muted/60 transition-colors text-sm lg:text-lg lg:min-w-[130px] disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <img
                  src={selectedToken.src}
                  alt={selectedToken.name}
                  className="w-5 h-5 lg:w-6 lg:h-6 rounded-full"
                />
                <span className="font-bold">{selectedToken.name}</span>
                <ChevronDown
                  size={14}
                  className={`ml-auto text-muted-foreground transition-transform ${
                    isTokenOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <input
                type="number"
                placeholder="0.00"
                value={transferValue}
                onChange={(e) => setTransferValue(e.target.value)}
                disabled={!account || isLoadingBalance || minLoading || loading}
                className="flex-1 bg-transparent border-none px-4 py-4 text-right text-base lg:text-xl font-mono focus:ring-0 outline-none placeholder:text-muted-foreground/30 disabled:cursor-not-allowed"
              />
            </div>

            {isTokenOpen && (
              <div
                className="absolute mt-1 w-full bg-card border border-border rounded-xl shadow-lg"
                style={{ zIndex: 10 }}
              >
                {tokens.map((token) => (
                  <button
                    key={token.name}
                    onClick={() => {
                      setSelectedToken(token);
                      setIsTokenOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-card-foreground hover:bg-muted rounded-lg"
                  >
                    <img
                      src={token.src}
                      alt={token.name}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="font-medium text-sm">{token.name}</span>
                    {selectedToken.name === token.name && (
                      <Check size={14} className="ml-auto text-accent" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="text-right text-xs text-muted-foreground">
            Min:{" "}
            {minLoading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              <>
                {minimalRequired[0] == "0"
                  ? minimalRequired
                  : summarizeNumber(Number(minimalRequired))}{" "}
                {selectedToken.name}
              </>
            )}
          </div>
        </div>

        <div
          className={`flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50 ${
            !account || loading ? "opacity-60" : ""
          }`}
        >
          <span className="text-sm font-medium">Split Deposit</span>
          <Switch
            checked={split}
            onChange={setSplit}
            disabled={!account || loading}
          />
        </div>

        <button
          onClick={async () => {
            if (!account) {
              try {
                const pop = document.getElementById("connect-modal");
                // @ts-ignore
                pop?.togglePopover?.();
              } catch {}
            } else {
              handleDeploy();
            }
          }}
          disabled={loading}
          className="w-full py-3 lg:py-4 bg-accent text-accent-foreground font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_var(--accent)] flex items-center justify-center gap-2"
        >
          {!account ? (
            "Connect Wallet"
          ) : loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>{loadingText || "Processing..."}</span>
            </>
          ) : (
            <>
              Deploy <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

const Switch = ({ checked, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`w-11 h-6 rounded-full transition-colors relative border-[#c4c4c4] border focus:outline-none focus:ring-2 focus:ring-accent/50 ${
      checked ? "bg-accent" : "bg-muted-foreground/30"
    } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
  >
    <span
      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

export default DeployCard;
