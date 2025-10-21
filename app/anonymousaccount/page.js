"use client"
import React, { useEffect, useState, useRef, use } from 'react'
import { TyphoonSDK } from 'typhoon-sdk';
import { ArrowRight } from "lucide-react";
import { RpcProvider, Contract, hash } from 'starknet-v7';
import { tokenDecimals, tokenToSymbol, tokenList } from '../utils/SupportedDenominations';
import { getCompressedDenomination, getFullDenomination } from '../utils/depositUtils';
import Header from '../components/Header'

import { ChevronDown, Info } from "lucide-react";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import ReactDOM from "react-dom";
import { useSprings, animated } from "react-spring";
import CopyButton from "../utils/CopyButton";
import {
  useAccount,
  useContract,
  useConnect,
  useSendTransaction
} from "@starknet-react/core";
import dotenv from 'dotenv'
dotenv.config()

const typhoonAddress = process.env.NEXT_PUBLIC_TYPHOON_ADDR

export default function Home() {
  const { connectors, connector } = useConnect();
  const provider = new RpcProvider({ nodeUrl: "https://rpc.starknet.lava.build:443" });
  const [note, setNote] = useState('');
  const [complianceContent, setComplianceContent] = useState(<div></div>);
  const { address, account } = useAccount();
  const [balance, setBalance] = useState('0')
  const transferTokens = [
    { name: "STRK", src: "starknetlogo.svg" },
    { name: "ETH", src: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" },
    { name: "SCHIZODIO", src: "schizodio_logo.jpg" },
    { name: "WBTC", src: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png" },
    { name: "tBTC", src: "tbtclogo.png" },
    { name: "USDC", src: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" },
    { name: "UNO", src: "unologo.png" }
  ]
  const [selectedTransferToken, setSelectedTransferToken] = useState(transferTokens[0]);
  const [openTransferTokenDD, setOpenTransferTokenDD] = useState(false);
  const [transferValue, setTransferValue] = useState()
  const [transferReceiverValue, setTransferReceiverValue] = useState('')
  const [minimalRequired, setMinimalRequired] = useState('10')
  const [loading, setLoading] = useState(false)
  const [accLoading, setAccLoading] = useState(false)
  const [split, setSplit] = useState(false)
  const [content, setContent] = useState(transferContent)
  const [validAccounts, setValidAccounts] = useState([])
  const [loadingText, setLoadingText] = useState('')

  const anonAcc = [
    {
      "address": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      "privKey": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      "balances": { "STRK": "100" }
    },
    {
      "address": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      "privKey": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      "balances": { "USDC": "50" }
    }

  ]

  useEffect(() => {
    setContent(transferContent())
    let sdk = new TyphoonSDK()
    async function getMin() {
      console.log(selectedTransferToken.name)
      console.log("selectedTransferToken", selectedTransferToken.name)
      let min = await sdk.get_token_minimal_amount(tokenList[selectedTransferToken.name])

      console.log("compreesed min: ", getCompressedDenomination(min.toString(), tokenDecimals[selectedTransferToken.name]))
      setMinimalRequired(getCompressedDenomination(min.toString(), tokenDecimals[selectedTransferToken.name]))
      console.log("min", minimalRequired)
    }
    getMin()
  }, [selectedTransferToken])

  useEffect(() => {
    // let sdk = new TyphoonSDK()
    // async function loadValidAccounts() {
    //   let accs = await sdk.get_valid_anonymous_accounts(genPrivKey, accAddress, "argentX")
    // }
    setContent(transferContent())
  }, [validAccounts])

  useEffect(() => {
    setContent(loadingContent)
  }, [loadingText])

  useEffect(() => {
    setContent(transferContent())
  }, [openTransferTokenDD])

  useEffect(() => {
    setContent(transferContent())
  }, [minimalRequired])

  useEffect(() => {
    setContent(transferContent())
  }, [split])

  useEffect(() => {
    if (loading) {
      setContent(loadingContent())
    } else {
      setContent(transferContent())
    }
  }, [loading])
  const [springs] = useSprings(validAccounts.length, i => {
    return Object.assign(validAccounts[i], {
      delay: i * 100,
      from: { opacity: 0, transform: "translate3d(100%,0,0)" },
      to: { opacity: 1, transform: "translate3d(0%,0,0)" }
    });
  });

  return (
    <div className='w-full h-screen flex flex-col items-center justify-center bg-[#2D242F]'>
      <Header />
      <div className="container items-center" style={{ justifyContent: 'center', marginLeft: '80px' }}>
        <h1>
          <span className="text-white text-xl font-bold">Typhoon Anonymous Accounts</span>
        </h1>
        <p>
          Typhoon Anonymous accounts will empower you with a second layer of privacy. Create an Anonymous Account on Typhoon to transact freely without exposing your real address to observers. Enjoy the freedom of anonymity, protect your identity in DeFi protocols, and participate anonymously in the Starknet ecosystem. Your privacy matters, and we're here to safeguard it.
        </p>
        <p>
          To deploy an Anonymous Account, you need to deposit an arbitrary amount into any Typhoon's pools first, then this amount is mixed and sended to your anonymous account, this ensure that there is no link between you and your anonymous account and at the same time you have total control over your anonymous account.
        </p>
        <p>
          IF YOU WANT TO USE YOUR ANONYMOUS ACCOUNT IN THE BROWSER EXTENSION, MAKE SURE TO DEPLOY IT USING A READY(ARGENT) ACCOUNT.
        </p>
        <div className='flex' style={{ justifyContent: 'center', marginTop: '20px' }}>
          <div className='relative bg-zinc-900 w5-[35%] p-4 px-6 rounded-xl  min-h-[200px]' style={{ justifyContent: 'center', width: '600px', height: '350px', marginBottom: '100px' }}>
            {content}
            <button
              style={{ position: 'absolute', bottom: '5px', right: '16px', left: '16px', width: '500' }}
              className={getBtnClassName()}
              disabled={loading}
              onClick={async () => {
                if (address != undefined && account != undefined) {
                  handleAnonymousAccountTransfer()
                }
                console.log("connector", connector.id)
              }}
            >
              Deploy
            </button>
          </div>
          {accLoading? accLoadingContent() :validAccounts.length > 0 ? <div style={{
            margin: 0,
            padding: 0,
            height: "100%",
            width: "100%",
            overflow: "hidden",
            userSelect: "none",
            fontFamily: "Raleway",
            display: "flex",
            justifyContent: "center",
          }}>
            <div className="content">
              {springs.map((props, i) => (
                <animated.div
                  key={i}
                  style={props}
                  children={<Item account={validAccounts[i]} />}
                />
              ))}
            </div>
          </div> : <button
            style={{ position: 'relative', bottom: '5px', right: '16px', left: '16px', width: '200', height: '60px' }}
            className={getBtnClassName()}
            disabled={loading}
            onClick={async () => {
              if (address != undefined) {
                setAccLoading(true)
                let sdk = new TyphoonSDK()
                let tm = sdk.get_typedMessage()
                let sig = await account.signMessage(tm)
                let privText = Array.from("head").map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join('')
                let genPrivKey = hash.computePoseidonHash(hash.computePoseidonHash(sig[1], sig[2]), BigInt('0x' + privText))

                let accs = await sdk.get_valid_anonymous_accounts(genPrivKey, address, connector.id)
                setValidAccounts(accs)
                setAccLoading(false)
              }
              console.log("connector", connector.id)
            }}
          >
            Search your Anonymous Accounts
          </button>}
        </div>
      </div>
    </div >

  );

  function Item({ account }) {
    return (

      <div className='flex flex-col justify-start' style={{ justifyContent: "flex-start", width: 630, backgroundColor: "blue", marginBottom: "5px", borderRadius: "7px" }}>
        <div className='flex'>
          <span className='text-md text-left ml-5'>Address: {account.address}</span>
          <CopyButton style={{ color: "white" }}
            copyText={account.address}
            className="flex items-center gap-2 text-sm text-yellow-primary"
            iconClassName="rounded-full bg-[--link-card] p-1 text-yellow-primary dark:bg-black"
          />
        </div>
        <div className='flex'>
          <span className='text-md text-left ml-5'>PrivKey: {account.privKey}</span>
          <CopyButton style={{ color: "white" }}
            copyText={account.privKey}
            className="flex items-center gap-2 text-sm text-yellow-primary"
            iconClassName="rounded-full bg-[--link-card] p-1 text-yellow-primary dark:bg-black"
          />
        </div>

        <span className='text-md text-left ml-5'>{Object.keys(account)[2]}: {account[Object.keys(account)[2]]}</span>

      </div>


    );
  }

  function getBtnClassName() {
    let className = 'p-4  my-2 rounded-xl'
    className +=
      address === undefined
        ? ' text-zinc-400 bg-zinc-800 pointer-events-none'
        : ' bg-blue-700'
    return className
  }

  function summarizeNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return 'Invalid input';

    const suffixes = [
      { threshold: 1e9, suffix: 'B' },
      { threshold: 1e6, suffix: 'M' },
      { threshold: 1e3, suffix: 'k' },
      { threshold: 1, suffix: '' }
    ];

    for (let { threshold, suffix } of suffixes) {
      if (Math.abs(num) >= threshold) {
        const value = (num / threshold).toFixed(1).replace(/\.0$/, '');
        return `${value}${suffix}`;
      }
    }
  }

  async function get_balance(acc) {
    const { abi: poolAbi } = await provider.getClassAt(tokenList[selectedTransferToken.name]);
    const poolC = new Contract(poolAbi, tokenList[selectedTransferToken.name], provider);
    let balance = await poolC.balanceOf(acc);
    return balance.toString()
  }

  async function handleAnonymousAccountTransfer() {
    console.log("connector", typeof connector.id)
    setLoading(true)
    setLoadingText('Generating deposit calls...')
    let sdk = new TyphoonSDK()
    let depositCalls = await sdk.generate_approve_and_deposit_calls(BigInt(getFullDenomination(transferValue, tokenDecimals[selectedTransferToken.name])), tokenList[selectedTransferToken.name])
    setLoadingText('Executing deposit transaction...')
    let res = await account.execute(depositCalls)
    await provider.waitForTransaction(res.transaction_hash);
    await sdk.download_notes(res.transaction_hash)
    let tm = sdk.get_typedMessage()
    let sig = await account.signMessage(tm)
    let privText = Array.from("head").map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    let genPrivKey = hash.computePoseidonHash(hash.computePoseidonHash(sig[1], sig[2]), BigInt('0x' + privText))
    let nextText = Array.from("next").map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    let validacc = await sdk.get_valid_anonymous_accounts(genPrivKey, address, connector.id)
    let lastPrivKey = ""
    if (validacc.length > 0) {
      lastPrivKey = hash.computePoseidonHash(BigInt(validacc[validacc.length - 1].privKey), BigInt('0x' + nextText))
    }
    else {
      lastPrivKey = genPrivKey
    }
    setLoadingText('Withdrawing to anonymous account...')
    await sdk.withdraw_to_anonymous_account(res.transaction_hash, lastPrivKey, split, address, connector.id)
    setLoading(false)
    setLoadingText('')
    setTransferValue('')
    // const { abi: typhoonAbi } = await provider.getClassAt(typhoonAddress);
    // const typhoonContract = new Contract(typhoonAbi, typhoonAddress, account);
    // for (let i = 0; i < anoncalls.length; i++) {
    //   const call = typhoonContract.populate('withdraw', { full_proof_with_hints: anoncalls[i] });
    //   const multiCall = await account.execute({
    //     contractAddress: typhoonAddress,
    //     entrypoint: 'withdraw',
    //     calldata: call.calldata,
    //   });
    //   await account.waitForTransaction(multiCall.transaction_hash);
    // }

  }

  function transferContent() {

    if (address != undefined) {
      get_balance(address).then((b) => {
        let cd = getCompressedDenomination(b, tokenDecimals[selectedTransferToken.name])

        setBalance(cd)


      })
    }

    return (
      <div className='items-center'>
        <div className='mb-5 mt-5 text-white items-center '>
          Deploy Anonymous Account
        </div>

        <div className="w-full h-full p-4 bg-zinc-800 rounded-2xl shadow-md">
          {/* Header */}
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span className="text-white text-base">Amount</span>
            <span className="text-white text-base">
              Balance: <span className="font-medium text-white">{`${balance} ${selectedTransferToken.name}`}</span>
            </span>
          </div>

          {/* Input row */}
          <div className="flex items-center gap-3 border rounded-xl p-3 bg-zinc-900">
            {/* Token selector */}
            <div className="relative w-40">
              <button className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-lg shadow-sm " onClick={() => { setOpenTransferTokenDD(!openTransferTokenDD) }}>
                <img
                  src={selectedTransferToken.src}
                  alt={selectedTransferToken.name}
                  className="w-5 h-5"
                />
                <span className="font-medium">{selectedTransferToken.name}</span>
                <ChevronDown size={16} className="text-white" />
              </button>
              {/* Dropdown */}
              {openTransferTokenDD ? (
                <div className="absolute mt-1 w-full bg-[#1c1c1c] border border-gray-600 rounded-xl shadow-lg z-10">
                  {transferTokens.map((token) => (
                    <button
                      key={token.name}
                      onClick={() => {
                        setSelectedTransferToken(token);
                        setOpenTransferTokenDD(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded-lg"
                    >
                      <img src={token.src} alt={token.name} className="w-5 h-5 rounded-full" />
                      {token.name}
                    </button>
                  ))}
                </div>
              ) : <div></div>}
            </div>


            {/* Amount input */}
            <input
              type='number'
              inputMode="decimal"
              placeholder="0"
              value={transferValue}
              onChange={(e) => setTransferValue(e.target.value)}
              className="flex-1 min-w-0 text-right text-2xl font-medium bg-zinc-900 outline-none placeholder:text-gray-400 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [moz-appearance:textfield]"

            />
          </div>

          <div className="text-right text-white text-base mt-1">
            Minimum amount required: {minimalRequired[0] == '0' ? minimalRequired : summarizeNumber(Number(minimalRequired))} {selectedTransferToken.name}
          </div>
        </div>
        <FormGroup className='' >

          <FormControlLabel disableTypography={{ color: 'white' }} control={<Switch
            checked={split}
            onChange={(_, checked) => setSplit(checked)}
          />} label="Split" />
        </FormGroup>

      </div>
    )
  }

  function loadingContent() {
    return (
      <div style={{ marginLeft: "auto", marginRight: "auto", width: "50%" }}>
        <img src='/Infinity.svg'></img>
        <div>
          {loadingText}
        </div>
      </div>
    )
  }

  function accLoadingContent() {
    return (
      <div style={{ marginLeft: "auto", marginRight: "auto", width: "50%" }}>
        <img src='/Infinity.svg'></img>
        
      </div>
    )
  }

}

