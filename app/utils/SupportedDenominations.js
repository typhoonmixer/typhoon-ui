export const five = '100'
export const four = '10'
export const three = '1'
export const two = '0.1'
export const one = '0.01'
export const DEFAULT_VALUE = 'Select a pool'

// 1 STRK
// 2 ETH
export const denominationsList = {
     "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d": ['10','100', '1000', '10000', '100000'],
     "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": ['0.001','0.01', '0.1', '1', '10'],
     "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8": ['1','10', '100', '1000', '10000'],
     "0x0719b5092403233201aa822ce928bd4b551d0cdb071a724edd7dc5e5f57b7f34": ['1','10', '100', '1000', '10000'],
     "0x068F5c6a61780768455de69077E07e89787839bf8166dEcfBf92B645209c0fB8": ['1','10', '100', '1000', '10000'],
     "0x0593e034dda23eea82d2ba9a30960ed42cf4a01502cc2351dc9b9881f9931a68": ['0.0001','0.001', '0.01', '0.1', '1'],
     "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac": ['0.0001','0.001', '0.01', '0.1', '1'],
     "0x04daa17763b286d1e59b97c283c0b8c949994c361e426a28f743c67bdfe9a32f": ['0.0001','0.001', '0.01', '0.1', '1'],
     "0x00acc2fa3bb7f6a6726c14d9e142d51fe3984dbfa32b5907e1e76425177875e2": ['100000', '1000000', '10000000', '100000000']
}

export const tokenList = {
     "STRK": "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
     "ETH": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
     "USDC": "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
     "UNO": "0x0719b5092403233201aa822ce928bd4b551d0cdb071a724edd7dc5e5f57b7f34",
     "WBTC": "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
     "tBTC": "0x04daa17763b286d1e59b97c283c0b8c949994c361e426a28f743c67bdfe9a32f",
     "SCHIZODIO": "0x00acc2fa3bb7f6a6726c14d9e142d51fe3984dbfa32b5907e1e76425177875e2",
     "SolvBTC": "0x0593e034dda23eea82d2ba9a30960ed42cf4a01502cc2351dc9b9881f9931a68",
     "USDT": "0x068F5c6a61780768455de69077E07e89787839bf8166dEcfBf92B645209c0fB8"
}

export const tokenToSymbol = {
     [BigInt("0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d").toString()]: "STRK",
     [BigInt("0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7").toString()]: "ETH",
     [BigInt("0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8").toString()]: "USDC",
     [BigInt("0x0719b5092403233201aa822ce928bd4b551d0cdb071a724edd7dc5e5f57b7f34").toString()]: "UNO",
     [BigInt("0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac").toString()]: "WBTC",
     [BigInt("0x04daa17763b286d1e59b97c283c0b8c949994c361e426a28f743c67bdfe9a32f").toString()]: "tBTC",
     [BigInt("0x00acc2fa3bb7f6a6726c14d9e142d51fe3984dbfa32b5907e1e76425177875e2").toString()]: "SCHIZODIO",
     [BigInt("0x0593e034dda23eea82d2ba9a30960ed42cf4a01502cc2351dc9b9881f9931a68").toString()]: "SolvBTC",
     [BigInt("0x068F5c6a61780768455de69077E07e89787839bf8166dEcfBf92B645209c0fB8").toString()]: "USDT"
}

export const tokenDecimals = {
     "STRK": 18,
     "ETH": 18,
     "USDC": 6,
     "UNO": 18,
     "WBTC": 8,
     "tBTC": 18,
     "SCHIZODIO": 18,
     "SolvBTC": 18,
     "USDT": 6
}
