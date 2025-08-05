"use client"
import React, { useEffect, useState } from 'react';
import { decrypt, encrypt } from '@metamask/eth-sig-util';
import { RpcProvider, Contract, constants, cairo, CallData } from 'starknet-v7';
import Popup from 'reactjs-popup';
import { createHash } from 'crypto';
import { generateProofCalldata2 } from '../utils/withdrawUtils';
import { bufferToHex } from 'ethereumjs-util';
import { Signature, Wallet } from 'ethers';
import {
    useAccount,
} from "@starknet-react/core";
import ecies from 'ecies-geth';

const provider = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.public.blastapi.io/rpc/v0_8' });
const maxUint256 = (1n << 256n) - 1n;
const maxUint512 = (1n << 512n) - 1n;
const typhoonAddress = process.env.NEXT_PUBLIC_TYPHOON_ADDR
const noteAccountContract = process.env.NEXT_PUBLIC_NOTE_ACCOUNT_ADDR

function NoteList() {
    const { address, account } = useAccount();
    const ethAddressSepolia = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
    const strkAddressSepolia = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
    const ethAddressMainnet = "0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7"
    const strkAddressMainnet = "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D"
    const token = { "0x534e5f4d41494e": [ethAddressMainnet, strkAddressMainnet], "0x534e5f5345504f4c4941": [ethAddressSepolia, strkAddressSepolia] }
    const [receiver, setReceiver] = useState("");
    const [withdrawing, setWithdrawing] = useState(false);
    const [finished, setFinished] = useState(false);
    let noteAccount = localStorage.getItem('noteAcc');
    const [loadingText, setLoadingText] = useState('')

    const [encryptedNotes, setEncryptedNotes] = useState([]);
    const [decryptedNotes, setDecryptedNotes] = useState([]);
    const [notesDenominations, setNotesDenominations] = useState([]);

    useEffect(() => {
        async function fetchNotes() {
            try {
                let acc = new Wallet("0x" + noteAccount);
                const { abi: noteAccountAbi } = await provider.getClassAt(noteAccountContract);
                const ncContract = new Contract(noteAccountAbi, noteAccountContract, provider);
                let compressedNotesData = await ncContract.getNotes(acc.address);
                
                let decryptedNotesAux = []
                for (let i = 0; i < compressedNotesData.length; i++) {
                    let dnaux = []
                    for (let j = 0; j < 25; j += 5) {
                        let recover = (maxUint512 * maxUint512) * compressedNotesData[i][j] + (compressedNotesData[i][j + 1] * (maxUint512 * maxUint256)) + (compressedNotesData[i][j + 2] * maxUint512) + (compressedNotesData[i][j + 3] * maxUint256) + compressedNotesData[i][j + 4]
                        let encrypted = "0x0" + recover.toString(16);
                        const privateKeyBuffer = Buffer.from(noteAccount, 'hex');
                        const decrypted = bufferToHex(await ecies.decrypt(privateKeyBuffer, Buffer.from(encrypted.slice(2), 'hex')));
                        dnaux.push(decrypted);
                    }

                    let note = {
                        "secret": dnaux[0].slice(2).includes("150dd") ? "0x" + dnaux[0].slice(7) : dnaux[0],
                        "nullifier": dnaux[1].slice(2).includes("150dd") ? "0x" + dnaux[1].slice(7) : dnaux[1],
                        "txHash": dnaux[2].slice(2).includes("150dd") ? "0x" + dnaux[2].slice(7) : dnaux[2],
                        "pool": dnaux[3].slice(2).includes("150dd") ? "0x" + dnaux[3].slice(7) : dnaux[3],
                        "day": dnaux[4].slice(2).includes("150dd") ? "0x" + dnaux[4].slice(7) : dnaux[4],
                    }
                    decryptedNotesAux.push(note);
                }
                setDecryptedNotes(decryptedNotesAux);

                let notesDenominationsAux = []
                for (let i = 0; i < decryptedNotes.length; i++) {
                    const poolAddress = decryptedNotes[i].pool;

                    let denomination = await getPoolDenomination(poolAddress);
                    let tokenAddr = await getPoolToken(poolAddress);
                    let cid = await provider.getChainId();
                    let tokenSymbol = token[cid.toString()][0] == tokenAddr ? "ETH" : "STRK";


                    notesDenominationsAux.push(denominationShortener(denomination.toString()) + " " + tokenSymbol);

                }
                setNotesDenominations(notesDenominationsAux);
                setEncryptedNotes(compressedNotesData);
            } catch (error) {
                if (noteAccount == null) {
                    console.log("No note account found, please create or connect to one first.");
                } else {
                    console.error("Error fetching notes:", error);
                }
            }

        }
        noteAccount = localStorage.getItem('noteAcc');

        if (noteAccount != null && noteAccount != "undefined" && noteAccount != "null") {
            fetchNotes();
        }

    }, [noteAccount, encryptedNotes])
    // fn getNotes(self: @ContractState, pubKey: EthAddress) -> Array<(u256, u256, u256, u256, u256, u256, u256)>






    function getInputClassname() {
        let className =
            ' w-full outline-none h-4  appearance-none text-1xl bg-transparent'
        return className
    }

    async function withdrawNote(noteId) {
        setWithdrawing(true);
        let acc = new Wallet("0x" + noteAccount);
        let callData = await generateProofCalldata2(decryptedNotes[noteId].secret.slice(2), decryptedNotes[noteId].nullifier.slice(2), decryptedNotes[noteId].txHash, decryptedNotes[noteId].pool, receiver);
        // createAndDownloadFile(JSON.stringify(callData.map((x) => x.toString())))
        // console.log("pool ",decryptedNotes[noteId].pool)
        const publicKeyBuffer = Buffer.from(acc.signingKey.publicKey.slice(2), 'hex');
        let encryptedNotesAux = encryptedNotes;
        encryptedNotesAux.splice(noteId, 1)
        let msg = bufferToHex(await ecies.encrypt(publicKeyBuffer, Buffer.from(encryptedNotesAux.flat().join(''))))
        let msg_hash_str = createHash('sha256').update(msg).digest('hex')
        let signature = acc.signingKey.sign("0x" + msg_hash_str)
        let encriptedNotesData = [];
        for (let i = 0; i < encryptedNotesAux.length; i++) {
            encriptedNotesData.push(cairo.tuple([cairo.uint256(encryptedNotesAux[i][0]), cairo.uint256(encryptedNotesAux[i][1]), cairo.uint256(encryptedNotesAux[i][2]), cairo.uint256(encryptedNotesAux[i][3]), cairo.uint256(encryptedNotesAux[i][4]), cairo.uint256(encryptedNotesAux[i][5]), cairo.uint256(encryptedNotesAux[i][6]), cairo.uint256(encryptedNotesAux[i][7]), cairo.uint256(encryptedNotesAux[i][8]), cairo.uint256(encryptedNotesAux[i][9]), cairo.uint256(encryptedNotesAux[i][10]), cairo.uint256(encryptedNotesAux[i][11]), cairo.uint256(encryptedNotesAux[i][12]), cairo.uint256(encryptedNotesAux[i][13]), cairo.uint256(encryptedNotesAux[i][14]), cairo.uint256(encryptedNotesAux[i][15]), cairo.uint256(encryptedNotesAux[i][16]), cairo.uint256(encryptedNotesAux[i][17]), cairo.uint256(encryptedNotesAux[i][18]), cairo.uint256(encryptedNotesAux[i][19]), cairo.uint256(encryptedNotesAux[i][20]), cairo.uint256(encryptedNotesAux[i][21]), cairo.uint256(encryptedNotesAux[i][22]), cairo.uint256(encryptedNotesAux[i][23]), cairo.uint256(encryptedNotesAux[i][24])]))
        }
        const { abi: typhoonAbi } = await provider.getClassAt(typhoonAddress);
        const typhoonContract = new Contract(typhoonAbi, typhoonAddress, account);

        const call = typhoonContract.populate('withdraw', { full_proof_with_hints: callData });

        // c.shift()
        // const res = await typhoon.withdraw(call.calldata);
        const multiCall = await account.execute([
            {
                contractAddress: typhoonAddress,
                entrypoint: 'withdraw',
                calldata: call.calldata,
            },
            {
                contractAddress: noteAccountContract,
                entrypoint: 'updateNotes',
                calldata: CallData.compile({
                    pubKey: acc.address,
                    msgHash: cairo.uint256(BigInt("0x" + msg_hash_str).toString()),
                    r: cairo.uint256(BigInt(signature.r).toString()),
                    s: cairo.uint256(BigInt(signature.s).toString()),
                    v: signature.v,
                    noteIndex: cairo.uint256(noteId)
                }),
            }], { version: 2 });
        // fn updateNotes(ref self: ContractState,pubKey: EthAddress, msg_hash: u256, r: u256, s: u256, v: u32  ,newNotes: Span<Span<u256>>)
        await account.waitForTransaction(multiCall.transaction_hash);
        setWithdrawing(false);
        setEncryptedNotes(encryptedNotesAux);
        setFinished(false);
    }

    let className = "rounded-[12px] bg-button-primary bg-blue px-3 py-1 text-background-primary-light transition-all duration-300 hover:rounded-[30px] md:py-4"

    return (<div className="note-list ml-10" >
        <h1 >Note List</h1>
        <ol style={{ maxHeight: "300px", overflow: "auto", padding: "0", justifyContent: "space-between" }}>
            {notesDenominations.map((note, index) =>
                <li key={index} className="flex justify-between w-full" style={{ fontWeight: "bold", padding: "10px", backgroundColor: "white", color: "black", marginBottom: "10px", border: "3px solid black", borderRadius: "5px", alignItems: "center", display: "flex", justifyContent: "space-between" }}>
                    <span className='text' style={{ flex: "1" }}>{note}</span>
                    <Popup trigger={<button style={{ backgroundColor: 'blue', color: 'white', marginRight: '10px' }} className={className}> Withdraw</button>} modal contentStyle={{ borderRadius: '10px', width: "600px" }} open={finished} onClose={() => setFinished(false)}>
                        <div>
                            <div className="lg:border-outline-grey ml-5 basis-5/6 lg:col-span-2 lg:border-r-[1px] lg:border-solid lg:py-4 lg:pl-8">
                                <h2 className="my-4 text-center text-[1.125em] font-bold text-black lg:text-start">
                                    Withdraw Note
                                </h2>
                            </div>
                            {withdrawing ? loadingContent() : <div className="flex">
                                <h2 className="my-4 text-center text-[1.125em] font-bold text-black lg:text-start">
                                    Receiver:
                                </h2>
                                <div className="relative bg-[#212429] p-12 py-6 rounded-xl mb-5 ml-5 border-transparent hover:border-zinc-600">
                                    <div className="flex items-center rounded-xl">
                                        <input
                                            className={getInputClassname()}
                                            type={"text"}
                                            value={receiver}
                                            placeholder={"paste the receiver address..."}
                                            disabled={false}
                                            onChange={(e) => {
                                                setReceiver(e.target.value);
                                            }}
                                        />
                                    </div>
                                </div>

                                <button style={{ backgroundColor: 'blue', color: 'white', marginLeft: '10px' }}
                                    aria-haspopup="dialog"
                                    onClick={async () => await withdrawNote(index)}
                                    className="rounded-[12px]  ml-10 bg-button-primary bg-blue px-4 py-3 text-background-primary-light transition-all duration-300 hover:rounded-[30px] md:py-4"
                                >
                                    Withdraw
                                </button>
                            </div>
                            }

                        </div>
                    </Popup>
                </li>
            )}
        </ol>
    </div>
    );

    function loadingContent() {
        return (
            <div style={{ marginLeft: "auto", marginRight: "auto", width: "50%" }}>
                <img src='/Infinity.svg'></img>
                <div>
                    {loadingText}
                </div>
                Withdrawing...
            </div>
        )
    }
}

function denominationShortener(denomination) {
    if (denomination.length <= 18) {
        return "0." + "0".repeat(18 - denomination.length) + denomination.charAt(0);
    }
    return denomination.slice(0, -18)
}

async function getPoolDenomination(poolAddress) {
    const { abi: poolAbi } = await provider.getClassAt(poolAddress);
    const poolContract = new Contract(poolAbi, poolAddress, provider);
    const denomination = await poolContract.denomination();
    return denomination;
}

async function getPoolToken(poolAddress) {
    const { abi: poolAbi } = await provider.getClassAt(poolAddress);
    const poolContract = new Contract(poolAbi, poolAddress, provider);
    const tokenAddr = await poolContract.token();
    return tokenAddr;
}

function createAndDownloadFile(content) {
    const fileContent = content;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'calldata.json';

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}



export default NoteList;