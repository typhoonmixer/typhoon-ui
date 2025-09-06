"use client"
import React, { useEffect, useState, useRef, use } from 'react'
import { TyphoonSDK } from 'typhoon-sdk';
import { ArrowRight } from "lucide-react";
import { RpcProvider, Contract } from 'starknet-v7';
import { tokenDecimals, tokenToSymbol } from '../utils/SupportedDenominations';
import { getCompressedDenomination } from '../utils/depositUtils';

export default function Home() {
  const provider = new RpcProvider({ nodeUrl: "https://rpc.starknet.lava.build:443" });
  const [note, setNote] = useState('');
  const [complianceContent, setComplianceContent] = useState(<div></div>);

  const handleInputChange = (e) => {
    setNote(e.target.value);
  };

  function loadingContent() {
    return (
      <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
        <img src='/Infinity.svg'></img>

      </div>
    )
  }

  const handleSubmit = async () => {
    setComplianceContent(loadingContent());
    let sdk = new TyphoonSDK()
    let jsonNote = JSON.parse(note)
    let reportData = await sdk.get_compliance_data(jsonNote.secret.includes('0x') ? jsonNote.secret.slice(2) : jsonNote.secret, jsonNote.nullifier.includes('0x') ? jsonNote.nullifier.slice(2) : jsonNote.nullifier, jsonNote.txHash, jsonNote.pool)
    const { abi: poolAbi } = await provider.getClassAt(jsonNote.pool);
    const poolContract = new Contract(poolAbi, jsonNote.pool, provider);
    const token = await poolContract.token();
    const symbol = tokenToSymbol[token.toString()];
    console.log(reportData)
    setComplianceContent(complianceReport(reportData, symbol, jsonNote.secret.includes('0x') ? jsonNote.secret.slice(2) : jsonNote.secret, jsonNote.nullifier.includes('0x') ? jsonNote.nullifier.slice(2) : jsonNote.nullifier, jsonNote.pool));
  }
  return (
    <div className="container" style={{ justifyContent: 'center' }}>
      <h1>
        <span className="text-white text-xl font-bold">Typhoon</span> compliance tool
      </h1>
      <p>
        Maintaining financial privacy is essential to preserving our freedoms. However, it should not come at the cost of non-compliance. With Typhoon, you can always provide cryptographically verified proof of transactional history using the "note.txt" that you download in the moment of the deposit. This might be necessary in cases where you need to show the origin of assets in your withdrawal address.
      </p>
      <p>
        To generate a compliance report, please enter your Typhoon note below.
      </p>
      <div className="mt-5">
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '1.2em' }}>Note</label>
        <div style={{ gap: '10px', justifyContent: 'center', display: 'flex' }}>
          <input style={{ width: '100%', maxWidth: '600px', padding: '10px', fontSize: '1em', backgroundColor: '#222', color: '#fff', border: '1px solid #555', borderRadius: '5px' }}
            type="text"
            value={note}
            onChange={handleInputChange}
            placeholder="Please enter your note"
          />
          <button style={{
            padding: '10px 20px',
            fontSize: '1em',
            backgroundColor: 'blue',
            border: 'none',
            color: '#fff',
            borderRadius: '4px',
            cursor: 'pointer'
          }} onClick={handleSubmit}>Generate</button>
        </div>

      </div>
      {complianceContent}
    </div >
  );


  function complianceReport(reportData, symbol, secret, nullifier, pool) {
    const depositDate = new Date(Number(reportData.depositDate) * 1000);
    const formattedDepositDate = depositDate.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const withdrawDate = new Date(Number(reportData.withdrawDate) * 1000);
    const formattedwithdrawDate = withdrawDate.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    let compressedDepositAmount = getCompressedDenomination(reportData.depositAmount, tokenDecimals[symbol])
    let compressedWithdrawAmount = getCompressedDenomination(reportData.withdrawAmount, tokenDecimals[symbol])
    let compressedWithdrawFee = getCompressedDenomination(reportData.fee, tokenDecimals[symbol])
    let compressedPaymasterFee = getCompressedDenomination(reportData.paymasterFee, tokenDecimals[symbol])


    return (
      <div>
        <div className=" text-white p-6 rounded-2xl flex items-center justify-between ">
          {/* Deposit */}
          <div className="flex-1 border-0 shadow-none rounded-2xl p-4">
            <div className="p-0">
              <div className='mb-12'>
                <h2 className="text-xl font-bold">Deposit</h2>
                <p className="text-blue-400 ">Verified</p>
                <p className="mt-2 text-lg font-mono">{compressedDepositAmount} {symbol}</p>
              </div>


              <div className="mt-4 space-y-2">
                <Row label="Date" content={formattedDepositDate} />
                <Row label="Transaction" content={reportData.depositTxHash} />
                <Row label="From" content={reportData.from} />
                <Row label="Commitment" content={reportData.commitment} />
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-r from-blue-400/30 to-blue-400/80 px-2 py-6 rounded-xl">
              <ArrowRight className="text-white w-8 h-8" />
            </div>
          </div>

          {/* Withdrawal */}
          <div className="flex-1 border-0 shadow-none text-right rounded-2xl p-4">
            <div className="p-0">
              <h2 className="text-xl font-bold">Withdrawal</h2>
              <p className="text-blue-400">${reportedData.to != ''? "Verified": "unspent"}</p>
              <p className="mt-2 text-lg font-mono">
                {reportedData.to != ''?compressedWithdrawAmount: "--"} {symbol}
                <div className='flex'>
                  <span className="block text-gray-400 text-sm">
                    withdrawal fee {reportedData.to != ''? compressedWithdrawFee: "--"} {symbol}
                  </span>
                  <span className="block text-gray-400 text-sm ml-6">
                    Paymaster fee {reportedData.to != ''? compressedPaymasterFee: "--"} {symbol}
                  </span>
                </div>

              </p>

              <div className="mt-4 space-y-2">
                <Row label="Date" right content={reportedData.to != ''? formattedwithdrawDate : "--"} />
                <Row label="Transaction" right content={reportedData.to != ''? reportData.withdrawTxHash: "--"} />
                <Row label="To" right content={reportedData.to != ''? reportData.to: "--"} />
                <Row label="NullifierHash" right content={reportedData.to != ''? reportData.nullifierHash : "--"} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          {reportedData.to != ''? <button className="bg-gradient-to-r from-blue-400/30 to-blue-400/80 px-2 py-3 rounded-xl" onClick={() => {
            const htmlReport = generateComplianceReport({ secret, nullifier, pool, depositAmount: compressedDepositAmount, withdrawalAmount: compressedWithdrawAmount, withdrawFee: compressedWithdrawFee, relayerFee: compressedPaymasterFee, depositDate: formattedDepositDate, depositTx: reportData.depositTxHash, depositFrom: reportData.from, commitment: reportData.commitment, withdrawalDate: formattedwithdrawDate, withdrawalTx: reportData.withdrawTxHash, withdrawalTo: reportData.to, nullifierHash: reportData.nullifierHash, symbol });
            // htmlStringToJpeg(htmlReport);
            // createAndDownloadFile(htmlReport)
            // convertToPdf(htmlReport);
            if (typeof window !== "undefined") {
              openReportAndPrint(htmlReport);
            }
            
          }}>
            Download PDF
          </button>: <div></div>}
        </div>
      </div>

    );
  }

  function openReportAndPrint(htmlString) {
    if (typeof window === 'undefined') {
      console.error('This function requires a browser environment.');
      return;
    }
  
    const reportWindow = window.open("", "_blank");
    reportWindow.document.write(htmlString);
    reportWindow.document.close();
  
    reportWindow.onload = () => {
      reportWindow.focus();
      reportWindow.print();
    };
  }
  
  // Small row component for labels
  function Row({ label, right, content }) {
    return (
      <div
        className={`flex ${right ? "justify-end" : "justify-start"} items-center`}
      >
        {!right && <span className="w-28 text-left">{label}</span>}
        <div className="flex-1 h-6 rounded-full flex items-center justify-center">
          <span className="truncate text-center" style={{ fontSize: '13px' }}>
            {content ? content : "0x1234...abcd9u8y7t68r76t789ui98y90890789687"}
          </span>
        </div>
        {right && <span className="w-36 text-right">{label}</span>}
      </div>
    );
  }

  function generateComplianceReport({
    secret = '',
    nullifier = '',
    pool = '',
    depositAmount = "",
    withdrawalAmount = "",
    withdrawFee = "",
    relayerFee = "",
    depositDate = "",
    depositTx = "",
    depositFrom = "",
    commitment = "",
    withdrawalDate = "",
    withdrawalTx = "",
    withdrawalTo = "",
    nullifierHash = "",
    symbol = ""
  } = {}) {
    return `
        <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Typhoon Compliance Report</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            background: #fff;
            color: #000;
            padding: 20px;
            max-width: 800px;
            margin: auto;
          }
          header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
          }
          header img {
            height: 40px;
            margin-right: 10px;
          }
          h1 {
            font-size: 24px;
            margin: 0;
          }
          .note {
            margin: 15px 0;
            height: 40px;
            border-radius: 5px;
          }
          .report-section {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
            margin-top: 90px;
          }
          .column {
            width: 45%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }
          .label {
            font-size: 12px;
            color: #000;
            margin-top: 5px;
          }
          .value {
            height: 25px;
            border-radius: 10px;
            margin: 5px 0;
            width: 100%;
            font-size: 12px;
          }
          .eth-amount {
            font-weight: bold;
            font-size: 18px;
            margin: 0;
          }
          .relayer {
            font-size: 12px;
            color: #000;
            margin-top: 5px;
          }
          .warning {
            margin-top: 30px;
            font-size: 12px;
            color: #000;
            line-height: 1.5;
          }
          .verified-stamp {
            position: absolute;
            right: 20px;
            bottom: 20px;
            font-size: 12px;
            text-align: center;
          }
          .verified-stamp img {
            height: 50px;
          }
          .fees{
            display: flex;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>Typhoon Compliance Report</h1>
        </header>
    
        <div class="note">
            <p>
                {secret: ${secret},
            </p >
            <p>
                nullifier: ${nullifier},
            </p>
            <p>
                txHash: ${depositTx},
            </p>
            <p>
                pool: ${pool}}
            </p>
        </div >
    
        <div class="report-section">
          <div class="column">
            <p>Deposit <span class="eth-amount">${depositAmount} ${symbol}</span></p>
            <p class="label">Verified</p>
            
            <p class="label"></p>
            <p class="label" style="margin-top: 1.6em;">Date</p>
            <div class="value">${depositDate}</div>
            <p class="label">Transaction</p>
            <div class="value">${depositTx}</div>
            <p class="label">From</p>
            <div class="value">${depositFrom}</div>
            <p class="label">Commitment</p>
            <div class="value">${commitment}</div>
          </div>
    
          <div class="column">
            <p>Withdrawal <span class="eth-amount">${withdrawalAmount} ${symbol}</span></p>
            <div class="fees">
                <p class="relayer">Withdraw fee ${withdrawFee} ${symbol}</p>
                
                <p class="relayer" style="margin-left:2em;">Paymaster fee ${relayerFee} ${symbol}</p>
            </div>
            <p class="label">Verified</p>
            <p class="label">Date</p>
            <div class="value">${withdrawalDate}</div>
            <p class="label">Transaction</p>
            <div class="value">${withdrawalTx}</div>
            <p class="label">To</p>
            <div class="value">${withdrawalTo}</div>
            <p class="label">Nullifier Hash</p>
            <div class="value">${nullifierHash}</div>
          </div>
        </div>
    
        <div class="warning">
          <p><strong>Warning</strong></p>
          <p>
            This Compliance Report is for informational purposes only. You should
            confirm the validity of this report by using Typhoon’s Compliance Tool
            (https://www.typhoon-finance.com/compliance) or with any other tool that 
            integrates Typhoon SDK. Any discrepancies between information
            found in this report and provided by the above tool indicate that the
            information in this report is inaccurate and/or fraudulent.
          </p>
          <p>
            THE COMPLIANCE REPORT IS PROVIDED "AS IS," WITHOUT WARRANTY OF ANY KIND,
            EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
            IN NO EVENT SHALL THE AUTHORS OF THE TYPHOON COMPLIANCE TOOL BE
            LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
            OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
            WITH THIS COMPLIANCE REPORT.
          </p>
        </div>
    
      </body >
    </html >
            `;
  }

  function createAndDownloadFile(content) {
    const fileContent = content;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'report.html';

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

}

