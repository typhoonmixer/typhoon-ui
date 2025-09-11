"use client"
import React, { useEffect, useState } from 'react'

import { useAccount } from "@starknet-react/core";
import AddressBar from "./lib/AddressBar";
import ConnectButton from "./lib/Connect";
import { Wallet, Signature } from 'ethers';

import toast, { Toaster } from 'react-hot-toast'
import NoteAccountButton from './lib/NoteAccount';
import CopyButton from "../utils/CopyButton";

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { Button } from 'react-bootstrap';

const providerUrl = 'https://free-rpc.nethermind.io/sepolia-juno/v0_7';


const Header = () => {
  const [tokenBalComp, setTokenBalComp] = useState()

  const { address } = useAccount();

  const [noteValue, setNoteValue] = useState("");
  const [noteAccountExists, setNoteAccountExists] = useState(false);

  useEffect(() => {
    let naux = "";
    if (typeof window !== "undefined") {
      naux = localStorage.getItem("noteAcc");
    }
    if ((noteAccountExists || naux != "") && (naux != "undefined" && naux != "null") && naux != null) {
      setNoteValue(naux);
      if (!noteAccountExists) {
        setNoteAccountExists(true)
      }
    } else {
      setNoteValue("");
      setNoteAccountExists(false)
    }
  }, [noteAccountExists])

  let className = "rounded-[12px] bg-button-primary bg-blue px-6 py-3 text-background-primary-light transition-all duration-300 hover:rounded-[30px] md:py-4"

  const openLink = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
  }

  function getInputClassname() {
    let className =
      ' w-full outline-none h-4  appearance-none text-1xl bg-transparent'
    return className
  }

  return (
    <div className='fixed left-0 top-0 w-full px-8 py-4 flex items-center justify-between z-1000' style={{zIndex:600, marginLeft: '1100px'}}>
        {/* <div className='flex items-center'>
          <img src='/Typhoon_logo.png' className='h-12' />

        </div> */}

      <div className='flex'>
        {/* <button style={{ backgroundColor: 'blue', color: 'white' , marginRight: '10px'}}
          aria-haspopup="dialog"
          onClick={() => openLink("https://starknet-faucet.vercel.app/")}
          className={className}
        >
          Get Faucets
        </button> */}
        {/* <NoteAccountButton style={{marginRight: '10px'}}></NoteAccountButton> */}
        {/* {noteAccountExists == true ? <Popup display="anchored" trigger={<Button style={{ backgroundColor: 'blue', color: 'white', marginRight: '10px' }} className={className}>{noteAccountText()}</Button>} contentStyle={{ width: '400px', height: '150px', borderRadius: '20px' }}>
          <div>
            <CopyButton style={{ color: "black" }}
              copyText={noteAccAddr()}
              buttonText={
                `Note Account: ${noteAccAddr()}`
              }
              className="flex items-center gap-2 text-sm text-yellow-primary"
              iconClassName="rounded-full bg-[--link-card] p-1 text-yellow-primary dark:bg-black"
            />
            Note Account:
            <button style={{ border: '2px solid black', color: "black" }}
              onClick={(e) => {
                if (typeof window !== 'undefined') {
                  localStorage.setItem("noteAcc", null)
                }

                setNoteAccountExists(false)
              }}
              className="w-full rounded-[12px] border-[2px] border-solid border-[--borders] bg-[--modal-disconnect-bg] p-3 text-red-secondary md:p-4"
            >
              Disconnect
            </button>
          </div>
        </Popup> : <Popup trigger={<button style={{ backgroundColor: 'blue', color: 'white', marginRight: '10px' }} className={className}> Note Account</button>} modal contentStyle={{ borderRadius: '10px' }}>
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
                onClick={() => connectNoteAccount(noteValue)}
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
              onClick={() => createNoteAccount()}
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
        </Popup>} */}
        {address ? (
          <div className="flex items-center gap-4">
            <AddressBar />
          </div>
        ) : (
          <ConnectButton />
        )}
      </div>

      <Toaster />
    </div>
  )

  function connectNoteAccount(noteAccount) {
    console.log("Connecting Note Account: ", noteAccount);
    if (typeof window !== 'undefined') {
      localStorage.setItem("noteAcc", noteAccount)
    }

    setNoteValue(noteAccount);
    console.log("note")
    setNoteAccountExists(true);
  }

  function noteAccountText() {

    try {
      const acc = new Wallet(noteValue)
      console.log("noteValue", noteValue)
      const address = acc.address;
      return (
        <div className="flex items-center gap-2 text-sm text-yellow-primary">
          Note Account: {address?.slice(0, 6).concat("...").concat(address?.slice(-5))}
        </div>
      )

    } catch (error) {
      localStorage.setItem("noteAcc", null)
      setNoteAccountExists(false);
    }


  }

  function noteAccAddr() {
    try {
      const acc = new Wallet(noteValue)
      const address = acc.address;
      return address
    } catch (error) {
      localStorage.setItem("noteAcc", null)
      setNoteAccountExists(false);
    }
  }


  function createNoteAccount() {
    const acc = Wallet.createRandom();
    const privKey = acc.privateKey.slice(2) // remove 0x prefix
    if (typeof window !== 'undefined') {
      localStorage.setItem("noteAcc", privKey)
    }
    createAndDownloadFile(privKey)
    setNoteAccountExists(true);
    setNoteValue(privKey);
  }

  function getBtnText(address) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4, address.length)}`
  }
}



function createAndDownloadFile(content) {
  const fileContent = content;
  const blob = new Blob([fileContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'note-acc-priv-key.txt';

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}


export default Header
