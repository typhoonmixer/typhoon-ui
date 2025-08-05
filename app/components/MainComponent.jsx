"use client"
import React, { useEffect, useState, useRef, use } from 'react'
import Popup from 'reactjs-popup';
import { Wallet, Signature, verifyMessage, recoverAddress } from 'ethers';

import { encrypt } from '@metamask/eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { createHash, sign } from 'crypto';
import { RpcProvider, Contract, WalletAccount, CallData, cairo, RPC } from 'starknet';

import WithdrawField from './WithdrawField'
import toast, { Toaster } from 'react-hot-toast'
import { DEFAULT_VALUE, ETH, STRK } from '../utils/SupportedCoins'
import DepositField from './DepositField'
import { denominationsList, one, tokenList } from '../utils/SupportedDenominations'

// import { CoinSelector, DenominationSelector } from './Selector';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@nextui-org/react'
import { allowancePerPool, commitmentAndNullifierHash, generateSecretAndNullifier, getFullDenomination, poolsToNumber } from '../utils/depositUtils';
import { JSONInputStringToList, generateProofCalldata } from '../utils/withdrawUtils';
import NoteList from './NoteList';
import typhoonAbi from '../utils/typhoon_abi.json' assert { type: "json" }
import ecies from 'ecies-geth';

