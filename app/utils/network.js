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
  const fallbackMain = 'https://g.w.lavanet.xyz:443/gateway/strk/rpc-http/5992507e9e5c513ecab8c5d93accb547';
  const fallbackSep = 'https://g.w.lavanet.xyz:443/gateway/strks/rpc-http/5992507e9e5c513ecab8c5d93accb547';
  return isMain ? (envMainnet || fallbackMain) : (envSepolia || fallbackSep);
}
