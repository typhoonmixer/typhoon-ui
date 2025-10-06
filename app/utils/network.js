export function getNodeUrl() {
  // Legacy single URL override
  const explicit = process.env.NEXT_PUBLIC_RPC_URL;
  if (explicit && typeof explicit === 'string') return explicit;

  const envSepolia = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;
  const envMainnet = process.env.NEXT_PUBLIC_MAINNET_RPC_URL;

  let hint = (process.env.NEXT_PUBLIC_CHAIN || '').toLowerCase();
  if (typeof window !== 'undefined') {
    try {
      const ls = (localStorage.getItem('preferredChain') || '').toLowerCase();
      if (ls) hint = ls;
    } catch {}
  }

  const isMain = hint.includes('main');
  const fallbackMain = 'https://starknet-mainnet.public.blastapi.io/rpc/v0_9';
  const fallbackSep = 'https://starknet-sepolia.public.blastapi.io/rpc/v0_9';
  return isMain ? (envMainnet || fallbackMain) : (envSepolia || fallbackSep);
}
