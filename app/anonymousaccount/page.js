"use client"
import React, { useEffect, useState, useRef, use } from 'react'
import { TyphoonSDK } from 'typhoon-sdk';
import { ArrowRight } from "lucide-react";
import { RpcProvider, Contract } from 'starknet';
import { getNodeUrl } from '../utils/network';
import { tokenDecimals, tokenToSymbol } from '../utils/SupportedDenominations';
import { getCompressedDenomination } from '../utils/depositUtils';

export default function Home() {
  const provider = new RpcProvider({ nodeUrl: getNodeUrl() });
  const [note, setNote] = useState('');
  const [complianceContent, setComplianceContent] = useState(<div></div>);


  return (
    <div className="container" style={{ justifyContent: 'center' }}>
      <h1>
        <span className="text-card-foreground text-xl font-bold">Coming Soon...</span>
      </h1>
    </div>
  );


  
}
