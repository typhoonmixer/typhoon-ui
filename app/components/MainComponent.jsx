"use client"
import React, { useEffect, useState, useRef, use } from 'react'
import Popup from 'reactjs-popup';
import { Wallet, Signature, verifyMessage, recoverAddress } from 'ethers';

import { bufferToHex } from 'ethereumjs-util';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { createHash, sign } from 'crypto-browserify';
import { RpcProvider, Contract, WalletAccount, CallData, cairo, RPC } from 'starknet';

import WithdrawField from './WithdrawField'
import toast, { Toaster } from 'react-hot-toast'
import { DEFAULT_VALUE, ETH, STRK } from '../utils/SupportedCoins'
import DepositField from './DepositField'
import { denominationsList, one, tokenList, tokenDecimals } from '../utils/SupportedDenominations'

// import { CoinSelector, DenominationSelector } from './Selector';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@nextui-org/react'
import { allowancePerPool, commitmentAndNullifierHash, generateSecretAndNullifier,getCompressedDenomination, getFullDenomination, poolsToNumber } from '../utils/depositUtils';
import { JSONInputStringToList, generateProofCalldata } from '../utils/withdrawUtils';
import NoteList from './NoteList';
import typhoonAbi from '../utils/typhoon_abi.json' assert { type: "json" }

import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import axios from "axios";

import {
  useAccount,
  useContract,
  useSendTransaction
} from "@starknet-react/core";
import { ChevronDown } from "lucide-react";
import { TyphoonSDK } from 'typhoon-sdk'



import dotenv from 'dotenv'
dotenv.config()

const provider = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.public.blastapi.io/rpc/v0_8' });
const typhoonAddress = process.env.NEXT_PUBLIC_TYPHOON_ADDR
const noteAccountContract = process.env.NEXT_PUBLIC_NOTE_ACCOUNT_ADDR
const maxUint256 = (1n << 256n) - 1n;
const maxUint512 = (1n << 512n) - 1n;

