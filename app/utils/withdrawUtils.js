
import * as garaga from 'garaga';

import { RpcProvider, Contract } from 'starknet';
import Hasher from './mimc5.js';
import { commitmentAndNullifierHash } from './depositUtils.js';
import vk from './verification_key.json' assert { type: "json" }
import { parseGroth16ProofFromObject, parseGroth16VerifyingKeyFromObject } from './parsingUtils';

import * as snarkjs from "snarkjs";

const provider = new RpcProvider({ nodeUrl: 'https://free-rpc.nethermind.io/sepolia-juno/v0_7' });

const typhoonAddress = process.env.NEXT_PUBLIC_TYPHOON_ADDR

const { abi: typhoonAbi } = await provider.getClassAt(typhoonAddress);

export async function generateProofCalldata(note, recipient) {
    await garaga.init();
    const typhoon = new Contract(typhoonAbi, typhoonAddress, provider);

    let receipt = await provider.waitForTransaction(note.txHash)
    let depositEvent = typhoon.parseEvents(receipt)[0]["typhoon::Typhoon::Typhon::Deposit"]

    let [commitment, nullifierHash] = await commitmentAndNullifierHash(note.secret, note.nullifier)

    let index = depositEvent.commitments.indexOf(commitment)

    let result = getRootPairingsDirections(depositEvent.insertedIndexs[index], commitment, note.day, depositEvent.subtreeHelper[index])

    let proofInput = {
        "root": result.r,
        "nullifierHash": nullifierHash,
        "day": BigInt(note.day),
        "recipient": BigInt(recipient),
        "relayer": BigInt(0), 
        "relayerFee": BigInt(0),
        "secret": BigInt(note.secret),
        "nullifier": BigInt(note.nullifier),
        "pathElements": result.p,
        "pathIndices": result.d
    }
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(proofInput, "withdraw.wasm", "withdraw_0001.zkey");

    let parsedProof = parseGroth16ProofFromObject(proof, publicSignals.map(x => BigInt(x)))

    let parsedVK = parseGroth16VerifyingKeyFromObject(vk)
    const groth16Calldata = garaga.getGroth16CallData(parsedProof, parsedVK, garaga.CurveId.BN254);
    // The first element of the calldata is "length" and is not compatible with Cairo 1.0, so it is removed
    groth16Calldata.shift()

    return groth16Calldata
}

function getRootPairingsDirections(rootIndex, commitment, day, subtreeHelper) {
    let hasher = new Hasher()
    let currentLevelHash = hasher.MiMC5Sponge([commitment.toString(), day], '0')
    let currentIndex = Number(rootIndex)
    let hashPairings = []
    let hashDirections = []
    let left = BigInt('0')
    let right = BigInt('0')
    let levels = 10
    let sthi = 0

    for (let i = 0; i < levels; i++) {
        if (currentIndex % 2 == 0) {
            left = currentLevelHash
            right = zeros(i)
            hashPairings.push(zeros(i))
            hashDirections.push(0)
        } else {
            left = subtreeHelper[sthi]
            right = currentLevelHash
            hashPairings.push(BigInt(subtreeHelper[sthi]))
            hashDirections.push(1)
            sthi += 1
        }
        currentLevelHash = hasher.MiMC5Sponge([left.toString(), right.toString()], '0')
        currentIndex = Math.trunc(currentIndex / 2)
    }

    return {
        r: currentLevelHash,
        p: hashPairings,
        d: hashDirections
    }

}

export function JSONInputStringToList(input) {
    let inputList = input.split('}')
    let newList = []
    // add brackets back
    let i = 0
    for (i; i < inputList.length; i++) {
        if (!inputList[i].includes('}')) {
            inputList[i] = inputList[i] + "}"
        }

    }
    return inputList.filter(i => i !== "}")
}

