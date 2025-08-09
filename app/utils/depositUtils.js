import { one, two, three, four, five } from "./SupportedDenominations";
import { ethers } from 'ethers'
import $u from './$u.js';
const wc = require("./witness_calculator.js");
import { RpcProvider, Contract, constants, types, hash, events, CallData, num } from 'starknet-v7';
const typhoonAddress = process.env.NEXT_PUBLIC_TYPHOON_ADDR
const provider = new RpcProvider({ nodeUrl: "https://starknet-mainnet.public.blastapi.io/rpc/v0_8" });


export async function fetchDeposits(pool) {
    const lastBlock = await provider.getBlock('latest');
    const keyFilter = [[num.toHex(hash.starknetKeccak('Deposit'))]];
    // 1309463 is the block where typhoon got deployed
    let events = await getDepositEvents(1671756, lastBlock.block_number, keyFilter)
    
    let filteredEvents = events.filter(val => val.pool == pool)
    
    // let levelArr = []
    // let ll = lvFullIndex % 4n
    // for (let i = 0; i < Number(ll.toString()); i++) {
    //     levelArr[i] = filteredEvents[(filteredEvents.length - 1) - i].value
    // }
    return filteredEvents
}

async function getDepositEvents(from_block_number, to_block_number, filter) { 
    let allEvents = []
    let continuationToken = '0';
    while (continuationToken != undefined) {
        const eventsList = await provider.getEvents({
            address: typhoonAddress,
            from_block: { block_number: from_block_number },
            to_block: { block_number: to_block_number },
            keys: filter,
            chunk_size: 1000,
            continuation_token: continuationToken === '0' ? undefined : continuationToken,
        });
        continuationToken = eventsList.continuation_token;
        allEvents = allEvents.concat(eventsList.events)
    }

    const { abi: typhoonAbi } = await provider.getClassAt(typhoonAddress);
    const abiEvents = events.getAbiEvents(typhoonAbi);
    const abiStructs = CallData.getAbiStruct(typhoonAbi);
    const abiEnums = CallData.getAbiEnum(typhoonAbi);
    const parsed = events.parseEvents(allEvents, abiEvents, abiStructs, abiEnums);

    return parsed.map((e) => e["typhoon::Typhoon::Typhoon::Deposit"])
}

export function generateSecretAndNullifier() {
    const secret = uint8ArrayTo256BitBigInt(ethers.randomBytes(32)).toString();
    const nullifier = uint8ArrayTo256BitBigInt(ethers.randomBytes(32)).toString();
    return [secret, nullifier]
}

function uint8ArrayTo256BitBigInt(uint8Array) {
    if (uint8Array.length !== 32) {
      throw new Error("Uint8Array must be exactly 32 bytes for a 256-bit integer.");
    }
  
    let result = BigInt(0);
    for (const byte of uint8Array) {
      result = (result << BigInt(8)) + BigInt(byte);
    }
  
    return result;
}

export async function commitmentAndNullifierHash(secret, nullifier) {
    const input = {
        secret: BigInt(secret),
        nullifier: BigInt(nullifier)
    };
    var res = await fetch("deposit.wasm");
    var buffer = await res.arrayBuffer();

    var depositWC = await wc(buffer);

    const r = await depositWC.calculateWitness(input, 0);

    const commitment = r[1];
    const nullifierHash = r[2];

    return [commitment, nullifierHash]
}

export function allowancePerPool(amount) {
    let pools = poolsToNumber()
    let poolsAllowance = []
    let depositsCount = 0
    let res = amount.toString().includes('.')? Number(amount.toString().split('.').join('')) : amount
    for (let i= 0, c = pools.length-1; i < pools.length; i++, c--) {
        if (res > pools[i]) {
            let aux = res % pools[i]
            poolsAllowance[c] = res - aux
            depositsCount = depositsCount + (poolsAllowance[c] / pools[i])
            res = aux
            
        } else {
            poolsAllowance[c] = 0
        }
    }
    return [poolsAllowance, depositsCount]
}



export function allowanceCallsPerPool(allowancePerPool) {
    let poolsNumber = poolsToNumber();
    let poolCalls = []
    for (let i = 0; i < allowancePerPool.length; i++) {
        if (allowancePerPool[i] == 0) {
            poolCalls[i] = 0
        } else {
            poolCalls[i] = allowancePerPool[i] / poolsNumber[i]
        }

    }
    return poolCalls
}

export function poolsToNumber() {
    let pools = []
    pools[0] = Number(`${five + '0'.repeat(18)}`);
    pools[1] = Number(`${four + '0'.repeat(18)}`);
    pools[2] = Number(`${three + '0'.repeat(18)}`);
    pools[3] = Number(`${two.split('.')[1] + '0'.repeat(17)}`);
    pools[4] = Number(`${one.split('.')[1] + '0'.repeat(16)}`);
    return pools
}

export function getFullDenomination(denomination) {
    if(denomination.includes('.')){
        let sDenomination = denomination.split('.')
        let pos = 0
        for(let char of sDenomination[1]){
            if(char == '1'){
                break
            }
            pos += 1
        }
        return '1' + '0'.repeat(18 - (pos+1))
    } else {
        return denomination + '0'.repeat(18)
    }
}
