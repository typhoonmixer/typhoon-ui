import { describe, it, expect } from 'bun:test'
import { RpcProvider, Contract } from 'starknet'
import typhoonMain from '../typhoon.json' assert { type: 'json' }
import typhoonTestnet from '../typhoon-testnet.json' assert { type: 'json' }
import { tokenList, tokenDecimals, denominationsList } from '../app/utils/SupportedDenominations'

const DEFAULT_SEPOLIA = 'https://starknet-sepolia.public.blastapi.io/rpc/v0_9'

describe('Starknet RPC provider and contracts', () => {
  const nodeUrl = process.env.NEXT_PUBLIC_RPC_URL || DEFAULT_SEPOLIA
  const provider = new RpcProvider({ nodeUrl })

  let chainId: string
  let typhoonAddr: string | null = null
  let typhoonAbi: any[] | null = null
  let typhoon: Contract | null = null

  it('getChainId returns a bigint', async () => {
    chainId = await provider.getChainId()
    expect(typeof chainId).toBe('string')
  })

  it('getBlock latest returns a block', async () => {
    const block: any = await provider.getBlock('latest')
    expect(block).toBeDefined()
    expect(block).toHaveProperty('status')
    expect(block).toHaveProperty('block_number')
  })

  it('resolve Typhoon address and load ABI', async () => {
    const typhoonAddr = process.env.NEXT_PUBLIC_TYPHOON_ADDR
    expect(typhoonAddr).toBeTruthy()
    const klass: any = await provider.getClassAt(typhoonAddr as string)
    let abi: any = klass?.abi
    expect(Array.isArray(abi)).toBe(true)
    typhoonAbi = abi
    typhoon = new Contract({abi: typhoonAbi, address: typhoonAddr, providerOrAccount: provider})
  })

  it('calls Typhoon.getPool and reads pool views', async () => {
    if (!typhoon) {
      // Skip gracefully if not available on this network
      expect(typhoon).toBeTruthy()
      return
    }
    const tokenAddr = tokenList['STRK']
    const denom = getFullDenomination(denominationsList[tokenAddr][0], tokenDecimals['STRK'])
    const poolFelt: any = await (typhoon as any).getPool(tokenAddr, denom)
    const poolAddr = '0x' + BigInt(poolFelt).toString(16)
    const poolKlass: any = await provider.getClassAt(poolAddr)
    let poolAbi: any = poolKlass?.abi
    if (typeof poolAbi === 'string') poolAbi = JSON.parse(poolAbi)
    expect(Array.isArray(poolAbi)).toBe(true)
    const pool = new Contract({abi: poolAbi, address: poolAddr, providerOrAccount: provider})
    const day: any = await (pool as any).currentDay()
    expect(typeof day === 'bigint' || typeof day === 'number').toBe(true)
    if (typeof (pool as any).getCount === 'function') {
      const count: any = await (pool as any).getCount()
      expect(typeof count === 'bigint' || typeof count === 'number').toBe(true)
    }
  })

  it('fails to create Contract if ABI not normalized (replicates browser error)', async () => {
    if (!typhoonAddr) {
      expect(typhoonAddr).toBeTruthy()
      return
    }
    const klass: any = await provider.getClassAt(typhoonAddr as string)
    // Intentionally pass the whole class or undefined ABI to simulate misuse
    let threw = false
    try {
      // @ts-expect-error: deliberate misuse to reproduce error
      const c = new Contract(klass as any, typhoonAddr as string, provider)
      // Silence unused var
      void c
    } catch (e: any) {
      threw = true
      // Optional: the internal error usually references 'find' on abi
      expect(String(e?.message || e)).toMatch(/find|ABI/i)
    }
    expect(threw).toBe(true)
  })
})

function getFullDenomination(denomination: string, decimals: number): string {
  if (denomination.includes('.')) {
    const sDenomination = denomination.split('.')
    let pos = 0
    for (const char of sDenomination[1]) {
      if (char === '1') break
      pos += 1
    }
    return '1' + '0'.repeat(decimals - (pos + 1))
  } else {
    return denomination + '0'.repeat(decimals)
  }
}