function zeros(i) {
    const values = [
        "0x2fe54c60d3acabf3343a35b6eba15db4821b340f76e741e2249685ed4899af6c",
        "0x256a6135777eee2fd26f54b8b7037a25439d5235caee224154186d2b8a52e31d",
        "0x1151949895e82ab19924de92c40a3d6f7bcb60d92b00504b8199613683f0c200",
        "0x20121ee811489ff8d61f09fb89e313f14959a0f28bb428a20dba6b0b068b3bdb",
        "0x0a89ca6ffa14cc462cfedb842c30ed221a50a3d6bf022a6a57dc82ab24c157c9",
        "0x24ca05c2b5cd42e890d6be94c68d0689f4f21c9cec9c0f13fe41d566dfb54959",
        "0x1ccb97c932565a92c60156bdba2d08f3bf1377464e025cee765679e604a7315c",
        "0x19156fbd7d1a8bf5cba8909367de1b624534ebab4f0f79e003bccdd1b182bdb4",
        "0x261af8c1f0912e465744641409f622d466c3920ac6e5ff37e36604cb11dfff80",
        "0x0058459724ff6ca5a1652fcbc3e82b93895cf08e975b19beab3f54c217d1c007",
        "0x1f04ef20dee48d39984d8eabe768a70eafa6310ad20849d4573c3c40c2ad1e30",
        "0x1bea3dec5dab51567ce7e200a30f7ba6d4276aeaa53e2686f962a46c66d511e5",
        "0x0ee0f941e2da4b9e31c3ca97a40d8fa9ce68d97c084177071b3cb46cd3372f0f",
        "0x1ca9503e8935884501bbaf20be14eb4c46b89772c97b96e3b2ebf3a36a948bbd",
        "0x133a80e30697cd55d8f7d4b0965b7be24057ba5dc3da898ee2187232446cb108",
        "0x13e6d8fc88839ed76e182c2a779af5b2c0da9dd18c90427a644f7e148a6253b6",
        "0x1eb16b057a477f4bc8f572ea6bee39561098f78f15bfb3699dcbb7bd8db61854",
        "0x0da2cb16a1ceaabf1c16b838f7a9e3f2a3a3088d9e0a6debaa748114620696ea",
        "0x24a3b3d822420b14b5d8cb6c28a574f01e98ea9e940551d2ebd75cee12649f9d",
        "0x198622acbd783d1b0d9064105b1fc8e4d8889de95c4c519b3f635809fe6afc05",
        "0x29d7ed391256ccc3ea596c86e933b89ff339d25ea8ddced975ae2fe30b5296d4",
        "0x19be59f2f0413ce78c0c3703a3a5451b1d7f39629fa33abd11548a76065b2967",
        "0x1ff3f61797e538b70e619310d33f2a063e7eb59104e112e95738da1254dc3453",
        "0x10c16ae9959cf8358980d9dd9616e48228737310a10e2b6b731c1a548f036c48",
        "0x0ba433a63174a90ac20992e75e3095496812b652685b5e1a2eae0b1bf4e8fcd1",
        "0x019ddb9df2bc98d987d0dfeca9d2b643deafab8f7036562e627c3667266a044c",
        "0x2d3c88b23175c5a5565db928414c66d1912b11acf974b2e644caaac04739ce99",
        "0x2eab55f6ae4e66e32c5189eed5c470840863445760f5ed7e7b69b2a62600f354",
        "0x002df37a2642621802383cf952bf4dd1f32e05433beeb1fd41031fb7eace979d",
        "0x104aeb41435db66c3e62feccc1d6f5d98d0a0ed75d1374db457cf462e3a1f427",
        "0x1f3c6fd858e9a7d4b0d1f38e256a09d81d5a5e3c963987e2d4b814cfab7c6ebb",
        "0x2c7a07d20dff79d01fecedc1134284a8d08436606c93693b67e333f671bf69cc"
    ];

    if (i < 0 || i >= values.length) {
        throw new Error("Index out of range");
    }

    return BigInt(values[i]);
}