const MainComponent = () => {
  const { sendAsync, data, status, isSuccess } = useSendTransaction({ calls: [] });
  const { address, account } = useAccount();


  let d = [{
    "id": "0",
    "denomination": 1000,
    "coin": "STRK"
  }]

  const [srcToken, setSrcToken] = useState(STRK)
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')

  const [rewardMode, setRewardMode] = useState(true)




  const tokenToAddress = {
    "STRK": "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    "ETH": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    "USDC": "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
    "UNO": "0x0719b5092403233201aa822ce928bd4b551d0cdb071a724edd7dc5e5f57b7f34",
    "WBTC": "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
    "tBTC": "0x04daa17763b286d1e59b97c283c0b8c949994c361e426a28f743c67bdfe9a32f"
  }

  const [noteValue, setNoteValue] = useState("")
  const [receiverValue, setReceiverValue] = useState("")

  const [telegramValue, setTelegramValue] = useState("")

  const noteValueRef = useRef()
  const receiverValueRef = useRef(null)

  const telegramInputRef = useRef()

  const depositRef = useRef()
  const [paymaster, setPaymaster] = useState(true)

  const specificRef = useRef()

  const ENTER_AMOUNT = 'Enter an amount'
  const CONNECT_WALLET = 'Connect wallet'
  const DEPOSIT = 'Deposit'
  const PRIVATE_TRANSFER = "Transfer"

  const WITHDRAW = 'Withdraw'
  const TRANSFER = 'Private Transfer'

  const [selectedNavItem, setSelectedNavItem] = useState(DEPOSIT)

  const [noteAcc, setNoteAcc] = useState("");
  const [proofElement, setProofElement] = useState([])
  const [downloaded, setDownloaded] = useState(false)

  const nObj = {
    setValue: setNoteValue,
    holder: "note",
    disabled: false,
    value: noteValue
  }

  const rObj = {
    setValue: setReceiverValue,
    holder: "0x",
    disabled: false,
    value: receiverValue
  }

  const [receiverObj, setReceiverObj] = useState(rObj)
  const [noteObj, setNoteObj] = useState(nObj)

  const [noteComp, setNoteComp] = useState()
  const [receiverComp, setReceiverComp] = useState()

  const [denomination, setDenomination] = useState(denominationsList[tokenToAddress["STRK"]][0])

  const [openDepositOp, setOpenDepositOp] = useState(false)

  const [specificValue, setSpecificValue] = useState()

  const [selectedDepositType, setSelectedDepositType] = useState("Defined denominations")

  const dTypes = [
    { key: "Defined denominations", name: "Defined denominations" },
    { key: "Specific Amount", name: "Specific Amount" },
  ]

  const [depositTypes, setDepositTypes] = useState(getFilteredItems(selectedDepositType))

  const [todayDeposits, setTodayDeposits] = useState(0)

  const [overallDeposits, setOverallDeposits] = useState(0);

  function getDepositFilteredItems(ignoreValue, menu) {
    return menu.filter(item => item['key'] !== ignoreValue)
  }

  const dmenu = [
    { key: denominationsList[tokenList["STRK"]][0], name: denominationsList[tokenList["STRK"]][0] },
    { key: denominationsList[tokenList["STRK"]][1], name: denominationsList[tokenList["STRK"]][1] },
    { key: denominationsList[tokenList["STRK"]][2], name: denominationsList[tokenList["STRK"]][2] },
    { key: denominationsList[tokenList["STRK"]][3], name: denominationsList[tokenList["STRK"]][3] },
  ]

  const [dselectedItem, setDSelectedItem] = useState(denominationsList[tokenList["STRK"]][0])
  const [dmenuItems, setDMenuItems] = useState(getDepositFilteredItems(denominationsList[tokenList["STRK"]][0], dmenu))
  const [dignoreValue, setDIgnoreValue] = useState(denominationsList[tokenList["STRK"]][0])

  const cmenu = [
    { key: ETH, name: ETH },
    { key: STRK, name: STRK },
    { key: 'USDC', name: 'USDC' },
    { key: 'UNO', name: 'UNO' },
    { key: 'WBTC', name: 'WBTC' },
    { key: 'tBTC', name: 'tBTC'}
  ]
  const [cselectedItem, setCSelectedItem] = useState("STRK")
  const [cignoreValue, setCIgnoreValue] = useState("STRK")
  const [cmenuItems, setCMenuItems] = useState(getDepositFilteredItems("STRK", cmenu))

  let depositObj = {
    denomination: denomination,
    defaultValue: STRK,
    setToken: setSrcToken,
    setDenomination: setDenomination,
    disabled: false,
    token: tokenToAddress["STRK"]
  }

  const [comp, setComp] = useState(<DepositField obj={depositObj} ref={depositRef} />)

  let telegramObj = {
    denomination: denomination,
    defaultValue: STRK,
    setToken: setSrcToken,
    setDenomination: setDenomination,
    disabled: true
  }

  let telegramInputObj = {
    holder: "@handle",
    setValue: setTelegramValue,
    disabled: true
  }

  const [poolCount, setPoolCount] = useState(0n)

  const [compT, setCompT] = useState(<DepositField obj={telegramObj} ref={depositRef} />)

  const transferTokens = [
    { name: "STRK", src: "starknetlogo.svg" },
    { name: "ETH", src: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" },
    { name: "WBTC", src: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png" },
    { name: "tBTC", src: "tbtclogo.png" },
    { name: "USDC", src: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" },
    { name: "UNO", src: "unologo.png" }
  ]
  const [selectedTransferToken, setSelectedTransferToken] = useState(transferTokens[0]);
  const [openTransferTokenDD, setOpenTransferTokenDD] = useState(false);
  const [transferValue, setTransferValue] = useState()
  const [transferReceiverValue, setTransferReceiverValue] = useState('')
  const [balance, setBalance] = useState('0')
  const [minimalRequired, setMinimalRequired] = useState('10')

  // const [depositInputs, setDepositInputs] = useState(<div className='flex items-center' >
  //   Token:
  //   <CoinSelector
  //     id={"coin"}
  //     setToken={setSrcToken}
  //     defaultValue={srcToken}
  //     disabled={false}
  //   />
  //   Denomination:
  //   <DenominationSelector
  //     disabled={false}
  //     id={"denomination"}
  //     setToken={setDenomination}
  //     defaultValue={denominationsList[tokenList[srcToken]][0]}
  //     token={tokenList[srcToken]}
  //   />
  // </div>);

  const [btnText, setBtnText] = useState(CONNECT_WALLET)

  const [content, setContent] = useState(depositContent)


  const [accountExists, setAccountExists] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem("noteAcc") != "null" && localStorage.getItem("noteAcc") != "undefined" && localStorage.getItem("noteAcc") != "" && localStorage.getItem("noteAcc") != null && localStorage.getItem("noteAcc") != undefined) {
        setNoteAcc(localStorage.getItem("noteAcc"))
        setAccountExists(true)
      }
    }
  })


  let noteAccount = ""
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("curToken", "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d");
    }
    let noteAccount = "";
    if (typeof window !== "undefined") {
      if (localStorage.getItem("noteAcc") != "null" && localStorage.getItem("noteAcc") != "undefined" && localStorage.getItem("noteAcc") != "" && localStorage.getItem("noteAcc") != null && localStorage.getItem("noteAcc") != undefined) {
        setNoteAcc(localStorage.getItem("noteAcc"))
      }
    }

    // if (noteAccount != "") {
    //   setNoteAcc(noteAccount)
    // }

  }, [accountExists])

  // useEffect(() => {
  //   console.log("proofElement", proofElement)
  //   setProofElement(proofElement)
  // }, [proofElement])

  useEffect(() => {
    async function getDeposits() {
      let denominations = poolsToNumber()
      const { abi: typhoonAbi } = await provider.getClassAt(typhoonAddress);

      const typhoon = new Contract(typhoonAbi, typhoonAddress, provider);
      let total = 0
      for (let i = 0; i < denominationsList[tokenToAddress[srcToken]].length; i++) {
        let pool = await typhoon.getPool(tokenToAddress[srcToken], getFullDenomination(denominationsList[tokenToAddress[srcToken]][i], tokenDecimals[srcToken]))
        let poolAddr = '0x' + pool.toString(16)
        const { abi: poolAbi } = await provider.getClassAt(poolAddr)
        const poolC = new Contract(poolAbi, poolAddr, provider);
        let day = await poolC.currentDay()
        let deposits = await poolC.liquidityProviders(day)
        total = total + Number(deposits)
      }
      setOverallDeposits(total)
    }
    if (account) {
      getDeposits()
    }
    if (!loading) {
      if (btnText == DEPOSIT) {
        setContent(depositContent)
      } else if (btnText == WITHDRAW) {
        setContent(withdrawContent)
      } else if (btnText == PRIVATE_TRANSFER) {
        setContent(transferContent)
      }
    }
  }, [overallDeposits, srcToken, account])


  useEffect(() => {
    async function getDeposits() {
      const { abi: typhoonAbi } = await provider.getClassAt(typhoonAddress);

      const typhoon = new Contract(typhoonAbi, typhoonAddress, provider);
      let pool = await typhoon.getPool(tokenToAddress[srcToken], getFullDenomination(denomination, tokenDecimals[srcToken]))
      let poolAddr = '0x' + pool.toString(16)
      const { abi: poolAbi } = await provider.getClassAt(poolAddr)
      const poolC = new Contract(poolAbi, poolAddr, provider);
      let day = await poolC.currentDay()
      let deposits = await poolC.liquidityProviders(day)
      setTodayDeposits(deposits)
    }
    if (account) {
      getDeposits()
    }
    if (!loading) {
      if (btnText == DEPOSIT) {
        setContent(depositContent)
      } else if (btnText == WITHDRAW) {
        setContent(withdrawContent)
      } else if (btnText == PRIVATE_TRANSFER) {
        setContent(transferContent)
      }
    }


  }, [todayDeposits, denomination, srcToken, account])

  // useEffect(() => {
  //   console.log("srcToken: ", srcToken)
  //   let depositObj = {
  //     denomination: denomination,
  //     defaultValue: srcToken,
  //     setToken: setSrcToken,
  //     setDenomination: setDenomination,
  //     disabled: false,
  //     token: tokenToAddress[srcToken]
  //   }

  //   setComp(<DepositField obj={depositObj} ref={depositRef} />)
  // }, [srcToken])

  useEffect(() => {
    setDepositTypes(getFilteredItems(selectedDepositType))
    setContent(depositContent)
  }, [selectedDepositType])

  useEffect(() => {
    setContent(depositContent)
  }, [depositTypes])



  useEffect(() => {
    const menu = [
      { key: denominationsList[tokenList[srcToken]][0], name: denominationsList[tokenList[srcToken]][0] },
      { key: denominationsList[tokenList[srcToken]][1], name: denominationsList[tokenList[srcToken]][1] },
      { key: denominationsList[tokenList[srcToken]][2], name: denominationsList[tokenList[srcToken]][2] },
      { key: denominationsList[tokenList[srcToken]][3], name: denominationsList[tokenList[srcToken]][3] },
    ]
    let newItems = getDepositFilteredItems(dignoreValue, menu)
    setDMenuItems([...newItems])
  }, [dignoreValue])

  useEffect(() => {
    setDIgnoreValue(dselectedItem)
    setContent(depositContent())
  }, [dselectedItem])

  useEffect(() => {
    const menu = [
      { key: ETH, name: ETH },
      { key: STRK, name: STRK },
      { key: 'USDC', name: 'USDC' },
      { key: 'UNO', name: 'UNO' },
      { key: 'WBTC', name: 'WBTC' },
      { key: 'tBTC', name: 'tBTC'}
    ]
    let newItems = getDepositFilteredItems(cignoreValue, menu)
    setCMenuItems([...newItems])
  }, [cignoreValue])

  useEffect(() => {
    setCIgnoreValue(cselectedItem)
    setContent(depositContent())
    // setDSelectedItem(denominationsList[tokenList[cselectedItem]][0])
  }, [cselectedItem])




  // useEffect(() => {
  //   setDepositInputs(<div className='flex items-center' >
  //     Token:
  //     <CoinSelector
  //       id={"coin"}
  //       setToken={setSrcToken}
  //       defaultValue={srcToken}
  //       disabled={false}
  //     />
  //     Denomination:
  //     <DenominationSelector
  //       disabled={false}
  //       id={"denomination"}
  //       setToken={setDenomination}
  //       defaultValue={denominationsList[tokenList[srcToken]][0]}
  //       token={tokenList[srcToken]}
  //     />
  //   </div>)
  // }, [srcToken, denomination])


  useEffect(() => {
    if (loading == true) {
      setContent(loadingContent)
    } else {
      if (btnText == DEPOSIT) {
        setContent(depositContent)
      } else if (btnText == WITHDRAW) {
        setContent(withdrawContent)
      } else if (btnText == PRIVATE_TRANSFER) {
        setContent(transferContent)
      }
    }

  }, [loading])

  useEffect(() => {
    setContent(loadingContent)
  }, [loadingText])

  function getFilteredItems(ignoreValue) {
    return dTypes.filter(item => item['key'] !== ignoreValue)
  }




  useEffect(() => {
    if (address) {
      if (selectedNavItem === DEPOSIT) {
        setBtnText(DEPOSIT)
      } else if (selectedNavItem === WITHDRAW) {
        setBtnText(WITHDRAW)
      } else if (selectedNavItem === PRIVATE_TRANSFER) {
        setBtnText(PRIVATE_TRANSFER)
      }

    }
  }, [address])

  // useEffect(() => {
  //   if (btnText === DEPOSIT) {
  //     setBtnText(DEPOSIT)
  //   } else if (btnText === WITHDRAW) {
  //     setBtnText(WITHDRAW)
  //   } else if (btnText === PRIVATE_TRANSFER) {
  //     setBtnText(PRIVATE_TRANSFER)
  //   }
  // }, [btnText])



  useEffect(() => {
    setContent(withdrawContent)
  }, [noteValue]);

  useEffect(() => {
    setContent(withdrawContent)

  }, [receiverValue]);

   useEffect(() => {
    setContent(transferContent())
  }, [transferValue])

  useEffect(() => {
    setContent(transferContent())
  }, [transferReceiverValue])

  useEffect(() => {
    setContent(transferContent())
  }, [openTransferTokenDD])

  useEffect(() => {
    setContent(transferContent())
    let sdk = new TyphoonSDK()
    async function getMin() {
      console.log(selectedTransferToken.name)
      let min = await sdk.get_token_minimal_amount(tokenList[selectedTransferToken.name])
      setMinimalRequired(getCompressedDenomination(min.toString(), tokenDecimals[selectedTransferToken.name]))
    }
    getMin()
  }, [selectedTransferToken])

  useEffect(() => {
    setContent(transferContent())
  }, [balance])

  useEffect(() => {
    setContent(transferContent())
  }, [minimalRequired])


  useEffect(() => {
    async function getDeposits() {
      const { abi: typhoonAbi } = await provider.getClassAt(typhoonAddress);

      const typhoon = new Contract(typhoonAbi, typhoonAddress, provider);
      let pool = await typhoon.getPool(tokenToAddress[srcToken], getFullDenomination(denomination,tokenDecimals[srcToken]))
      let poolAddr = '0x' + pool.toString(16)
      const { abi: poolAbi } = await provider.getClassAt(poolAddr)
      const poolC = new Contract(poolAbi, poolAddr, provider);
      let count = await poolC.getCount()
      setPoolCount(count)
    }
    getDeposits()
  },[srcToken, denomination])

  useEffect(() => {
    setContent(depositContent())
  }, [poolCount]);

  return (
    <div className='flex'>
      <div className='bg-zinc-900 w5-[35%] p-4 px-6 rounded-xl' >
        <div className='bg-zinc-900 h-fit flex items-center justify-around rounded-full mx-6'>
          <p
            className={getNavIconClassName(DEPOSIT)}
            onClick={() => {
              setSelectedNavItem(DEPOSIT)
              if (!loading) {
                setContent(depositContent)
              }
              if (address) {
                setBtnText(DEPOSIT)
              } else {
                setBtnText(CONNECT_WALLET)
              }
            }}
          >
            {DEPOSIT}
          </p>
          <p
            className={getNavIconClassName(WITHDRAW)}
            onClick={() => {
              setSelectedNavItem(WITHDRAW)
              if (!loading) {
                setContent(withdrawContent)
              }
              if (address) {
                setBtnText(WITHDRAW)
              } else {
                setBtnText(CONNECT_WALLET)
              }
            }}
          >
            {WITHDRAW}
          </p>
          <p
            className={getNavIconClassName(TRANSFER)}
            onClick={() => {
              setSelectedNavItem(TRANSFER)
              if (!loading) {
                setContent(transferContent)
              }
              if (address) {
                setBtnText(PRIVATE_TRANSFER)
              } else {
                setBtnText(CONNECT_WALLET)
              }

            }}
          >
            {TRANSFER}
          </p>

        </div>
        {content}
        <button
          className={getBtnClassName()}
          disabled={loading}
          onClick={async () => {
            if (btnText === DEPOSIT) {
              if (selectedDepositType === "Defined denominations") {

                await handleDeposit()
              } else {
                await handleSpecificAmountDeposit()
              }
            }
            else if (btnText === WITHDRAW) await handleWithdraw()
            else if (btnText === PRIVATE_TRANSFER) await handleTransfer()
          }}
        >
          {btnText}
        </button>



        <Toaster />
      </div>
      {account != undefined ? <NoteList /> : <div></div>}
    </div>
  )

  function withdrawContent() {
    return (
      <div>
        <div className='flex items-center justify-between py-4 px-1'>
          <p>Withdraw</p>

        </div>

        Note
        <div className='relative bg-[#212429] p-4 py-6 rounded-xl mb-5 border-[2px] border-transparent hover:border-zinc-600'>

          <div className='flex items-center rounded-xl'>
            <input
              ref={noteValueRef}
              className={getInputClassname()}
              type={"text"}
              value={noteValue}
              placeholder={"note"}
              disabled={false}
              onChange={e => {
                setNoteValue(e.target.value)
              }
              }
            />

          </div>
        </div>
        Receiver
        <div className='bg-[#212429] p-4 py-6 rounded-xl mb-2 mt-2 border-[2px] border-transparent hover:border-zinc-600'>
          <div className='flex items-center rounded-xl'>
            <input
              ref={receiverValueRef}
              className={getInputClassname()}
              type='text'
              value={receiverValue}
              placeholder={"0x"}
              disabled={false}
              onChange={e => {
                setReceiverValue(e.target.value)
              }
              }
            />

          </div>
        </div>
        <FormGroup className='' >

          <FormControlLabel disableTypography={{ color: 'white' }} onChange={(_, checked) => {
            setPaymaster(checked)
          }} control={<Switch defaultChecked />} label="Paymaster" />
        </FormGroup>
      </div>
    )
  }

  function depositContent() {
    return (
      <div>
        <div className='flex items-center justify-between py-4 px-1'>
          Deposit
          {/* {depositTypeSelector()} */}
        </div>

        <div className='relative bg-[#212429] p-4 py-6 rounded-xl mb-5 border-[2px] border-transparent hover:border-zinc-600'>
          {selectedDepositType === "Defined denominations" ? <div className='flex items-center' >
            Token:
            {CoinSelector("coin", false)}
            Denomination:
            {DenominationSelector("denomination", false)}

          </div> : specificAmountField()}
        </div>
        <div className='bg-[#212429] p-4 py-6 rounded-xl mt-5 border-[2px] border-transparent hover:border-zinc-600'>
         {`Number of equal deposits: ${poolCount}`}
        </div>

        <FormGroup className='mb-5'>
          <FormControlLabel disableTypography={{ color: 'white' }} disabled={true} onChange={(_, checked) => {
            setRewardMode(checked)
          }} control={<Switch defaultChecked={false} />} label="Reward mode" />
        </FormGroup>
      </div>
    )
  }

  async function get_balance(acc) {
    const { abi: poolAbi } = await provider.getClassAt(tokenList[selectedTransferToken.name]);
    const poolC = new Contract(poolAbi, tokenList[selectedTransferToken.name], provider);
    let balance = await poolC.balanceOf(acc);
    return balance.toString()
  }

  function transferContent() {

    if (address != undefined) {
      get_balance(address).then((b) => {
        let cd = getCompressedDenomination(b, tokenDecimals[selectedTransferToken.name])

        setBalance(cd)


      })
    }



    return (
      <div>
        <div className='mb-5 mt-5 text-white'>
          Private Transfer
        </div>

        <div className="w-full h-full p-4 bg-zinc-800 rounded-2xl shadow-md">
          {/* Header */}
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span className="text-white">Amount</span>
            <span className="text-white">
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

          <div className="text-right text-white text-sm mt-1">
            Minimum amount required: {minimalRequired} {selectedTransferToken.name}
          </div>
        </div>
        <div className="w-full mt-2 h-full p-4 bg-zinc-800 rounded-2xl shadow-md">
          {/* Header */}
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span className="text-white">Receiver</span>

          </div>

          {/* Input row */}
          <div className="flex items-center gap-3 border rounded-xl p-3 bg-zinc-900">
            {/* Amount input */}
            <input
              type="text"
              inputMode="text"
              placeholder="0x0"
              value={transferReceiverValue}
              onChange={(e) => setTransferReceiverValue(e.target.value)}
              className="flex-1 min-w-0 text-right text-2xl font-medium bg-zinc-900 outline-none placeholder:text-gray-400"

            />
          </div>
        </div>

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

  function createAndDownloadFile(content, name = "note.txt") {
    const fileContent = content;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = name;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  async function handleDeposit() {

    setLoading(true)
    setLoadingText("Initiating deposit...(Do not close neither reload the screen.)")

    const { abi: typhoonAbi } = await provider.getClassAt(typhoonAddress);

    const typhoon = new Contract(typhoonAbi, typhoonAddress, provider);

    let pool = await typhoon.getPool(tokenToAddress[srcToken], getFullDenomination(denomination,tokenDecimals[srcToken]))
    let poolAddr = '0x' + pool.toString(16)

    setLoadingText("Depositing...(Do not close neither reload the screen.)")
    const [secret, nullifier] = generateSecretAndNullifier()
    const cn = await commitmentAndNullifierHash(secret, nullifier)
    const multiCall = await account.execute([
      // Calling the first contract
      {
        contractAddress: tokenToAddress[srcToken],
        entrypoint: 'approve',
        calldata: CallData.compile({
          spender: poolAddr,
          amount: cairo.uint256(getFullDenomination(denomination,tokenDecimals[srcToken])),
        }),
      },
      // Calling the second contract
      {
        contractAddress: typhoonAddress,
        entrypoint: 'deposit',
        calldata: CallData.compile({
          _commitment: cairo.uint256(cn[0]),
          _pool: poolAddr,
          _reward: rewardMode
        }),
      },
    ], { version: 2 });

    await account.waitForTransaction(multiCall.transaction_hash);

    const { abi: poolAbi } = await provider.getClassAt(poolAddr)
    const poolC = new Contract(poolAbi, poolAddr, provider);

    let day = await poolC.currentDay()


    await setProofElement(["0x" + secret, "0x" + nullifier, multiCall.transaction_hash.toString(), poolAddr, rewardMode ? "0x" + day.toString() : '0x1'])


    setLoadingText("Deposit Completed! (Do not close neither reload the screen.)")
    console.log("noteAcc", noteAcc)
    if (noteAcc == "" || noteAcc == null || noteAcc == undefined || noteAcc == "null" || noteAcc == "undefined") {
      let proofElements = JSON.stringify({
        "secret": "0x" + secret,
        "nullifier": "0x" + nullifier,
        "txHash": multiCall.transaction_hash.toString(),
        "pool": poolAddr,
        "day": rewardMode ? "0x" + day.toString() : '0x1'
      })
      createAndDownloadFile(proofElements)
    } else {
      setLoadingText("Saving in Note Account!(Do not close neither reload the screen.)")
      
      try{
        await saveInNoteAccount(["0x" + secret, "0x" + nullifier, multiCall.transaction_hash.toString(), poolAddr, rewardMode ? "0x" + day.toString() : '0x1'], noteAcc)
        let proofElements = JSON.stringify({
          "secret": "0x" + secret,
          "nullifier": "0x" + nullifier,
          "txHash": multiCall.transaction_hash.toString(),
          "pool": poolAddr,
          "day": rewardMode ? "0x" + day.toString() : '0x1'
        })
        createAndDownloadFile(proofElements)
      } catch (e) {
        console.log(e)
        let proofElements = JSON.stringify({
          "secret": "0x" + secret,
          "nullifier": "0x" + nullifier,
          "txHash": multiCall.transaction_hash.toString(),
          "pool": poolAddr,
          "day": rewardMode ? "0x" + day.toString() : '0x1'
        })
        createAndDownloadFile(proofElements)
      }
      
    }

    await new Promise(r => setTimeout(r, 2000));
    setLoading(false)
  }

  async function handleSpecificAmountDeposit() {
    setLoading(true)
    const { abi: typhoonAbi } = await provider.getClassAt(typhoonAddress);
    const typhoon = new Contract(typhoonAbi, typhoonAddress, provider);


    const { abi: tokenAbi } = await provider.getClassAt(tokenToAddress[srcToken])
    const token = new Contract(tokenAbi, tokenToAddress[srcToken], provider);


    let proofsElements = []

    let secrets = []
    let nullifiers = []
    let pools = []
    let commitments = []

    let approvalsAndDeposit = []

    let [poolsAllowance, depositCount] = allowancePerPool(specificValue)
    let noteCounter = 0
    for (let i = 0; i < poolsAllowance.length; i++) {
      if (poolsAllowance[i] == 0) {
        continue
      }
      let pool = await typhoon.getPool(tokenToAddress[srcToken], getFullDenomination(denominationsList[i],tokenDecimals[srcToken]))
      approvalsAndDeposit.push({
        contractAddress: tokenToAddress[srcToken],
        entrypoint: 'approve',
        calldata: CallData.compile({
          spender: '0x' + pool.toString(16),
          amount: cairo.uint256(poolsAllowance[i]),
        }),
      })
      for (let j = 0; j < BigInt(poolsAllowance[i]) / getFullDenomination(denominationsList[i], tokenDecimals[srcToken]); j++) {
        noteCounter++
        setLoadingText(`Generating Deposit (${noteCounter}/${depositCount})...`)
        const [secret, nullifier] = generateSecretAndNullifier()
        secrets.push(secret)
        nullifiers.push(nullifier)
        pools.push('0x' + pool.toString(16))
        const [commitment, _] = await commitmentAndNullifierHash(secret, nullifier)
        commitments.push(commitment)
      }
    }

    approvalsAndDeposit.push({
      contractAddress: typhoonAddress,
      entrypoint: 'deposit',
      calldata: CallData.compile({
        _commitment: cairo.tuple(commitments.map(x => cairo.uint256(x))),
        _pool: cairo.tuple(pools),
        _reward: rewardMode
      }),
    })
    setLoadingText("Depositing...")
    const multiCall = await account.execute(approvalsAndDeposit, { version: 2 });

    await account.waitForTransaction(multiCall.transaction_hash);

    const { abi: poolAbi } = await provider.getClassAt(pools[0])
    const poolC = new Contract(poolAbi, pools[0], provider);

    let day = await poolC.currentDay()

    for (let i = 0; i < commitments.length; i++) {
      proofsElements.push(
        JSON.stringify({
          "secret": secrets[i],
          "nullifier": nullifiers[i],
          "txHash": multiCall.transaction_hash,
          "pool": pools[i],
          "day": rewardMode ? day.toString() : '1'
        })
      )
    }
    setSpecificValue("")
    createAndDownloadFile(proofsElements.join('\n'))
    setLoadingText("Deposit Completed!")
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false)
  }



  async function handleWithdraw() {

    // let callData = await generateProofCalldata("", receiverValue)
    setLoading(true)
    setLoadingText("Initiating Withdraw...")
    await new Promise(r => setTimeout(r, 1000));


    let proofsStringList = JSONInputStringToList(noteValue)

    for (let i = 0; i < proofsStringList.length; i++) {
      setLoadingText(`Generating Proof... (This can take a few seconds)`)
      let proofString = JSON.parse(proofsStringList[i])
      let callData = await generateProofCalldata(proofString, receiverValue, paymaster)
      if (paymaster) {
        let cd = callData.map(x => x.toString())
        try {
          setLoadingText(`Withdrawing using paymaster... (This can take a few seconds)`)
          const res = await axios.post("https://typhoon-paymaster.vercel.app/calldata", {
            calldata: cd,
            note_account_calldata: []
          });
          console.log("Response:", res.data);
        } catch (err) {
          console.error("Error:", err.response?.data || err.message);
        }
      } else {
        setLoadingText(`Withdrawing... (This can take a few seconds)`)
        const { abi: typhoonAbi } = await provider.getClassAt(typhoonAddress);
        const typhoonContract = new Contract(typhoonAbi, typhoonAddress, account);
        const call = typhoonContract.populate('withdraw', { full_proof_with_hints: callData });
        const multiCall = await account.execute({
          contractAddress: typhoonAddress,
          entrypoint: 'withdraw',
          calldata: call.calldata,
        }, { version: 2 });
        await account.waitForTransaction(multiCall.transaction_hash);
      }
    }
    
    setLoadingText("Withdraw Completed!")
    await new Promise(r => setTimeout(r, 3000));
    setNoteValue("")
    setReceiverValue("")
    setLoading(false)
  }

  async function handleTransfer() {
    let sdk = new TyphoonSDK()
    let calls = await sdk.generate_approve_and_deposit_calls(BigInt(transferValue), tokenList[selectedTransferToken.name])
    console.log(calls)
  }

  function depositOptionPopup() {
    return (
      <div>
        <Popup open={openDepositOp} onClose={() => {

          if (!downloaded) {
            let proofElements = JSON.stringify({
              "secret": proofElement[0],
              "nullifier": proofElement[1],
              "txHash": proofElement[2],
              "pool": proofElement[3],
              "day": proofElement[4]
            })
            createAndDownloadFile(proofElements)
          }
          setDownloaded(true)
          setOpenDepositOp(false)
        }} modal nested contentStyle={{ width: '500px', height: '200px', borderRadius: '20px' }}>
          <div>
            <div className="lg:border-outline-grey ml-5 basis-5/6 lg:col-span-2 lg:border-r-[1px] lg:border-solid lg:py-4 lg:pl-8">
              <h2 className="my-4 text-center text-[1.125em] font-bold text-black lg:text-start">
                Issue note options
              </h2>
            </div>
            <div className="flex">
              <button style={{ backgroundColor: 'blue', color: 'white', marginLeft: '10px' }}
                aria-haspopup="dialog"
                onClick={() => {
                  let proofElements = JSON.stringify({
                    "secret": proofElement[0],
                    "nullifier": proofElement[1],
                    "txHash": proofElement[2],
                    "pool": proofElement[3],
                    "day": proofElement[4]
                  })
                  createAndDownloadFile(proofElements)
                  setDownloaded(true)
                  setOpenDepositOp(false)
                }}
                className="rounded-[12px] bg-button-primary bg-blue px-4 py-3 text-background-primary-light transition-all duration-300 hover:rounded-[30px] md:py-4"
              >
                Download Note
              </button>

              <Popup trigger={<button style={{ backgroundColor: 'blue', color: 'white', marginRight: '5px', marginLeft: "10px" }} className={"rounded-[12px] bg-button-primary bg-blue px-4 py-3 text-background-primary-light transition-all duration-300 hover:rounded-[30px] md:py-4"}> Connect/Create Note Account</button>} modal contentStyle={{ borderRadius: '10px' }}>
                <div>
                  <div className="lg:border-outline-grey ml-5 basis-5/6 lg:col-span-2 lg:border-r-[1px] lg:border-solid lg:py-4 lg:pl-8">
                    <h2 className="my-4 text-center text-[1.125em] font-bold text-black lg:text-start">
                      Connect a Note Account
                    </h2>
                  </div>
                  <div className="flex">
                    <div className="relative bg-[#212429] p-12 py-6 rounded-xl mb-5 ml-5 border-transparent hover:border-zinc-600">
                      <div className="flex items-center rounded-xl">
                        <input
                          className={getInputClassname()}
                          type={"text"}
                          value={noteValue}
                          placeholder={"type or paste your private key here..."}
                          disabled={false}
                          onChange={(e) => {
                            setNoteValue(e.target.value);
                          }}
                        />
                      </div>
                    </div>

                    <button style={{ backgroundColor: 'blue', color: 'white', marginLeft: '10px' }}
                      aria-haspopup="dialog"
                      onClick={async () => {
                        connectNoteAccount(noteValue)
                        await saveInNoteAccount(proofElement, noteValue)
                        setDownloaded(true)
                        setOpenDepositOp(false)
                      }
                      }
                      className="rounded-[12px]  ml-10 bg-button-primary bg-blue px-4 py-3 text-background-primary-light transition-all duration-300 hover:rounded-[30px] md:py-4"
                    >
                      Connect
                    </button>
                  </div>
                  <div className="items-center lg:border-outline-grey ml-5 basis-5/6 lg:col-span-2 lg:border-r-[1px] lg:border-solid lg:py-4 lg:pl-8">
                    <h2 className="my-4 text-center text-[1.125em] font-bold text-black lg:text-start">
                      Or
                    </h2>
                  </div>
                  <button style={{ backgroundColor: 'blue', color: 'white', marginLeft: '20px' }}
                    aria-haspopup="dialog"
                    onClick={async () => {
                      let acc = createNoteAccount()
                      await saveInNoteAccount(proofElement, acc)
                      setDownloaded(true)
                      setOpenDepositOp(false)
                    }}
                    className="items-center rounded-[12px] ml-10 bg-button-primary bg-blue px-6 py-3 text-background-primary-light transition-all duration-300 hover:rounded-[30px] md:py-4"
                  >
                    Create Note Account
                  </button>
                  <div className="col-span-8 flex flex-col gap-2">

                    <p className="text-black">
                      Once you click on "Create Note Account", a new private key will be generated and will be downloaded to your computer in ".txt" format. Please keep it safe, as it is the only way to access your Note Account.
                    </p>
                  </div>
                </div>
              </Popup>
            </div>

          </div>
        </Popup>
      </div>
    )
  }

  function connectNoteAccount(noteAccount) {
    if (typeof window !== 'undefined') {
      localStorage.setItem("noteAcc", noteAccount)
    }
    setNoteAcc(noteAccount)
    setAccountExists(true)
    // save note in contract
  }

  function createNoteAccount() {
    const acc = Wallet.createRandom();
    const privKey = acc.privateKey.slice(2) // remove 0x prefix
    if (typeof window !== 'undefined') {
      localStorage.setItem("noteAcc", privKey)
    }
    console.log("localStorage noteAcc", localStorage.getItem("noteAcc"))
    let na = JSON.stringify({
      "privkey": privKey,
    })
    createAndDownloadFile(na, "priv-key.txt")
    setAccountExists(true)
    setNoteAcc(privKey)
    // save note in contract
    return privKey
  }

  async function saveInNoteAccount(pe, acckey) {
    console.log("noteAcc", noteAcc)
    let acc = new Wallet("0x" + acckey);

    const publicKeyBuffer = Buffer.from(acc.signingKey.publicKey.slice(2), 'hex');
    const privKeyBuffer = Buffer.from(acckey, 'hex');
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    let keyPair = nacl.box.keyPair.fromSecretKey(privKeyBuffer)
    let compressedData = []
    console.log("tx hash save ", pe)
    for (let i = 0; i < pe.length; i++) {
      let data = pe[i].slice(2) // remove 0x prefix
      if (data.length % 2 != 0) {
        data = "150dd" + data
      }

      const encrypted = nacl.box(
        naclUtil.decodeUTF8(data),
        nonce,
        keyPair.publicKey,
        keyPair.secretKey
      );

      // const decrypted = nacl.box.open(
      //   Buffer.from(bufferToHex(encrypted).slice(2), 'hex'),
      //   nonce,
      //   keyPair.publicKey,
      //   keyPair.secretKey
      // );
      // let decryptedHex = bufferToHex(decrypted)
      // console.log("decrypted hex ", decryptedHex)
      // let decryptedStr = Buffer.from(decryptedHex.slice(2), 'hex').toString('utf8')
      // console.log("decrypted data ", decryptedStr)
      // console.log("valid: ", decryptedStr == data)

      // let enData = await ecies.encrypt(publicKeyBuffer, Buffer.from(data, "hex"))
      // let encrypted = bufferToHex(enData)
      let en = BigInt(bufferToHex(encrypted))
      let times = en / (maxUint512 * maxUint512)

      let remainder = en % (maxUint512 * maxUint512)
      let timesR = remainder / (maxUint512 * maxUint256)
      let timesRemainderR = (remainder % (maxUint512 * maxUint256)) / maxUint512
      let remainderRemainderR = ((remainder % (maxUint512 * maxUint256)) % maxUint512) / maxUint256
      let remainderRemainderR2 = ((remainder % (maxUint512 * maxUint256)) % maxUint512) % maxUint256
      let recover = (maxUint512 * maxUint512) * times + (timesR * (maxUint512 * maxUint256)) + (timesRemainderR * maxUint512) + (remainderRemainderR * maxUint256) + remainderRemainderR2
      // console.log("remainderRemainderR gt ", remainderRemainderR > maxUint256)
      // console.log("remainderRemainderR2 gt ", remainderRemainderR2 > maxUint256)
      // console.log("times", times, "timesR", timesR, "timesRemainderR", timesRemainderR, "remainderRemainderR", remainderRemainderR, "remainderRemainderR2", remainderRemainderR2)
      // console.log(times > maxUint256)
      // console.log(timesR > maxUint256)
      // console.log(timesRemainderR > maxUint256)
      // console.log(remainderRemainderR > maxUint256)
      // console.log(remainderRemainderR2 > maxUint256)
      // console.log("encrypted", encrypted)
      // // console.log("0x0" + recover.toString(16))
      // console.log("0x0" + recover.toString(16) == encrypted)
      compressedData.push(times.toString())
      compressedData.push(timesR.toString())
      compressedData.push(timesRemainderR.toString())
      compressedData.push(remainderRemainderR.toString())
      compressedData.push(remainderRemainderR2.toString())
      // compressedData.push(BigInt(bufferToHex(nonce)).toString())
      // const privateKeyBuffer = Buffer.from(noteAcc, 'hex');
      // const decrypted = bufferToHex(await ecies.decrypt(privateKeyBuffer, Buffer.from("0" + recover.toString(16), 'hex')));
      // console.log("proof element ", pe[i], " decrypted: ", decrypted.slice(2).includes("150dd")? "0x"+decrypted.slice(7): decrypted)
    }

    const msg = nacl.box(
      naclUtil.decodeUTF8(compressedData.join('')),
      nonce,
      keyPair.publicKey,
      keyPair.secretKey
    );
    let msg_hash_str = createHash('sha256').update(bufferToHex(msg)).digest('hex')

    // let signature = await acc.signMessage(BigInt("0x"+msg_hash_str).toString())
    let signature = acc.signingKey.sign("0x" + msg_hash_str)

    // let sig = Signature.from(signature);
    // console.log(verifyMessage(BigInt("0x"+msg_hash_str).toString(), sig) == acc.address)
    try {

      // console.log("maxUint256", maxUint256)
      // console.log("address", acc.address)
      // console.log("compressedData", compressedData)
      // console.log("msg_hash_str", msg_hash_str)
      // console.log("r", sig.r)
      // console.log("s", sig.s)
      // console.log("v", sig.v)
      // fn addNote(ref self: TContractState, pubKey: EthAddress, encryptedNote: Span<u256>, msg_hash: u256, r: u256, s: u256, v: u32);
      
      const multiCall = await account.execute({
        contractAddress: noteAccountContract,
        entrypoint: 'addNote',
        calldata: CallData.compile({
          pubKey: acc.address,
          encryptedNote: cairo.tuple([cairo.uint256(compressedData[0]), cairo.uint256(compressedData[1]), cairo.uint256(compressedData[2]), cairo.uint256(compressedData[3]), cairo.uint256(compressedData[4]), cairo.uint256(compressedData[5]), cairo.uint256(compressedData[6]), cairo.uint256(compressedData[7]), cairo.uint256(compressedData[8]), cairo.uint256(compressedData[9]), cairo.uint256(compressedData[10]), cairo.uint256(compressedData[11]), cairo.uint256(compressedData[12]), cairo.uint256(compressedData[13]), cairo.uint256(compressedData[14]), cairo.uint256(compressedData[15]), cairo.uint256(compressedData[16]), cairo.uint256(compressedData[17]), cairo.uint256(compressedData[18]), cairo.uint256(compressedData[19]), cairo.uint256(compressedData[20]), cairo.uint256(compressedData[21]), cairo.uint256(compressedData[22]), cairo.uint256(compressedData[23]), cairo.uint256(compressedData[24]), cairo.uint256(BigInt(bufferToHex(nonce)).toString())]),
          msgHash: cairo.uint256(BigInt("0x" + msg_hash_str).toString()),
          r: cairo.uint256(BigInt(signature.r).toString()),
          s: cairo.uint256(BigInt(signature.s).toString()),
          v: signature.v
        }),
      }, { version: 2 });
      await account.waitForTransaction(multiCall.transaction_hash);
    } catch (error) {
      let proofElements = JSON.stringify({
        "secret": proofElement[0],
        "nullifier": proofElement[1],
        "txHash": proofElement[2],
        "pool": proofElement[3],
        "day": proofElement[4]
      })
      createAndDownloadFile(proofElements)
    }

  }
  // function specificAmountField() {
  //   return (
  //     <div className='flex items-center rounded-xl'>
  //       <input
  //         ref={specificRef}
  //         className={getInputClassname()}
  //         type={'number'}
  //         value={specificValue}
  //         placeholder={'0.0'}
  //         onChange={e => {
  //           setSpecificValue(e.target.value)
  //         }}
  //       />

  //       <CoinSelector
  //         disabled={false}
  //         id={"coin"}
  //         setToken={setSrcToken}
  //         defaultValue={STRK}
  //       />
  //     </div>
  //   )
  // }

  function depositTypeSelector() {
    return (
      <Dropdown className='bg-black rounded-xl'>
        <DropdownTrigger>
          <Button variant="bordered" className='bg-black rounded-xl ml-2 mr-10'>{selectedDepositType}</Button>
        </DropdownTrigger>
        <DropdownMenu className='bg-black rounded-xl' aria-label="Static Actions" items={depositTypes} onAction={key => {

          setSelectedDepositType(key)
        }}>
          {item => (
            <DropdownItem
              aria-label={"depositType"}
              key={item.key}
              color={item.key === 'delete' ? 'error' : 'default'}
            >
              {item.name}
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    )
  }

  async function estimateGasFee(entry, calldata) {
    const { suggestedMaxFee: estimatedFee1, gas_price: gasPrice } = await account.estimateInvokeFee({
      contractAddress: typhoonAddress,
      entrypoint: entry,
      calldata: calldata,
    });
    return [estimatedFee1, gasPrice]
  }

  function getBtnClassName() {
    let className = 'p-4 w-full my-2 rounded-xl'
    className +=
      btnText === ENTER_AMOUNT || btnText === CONNECT_WALLET
        ? ' text-zinc-400 bg-zinc-800 pointer-events-none'
        : ' bg-blue-700'
    return className
  }



  function getNavIconClassName(name) {
    let className =
      'p-1 px-4 cursor-pointer border-[4px] border-transparent flex items-center'
    className +=
      name === selectedNavItem
        ? ' bg-zinc-800 border-zinc-900 rounded-full'
        : ''
    return className
  }

  function getInputClassname() {
    let className =
      ' w-full outline-none h-8 px-2 appearance-none text-3xl bg-transparent'
    return className
  }

  function DenominationSelector(id, disabled) {
    return (
      <Dropdown disableAnimation={disabled} className='bg-black rounded-xl'>
        <DropdownTrigger>
          <Button disabled={disabled} variant="bordered" className='bg-black rounded-xl ml-2'>{dselectedItem}</Button>
        </DropdownTrigger>
        <DropdownMenu className='bg-black rounded-xl' key={cmenuItems.map(i => i.key).join('-')} aria-label="Static Actions" items={dmenuItems} onAction={key => {
          const menu = [
            { key: denominationsList[tokenList[srcToken]][0], name: denominationsList[tokenList[srcToken]][0] },
            { key: denominationsList[tokenList[srcToken]][1], name: denominationsList[tokenList[srcToken]][1] },
            { key: denominationsList[tokenList[srcToken]][2], name: denominationsList[tokenList[srcToken]][2] },
            { key: denominationsList[tokenList[srcToken]][3], name: denominationsList[tokenList[srcToken]][3] },
          ]
          let newItems = getDepositFilteredItems(key, menu)
          setDMenuItems([...newItems])
          setDSelectedItem(key)
          setDenomination(key)
        }}>
          {item => (
            <DropdownItem
              aria-label={id}
              key={item.key}
              color={item.key === 'delete' ? 'error' : 'default'}
            >
              {item.name}
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    )
  }

  function CoinSelector(id, disabled) {


    return (
      <Dropdown disableAnimation={disabled} className='bg-black rounded-xl mr-2'>
        <DropdownTrigger>
          <Button disabled={disabled} variant="bordered" className='bg-black rounded-xl ml-2 mr-7'>{cselectedItem}</Button>
        </DropdownTrigger>
        <DropdownMenu className='bg-black rounded-xl' key={cmenuItems.map(i => i.key).join('-')} aria-label="Static Actions" items={cmenuItems} onAction={key => {
          const menu = [
            { key: ETH, name: ETH },
            { key: STRK, name: STRK },
            { key: 'USDC', name: 'USDC' },
            { key: 'UNO', name: 'UNO' },
            { key: 'WBTC', name: 'WBTC' },
            { key: 'tBTC', name: 'tBTC'}
          ]
          let newItems = getDepositFilteredItems(key, menu)
          setCMenuItems([...newItems])
          setCSelectedItem(key)
          console.log("token ", key)
          setSrcToken(key)
          const dmenu = [
            { key: denominationsList[tokenList[key]][0], name: denominationsList[tokenList[key]][0] },
            { key: denominationsList[tokenList[key]][1], name: denominationsList[tokenList[key]][1] },
            { key: denominationsList[tokenList[key]][2], name: denominationsList[tokenList[key]][2] },
            { key: denominationsList[tokenList[key]][3], name: denominationsList[tokenList[key]][3] },
          ]
          let newdItems = getDepositFilteredItems(denominationsList[tokenList[key]][0], dmenu)
          setDMenuItems([...newdItems])
          setDSelectedItem(denominationsList[tokenList[key]][0])
          setDenomination(denominationsList[tokenList[key]][0])
        }}>
          {item => (
            <DropdownItem
              aria-label={id}
              key={item.key}
              color={item.key === 'delete' ? 'error' : 'default'}
            >
              {item.name}
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    )
  }

}



export default MainComponent
