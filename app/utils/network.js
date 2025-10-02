export function getNodeUrl() {
  const explicit = process.env.NEXT_PUBLIC_RPC_URL;
  if (explicit && typeof explicit === 'string') return explicit;
  const hint = (process.env.NEXT_PUBLIC_CHAIN || '').toLowerCase();
  // Default to sepolia (testnet) if not specified
  if (hint.includes('main')) {
    return 'https://starknet-mainnet.public.blastapi.io/rpc/v0_9';
  }
  // Prefer Blast public endpoint for sepolia (often CORS-enabled)
  return 'https://starknet-sepolia.public.blastapi.io/rpc/v0_9';
}
