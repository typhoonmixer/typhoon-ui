"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { useNetwork, useProvider } from "@starknet-react/core";
import { Contract, hash } from 'starknet';
import { mainnet } from '@starknet-react/chains';
import typhoonMain from '../../typhoon.json' assert { type: 'json' }
import typhoonTestnet from '../../typhoon-testnet.json' assert { type: 'json' }
import { getFullDenomination } from '../utils/depositUtils';
import { tokenDecimals } from '../utils/SupportedDenominations';
// Note list panel removed per design

export default function ReadPanel({
  token,
  denomination,
  poolCount,
  todayDeposits,
  overallDeposits,
}) {
  const { provider } = useProvider();
  const { chain } = useNetwork();

  const resolvedTyphoonAddress = useMemo(() => {
    const envAddr = process.env.NEXT_PUBLIC_TYPHOON_ADDR;
    if (envAddr && envAddr.startsWith('0x')) return envAddr;
    const isMainnet = chain?.id === mainnet.id;
    return isMainnet ? typhoonMain?.typhoon : typhoonTestnet?.typhoon;
  }, [chain?.id]);

  // Token mapping (simple subset used in app)
  const tokenToAddress = {
    STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    ETH:  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    USDC: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
    UNO:  "0x0719b5092403233201aa822ce928bd4b551d0cdb071a724edd7dc5e5f57b7f34",
    WBTC: "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
    tBTC: "0x04daa17763b286d1e59b97c283c0b8c949994c361e426a28f743c67bdfe9a32f",
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
    if (minutes < 60) return `${minutes} minute${minutes!==1?'s':''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours!==1?'s':''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days!==1?'s':''} ago`;
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
        if (!typhoonAbi) throw new Error('Typhoon ABI unavailable');
        const typhoon = new Contract({ abi: typhoonAbi, address: resolvedTyphoonAddress, providerOrAccount: provider });
        const denomFull = getFullDenomination(denomination, tokenDecimals[token]);
        const pool = await typhoon.getPool(tokenToAddress[token], denomFull);
        const poolAddr = '0x' + pool.toString(16);

        // Get latest events near the tip; use bounded window
        const current = await provider.getBlockNumber();
        const fromBlock = Math.max(0, Number(current) - 15000); // window
        const res = await provider.getEvents({
          address: poolAddr,
          from_block: { block_number: fromBlock },
          to_block: { block_number: Number(current) },
          chunk_size: 100,
        });

        // Prefer deposit-like events by selector, fallback to all
        const selectors = [
          hash.getSelectorFromName('Deposit')?.toLowerCase?.(),
          hash.getSelectorFromName('Deposited')?.toLowerCase?.(),
          hash.getSelectorFromName('NewDeposit')?.toLowerCase?.(),
        ].filter(Boolean);
        const all = res?.events || [];
        const filtered = all.filter(e => selectors.includes(String(e?.keys?.[0] || '').toLowerCase()));
        const evs = (filtered.length ? filtered : all).sort((a,b) => (b.block_number||0) - (a.block_number||0));
        const top = evs.slice(0, 10);

        // Map to time ago using block timestamps
        const out = [];
        for (let i = 0; i < top.length; i++) {
          const e = top[i];
          let ts = undefined;
          try {
            const blk = await provider.getBlockWithTxHashes(e.block_number);
            ts = blk?.timestamp;
          } catch {}
          out.push({
            index: Math.max(0, Number(poolCount || 0) - i),
            timeAgo: ts ? formatAgo(Number(ts)) : '—',
            blockNumber: e.block_number,
            txHash: e.transaction_hash,
          });
        }
        setLatest(out);
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
          <span className="mx-1">•</span>
          <span>Total</span>
          <span className="text-card-foreground font-semibold">{overallDeposits?.toString?.() ?? String(overallDeposits)}</span>
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
