"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { useNetwork, useProvider } from "@starknet-react/core";
import { Contract, hash, events as snEvents, CallData as SNCallData, createAbiParser, RpcProvider } from 'starknet';
import { mainnet } from '@starknet-react/chains';
import typhoonMain from '../../typhoon.json' assert { type: 'json' }
import typhoonTestnet from '../../typhoon-testnet.json' assert { type: 'json' }
import { getFullDenomination } from '../utils/depositUtils';
import { tokenDecimals } from '../utils/SupportedDenominations';
import { getNodeUrl } from '../utils/network';
// Note list panel removed per design

const provider = new RpcProvider({ nodeUrl: "https://rpc.starknet.lava.build:443" });
export default function ReadPanel({
  token,
  denomination,
  poolCount,
  todayDeposits,
  overallDeposits,
}) {

  // const { provider } = useProvider();
  
  const { chain } = useNetwork();

  const resolvedTyphoonAddress = useMemo(() => {
    const envMain = process.env.NEXT_PUBLIC_TYPHOON_MAINNET_ADDR;
    const envSep = process.env.NEXT_PUBLIC_TYPHOON_SEPOLIA_ADDR;
    let hint = '';
    if (typeof window !== 'undefined') {
      try { hint = (localStorage.getItem('preferredChain') || '').toLowerCase(); } catch { }
    }
    const isMainnetPreferred = hint ? hint.includes('main') : (chain?.id === mainnet.id);
    return isMainnetPreferred ? (envMain || typhoonMain?.typhoon) : (envSep || typhoonTestnet?.typhoon);
  }, [chain?.id]);

  // Token mapping (simple subset used in app)
  const tokenToAddress = {
    STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    USDC: "0x033068F6539f8e6e6b131e6B2B814e6c34A5224bC66947c47DaB9dFeE93b35fb",
    WBTC: "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
    tBTC: "0x04daa17763b286d1e59b97c283c0b8c949994c361e426a28f743c67bdfe9a32f",
    SCHIZODIO: "0x00acc2fa3bb7f6a6726c14d9e142d51fe3984dbfa32b5907e1e76425177875e2",
    SolvBTC: "0x0593e034dda23eea82d2ba9a30960ed42cf4a01502cc2351dc9b9881f9931a68",
    USDT: "0x068F5c6a61780768455de69077E07e89787839bf8166dEcfBf92B645209c0fB8",
    LORDS: "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
    SURVIVOR: "0x042DD777885AD2C116be96d4D634abC90A26A790ffB5871E037Dd5Ae7d2Ec86B",
    CASH: "0x0498EDFaF50CA5855666a700C25Dd629D577EB9aFcCDf3B5977aEC79AEE55ADA"
  };

  const [latest, setLatest] = useState([]); // [{index, timeAgo, blockNumber, txHash}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadAbi(address) {
    try {
      const klass = await provider.getClassAt(address);
      let abi = klass?.abi;
      if (typeof abi === 'string') abi = JSON.parse(abi);
      return Array.isArray(abi) ? abi : null;
    } catch (e) { return null; }
  }

  async function getContractAt(address) {
    const abi = await loadAbi(address);
    if (!abi) return null;
    try { return new Contract({ abi, address, providerOrAccount: provider }); } catch { return null; }
  }

  function formatAgo(tsSec) {
    const now = Date.now();
    const diffMs = Math.max(0, now - tsSec * 1000);
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  useEffect(() => {
    async function fetchLatest() {
      setError("");
      setLatest([]);
      if (!provider || !resolvedTyphoonAddress || !token || !denomination) return;
      try {
        setLoading(true);
        // Resolve pool address
        const typhoonAbi = await loadAbi(resolvedTyphoonAddress);
        // const { abi: typhoonAbi } = await provider.getClassAt(typhoonAddress);
        if (!typhoonAbi) throw new Error('Typhoon ABI unavailable');
        let typhoon;
        try {
          typhoon = new Contract({ abi: typhoonAbi, address: resolvedTyphoonAddress, providerOrAccount: provider });

        } catch (e) {
          console.error("Contract construction failed:", e);
          setError("Contract instantiation failed");
          setLoading(false);
          return;
        }
        const denomFull = getFullDenomination(denomination, tokenDecimals[token]);

        const pool = await typhoon.getPool(tokenToAddress[token], denomFull);

        const poolAddr = '0x' + pool.toString(16);

        // Simple approach: scan last 20k blocks on Typhoon contract and parse Deposit events by pool
        const current = await provider.getBlockNumber();
        const fromBlock = Math.max(0, Number(current) - 60000);
        let all = [];
        // let token_aux = "0";
        // do {
        //   const page = await provider.getEvents({
        //     address: resolvedTyphoonAddress,
        //     from_block: { block_number: fromBlock },
        //     to_block: { block_number: Number(current) },
        //     chunk_size: 1000,
        //     continuation_token: token_aux === '0' ? undefined : continuationToken,
        //   });
        //   all = all.concat(page.events || []);
        //   token_aux = page.continuation_token;
        // } while (token_aux != undefined);
        let continuationToken = undefined;

        do {
          const page = await provider.getEvents({
            address: resolvedTyphoonAddress,
            from_block: { block_number: fromBlock },
            to_block: { block_number: Number(current) },
            chunk_size: 1000,
            continuation_token: continuationToken,
          });

          all.push(...(page.events ?? []));

          if (!page.continuation_token || page.continuation_token === continuationToken) {
            break;
          }

          continuationToken = page.continuation_token;
        } while (true);
        console.log("all ",all)

        const abiEvents = snEvents.getAbiEvents(typhoonAbi);
        const abiStructs = SNCallData.getAbiStruct(typhoonAbi);
        const abiEnums = SNCallData.getAbiEnum(typhoonAbi);
        const parser = createAbiParser(typhoonAbi);
        const parsed = snEvents.parseEvents(all, abiEvents, abiStructs, abiEnums, parser);

        // Filter for Deposit events for this pool and dedupe by tx hash
        const seen = new Set();
        const matched = [];
        for (let i = 0; i < parsed.length; i++) {
          const p = parsed[i]?.["typhoon::Typhoon::Typhoon::Deposit"];
          const raw = all[i];
          if (!p || !raw) continue;
          const isPool = ("0x" + p.pool.toString(16)).toLowerCase() === poolAddr.toLowerCase();

          if (!isPool) continue;
          // if (seen.has(raw.transaction_hash)) continue;
          seen.add(raw.transaction_hash);
          matched.push(raw);
        }
        matched.sort((a, b) => (b.block_number || 0) - (a.block_number || 0));
        const top = matched.slice(0, 10);
        const rows = await Promise.all(top.map(async (e, idx) => {
          let ts;
          try { ts = (await provider.getBlockWithTxHashes(e.block_number))?.timestamp; } catch { }
          return {
            index: idx + 1,
            timeAgo: ts ? formatAgo(Number(ts)) : '—',
            blockNumber: e.block_number,
            txHash: e.transaction_hash,
          };
        }));
        setLatest(rows);
      } catch (e) {
        setError('Unable to fetch recent deposits');
      } finally { setLoading(false); }
    }
    fetchLatest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, resolvedTyphoonAddress, token, denomination, poolCount]);

  const Stat = ({ label, value }) => (
    <div className="rounded-md border border-border bg-card/60 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-base font-semibold text-card-foreground">{value}</div>
    </div>
  );

  return (
    <aside className="w-full h-full">
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-md h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2">
          <h3 className="text-card-foreground text-lg font-semibold tracking-tight">Statistics</h3>
          <span className="inline-flex items-center rounded-full bg-accent text-accent-foreground px-2.5 py-0.5 text-xs font-medium">{denomination} {token}</span>
        </div>

        {/* Summary line */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Equal deposits</span>
          <span className="text-card-foreground font-semibold">{poolCount?.toString?.() ?? String(poolCount)}</span>
          <span className="mx-1">•</span>
          <span>Today</span>
          <span className="text-card-foreground font-semibold">{todayDeposits?.toString?.() ?? String(todayDeposits)}</span>
        </div>

        {/* Latest deposits list */}
        <div className="mt-5 flex-1 flex flex-col">
          <h4 className="text-sm text-card-foreground font-medium">Latest deposits</h4>
          {loading ? (
            <div className="mt-2 flex-1 grid place-content-center text-sm text-muted-foreground/90">Loading…</div>
          ) : error ? (
            <div className="mt-2 text-sm text-muted-foreground">{error}</div>
          ) : latest.length === 0 ? (
            <div className="mt-2 flex-1 grid place-content-center text-sm text-muted-foreground/90">
              No recent activity for this pool yet.
            </div>
          ) : (
            (() => {
              const split = Math.ceil(latest.length / 2);
              const left = latest.slice(0, split);
              const right = latest.slice(split);
              const Row = (row, i) => (
                <div key={`${row.blockNumber}-${i}`} className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-card-foreground">
                  <span className="font-mono mr-2">{row.index}.</span>
                  <span className="text-accent">{row.timeAgo}</span>
                </div>
              );
              return (
                <div className="mt-2 flex-1 overflow-auto pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex flex-col gap-2">{left.map((r, i) => Row(r, i))}</div>
                    <div className="flex flex-col gap-2">{right.map((r, i) => Row(r, i + split))}</div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
        <div className="pt-3 text-xs text-muted-foreground">
          Tip: Change token or amount to compare recent activity and anonymity set.
        </div>
      </div>
    </aside>
  )
}