import {
  useAccount,
  useContract,
  useSendTransaction
} from "@starknet-react/core";



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
    "USDC": ""
  }

  const [noteValue, setNoteValue] = useState("")
  const [receiverValue, setReceiverValue] = useState("")

  const [telegramValue, setTelegramValue] = useState("")

  const noteValueRef = useRef()
  const receiverValueRef = useRef(null)

  const telegramInputRef = useRef()

  const depositRef = useRef()


  const specificRef = useRef()

  const ENTER_AMOUNT = 'Enter an amount'
  const CONNECT_WALLET = 'Connect wallet'
  const DEPOSIT = 'Deposit'
  const TELEGRAM_TRANSFER = "Coming Soon"

  const WITHDRAW = 'Withdraw'
  const TELEGRAM = 'Transfer via Telegram'

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

  const [compT, setCompT] = useState(<DepositField obj={telegramObj} ref={depositRef} />)


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

  


  let noteAccount = ""
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("curToken", "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d");
    }
    let noteAccount = "";
    if (typeof window !== "undefined") {
      noteAccount = localStorage.getItem("noteAcc") != null ? localStorage.getItem("noteAcc") : "";
    }

    if (noteAccount != "") {
      setNoteAcc(noteAccount)
    }

  }, [noteAccount])

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
        let pool = await typhoon.getPool(tokenToAddress[srcToken], getFullDenomination(denominationsList[tokenToAddress[srcToken]][i]))
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
      } else if (btnText == TELEGRAM_TRANSFER) {
        setContent(telegramContent)
      }
    }
  }, [overallDeposits, srcToken, account])


  useEffect(() => {
    async function getDeposits() {
      const { abi: typhoonAbi } = await provider.getClassAt(typhoonAddress);

      const typhoon = new Contract(typhoonAbi, typhoonAddress, provider);
      let pool = await typhoon.getPool(tokenToAddress[srcToken], getFullDenomination(denomination))
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
      } else if (btnText == TELEGRAM_TRANSFER) {
        setContent(telegramContent)
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
  }, [dselectedItem])

  useEffect(() => {
    const menu = [
      { key: ETH, name: ETH },
      { key: STRK, name: STRK },
    ]
    let newItems = getDepositFilteredItems(cignoreValue, menu)
    setCMenuItems([...newItems])
  }, [cignoreValue])

  useEffect(() => {
    setCIgnoreValue(cselectedItem)
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
      } else if (btnText == TELEGRAM_TRANSFER) {
        setContent(telegramContent)
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
      } else if (selectedNavItem === TELEGRAM_TRANSFER) {
        setBtnText(TELEGRAM_TRANSFER)
      }

    }
  }, [address])

  // useEffect(() => {
  //   if (btnText === DEPOSIT) {
  //     setBtnText(DEPOSIT)
  //   } else if (btnText === WITHDRAW) {
  //     setBtnText(WITHDRAW)
  //   } else if (btnText === TELEGRAM_TRANSFER) {
  //     setBtnText(TELEGRAM_TRANSFER)
  //   }
  // }, [btnText])



  useEffect(() => {
    setContent(withdrawContent)
  }, [noteValue]);

  useEffect(() => {
    setContent(withdrawContent)

  }, [receiverValue]);




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
            className={getNavIconClassName(TELEGRAM)}
            onClick={() => {
              setSelectedNavItem(TELEGRAM)
              if (!loading) {
                setContent(telegramContent)
              }
              setBtnText(TELEGRAM_TRANSFER)
            }}
          >
            {TELEGRAM}
          </p>

        </div>
        {content}
        {openDepositOp ? depositOptionPopup() : <button
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
          }}
        >
          {btnText}
        </button>}



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

          <FormControlLabel disableTypography={{ color: 'white' }} disabled={true} onChange={(_, checked) => {
            console.log(checked)
          }} control={<Switch defaultChecked />} label="Telegram Relayers (coming soon)" />
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
          {selectedDepositType === "Specific Amount" ? "Overall today deposits" : "today deposits for pool"}: {selectedDepositType === "Specific Amount" ? overallDeposits : todayDeposits}
        </div>

        <FormGroup className='mb-5'>
          <FormControlLabel disableTypography={{ color: 'white' }} disabled={true} onChange={(_, checked) => {
            setRewardMode(checked)
          }} control={<Switch defaultChecked={false} />} label="Reward mode" />
        </FormGroup>
      </div>
    )
  }

  function telegramContent() {
    return (
      <div>
        <div className='mb-5 mt-5'>
          Transfer via Telegram (Coming Soon)
        </div>

        <div className='relative bg-[#212429] p-4 py-6 rounded-xl mb-5 border-[2px] border-transparent hover:border-zinc-600'>
          {compT}
        </div>
        <div className='bg-[#212429] p-4 py-6 rounded-xl mt-5 border-[2px] border-transparent hover:border-zinc-600'>
          Today deposits: {0}
        </div>
        <div className='bg-[#212429] p-4 py-6 rounded-xl mb-2 mt-2 border-[2px] border-transparent hover:border-zinc-600'>
          <WithdrawField obj={telegramInputObj} ref={telegramInputRef} curValue={telegramValue} />
        </div>
        <FormGroup className='mb-5' >

          <FormControlLabel disableTypography={{ color: 'white' }} disabled={true} onChange={(_, checked) => {
            console.log(checked)
          }} control={<Switch defaultChecked />} label="Reward mode" />
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

  function createAndDownloadFile(content) {
    const fileContent = content;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'note.txt';

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

    let pool = await typhoon.getPool(tokenToAddress[srcToken], getFullDenomination(denomination))
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
          amount: cairo.uint256(getFullDenomination(denomination)),
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
    if (noteAcc == "") {
      setOpenDepositOp(true)
    } else {
      setLoadingText("Saving in Note Account!(Do not close neither reload the screen.)")
      await saveInNoteAccount(["0x" + secret, "0x" + nullifier, multiCall.transaction_hash.toString(), poolAddr, rewardMode ? "0x" + day.toString() : '0x1'])
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
      let pool = await typhoon.getPool(tokenToAddress[srcToken], getFullDenomination(denominationsList[i]))
      approvalsAndDeposit.push({
        contractAddress: tokenToAddress[srcToken],
        entrypoint: 'approve',
        calldata: CallData.compile({
          spender: '0x' + pool.toString(16),
          amount: cairo.uint256(poolsAllowance[i]),
        }),
      })
      for (let j = 0; j < BigInt(poolsAllowance[i]) / getFullDenomination(denominationsList[i]); j++) {
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
    let callData = await generateProofCalldata("", receiverValue)
    setLoading(true)
    setLoadingText("Initiating Withdraw...")
    await new Promise(r => setTimeout(r, 1000));


    let proofsStringList = JSONInputStringToList(noteValue)

    for (let i = 0; i < proofsStringList.length; i++) {
      setLoadingText(`Generating Proof (${i + 1}/${proofsStringList.length})... (This can take a few seconds)`)
      let proofString = JSON.parse(proofsStringList[i])
      let callData = await generateProofCalldata(proofString, receiverValue)
      setLoadingText(`Withdrawing (${i + 1}/${proofsStringList.length})... (This can take a few seconds)`)
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


    setLoadingText("Withdraw Completed!")
    await new Promise(r => setTimeout(r, 3000));
    setNoteValue("")
    setReceiverValue("")
    setLoading(false)
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

              <Popup trigger={<button style={{ backgroundColor: 'blue', color: 'white', marginRight: '10px' }} className={className}> Connect/Create Note Account</button>} modal contentStyle={{ borderRadius: '10px' }}>
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
                        connectNoteAccount(noteAcc)
                        await saveInNoteAccount(proofElement)
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
                      createNoteAccount()
                      await saveInNoteAccount(proofElement)
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
    // save note in contract
  }

  function createNoteAccount() {
    const acc = Wallet.createRandom();
    const privKey = acc.privateKey.slice(2) // remove 0x prefix
    if (typeof window !== 'undefined') {
      localStorage.setItem("noteAcc", privKey)
    }
    let na = JSON.stringify({
      "privkey": privKey,
    })
    createAndDownloadFile(na)
    // save note in contract
  }

  async function saveInNoteAccount(pe) {
    let acc = new Wallet("0x" + noteAcc);

    const publicKeyBuffer = Buffer.from(acc.signingKey.publicKey.slice(2), 'hex');
    let compressedData = []
    console.log("tx hash save ", pe)
    for (let i = 0; i < pe.length; i++) {
      let data = pe[i].slice(2) // remove 0x prefix
      if (data.length % 2 != 0) {
        data = "150dd" + data
      }
      let encrypted = bufferToHex(await ecies.encrypt(publicKeyBuffer, Buffer.from(data, "hex")))
      let en = BigInt(encrypted, 16)
      let times = en / (maxUint512 * maxUint512)

      let remainder = en % (maxUint512 * maxUint512)
      let timesR = remainder / (maxUint512 * maxUint256)
      let timesRemainderR = (remainder % (maxUint512 * maxUint256)) / maxUint512
      let remainderRemainderR = ((remainder % (maxUint512 * maxUint256)) % maxUint512) / maxUint256
      let remainderRemainderR2 = ((remainder % (maxUint512 * maxUint256)) % maxUint512) % maxUint256
      let recover = (maxUint512 * maxUint512) * times + (timesR * (maxUint512 * maxUint256)) + (timesRemainderR * maxUint512) + (remainderRemainderR * maxUint256) + remainderRemainderR2
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
      const privateKeyBuffer = Buffer.from(noteAcc, 'hex');
      const decrypted = bufferToHex(await ecies.decrypt(privateKeyBuffer, Buffer.from("0" + recover.toString(16), 'hex')));
      // console.log("proof element ", pe[i], " decrypted: ", decrypted.slice(2).includes("150dd")? "0x"+decrypted.slice(7): decrypted)
    }

    let msg = bufferToHex(await ecies.encrypt(publicKeyBuffer, Buffer.from(compressedData.join(''))))
    let msg_hash_str = createHash('sha256').update(msg).digest('hex')

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
          encryptedNote: cairo.tuple([cairo.uint256(compressedData[0]), cairo.uint256(compressedData[1]), cairo.uint256(compressedData[2]), cairo.uint256(compressedData[3]), cairo.uint256(compressedData[4]), cairo.uint256(compressedData[5]), cairo.uint256(compressedData[6]), cairo.uint256(compressedData[7]), cairo.uint256(compressedData[8]), cairo.uint256(compressedData[9]), cairo.uint256(compressedData[10]), cairo.uint256(compressedData[11]), cairo.uint256(compressedData[12]), cairo.uint256(compressedData[13]), cairo.uint256(compressedData[14]), cairo.uint256(compressedData[15]), cairo.uint256(compressedData[16]), cairo.uint256(compressedData[17]), cairo.uint256(compressedData[18]), cairo.uint256(compressedData[19]), cairo.uint256(compressedData[20]), cairo.uint256(compressedData[21]), cairo.uint256(compressedData[22]), cairo.uint256(compressedData[23]), cairo.uint256(compressedData[24])]),
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
      btnText === ENTER_AMOUNT || btnText === CONNECT_WALLET || btnText === TELEGRAM_TRANSFER
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
          ]
          let newItems = getDepositFilteredItems(key, menu)
          setCMenuItems([...newItems])
          setCSelectedItem(key)
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
