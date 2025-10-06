"use client"
import React from 'react'
import { useAccount } from "@starknet-react/core";
import NoteList from './NoteList'

export default function ReadPanel({
  token,
  denomination,
  poolCount,
  todayDeposits,
  overallDeposits,
}) {
  const { address } = useAccount();

  const Stat = ({ label, value }) => (
    <div className="rounded-lg bg-card border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold text-card-foreground">{value}</div>
    </div>
  );

  return (
    <aside className="w-full">
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-md">
        <h3 className="text-card-foreground text-base font-semibold">Pool Activity</h3>
        <p className="text-xs text-muted-foreground mt-1">Updates as you change token/amount</p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Stat label="Token" value={token} />
          <Stat label="Amount" value={`${denomination} ${token}`} />
          <Stat label="Equal Deposits" value={poolCount?.toString?.() ?? String(poolCount)} />
          <Stat label="Today's Providers" value={todayDeposits?.toString?.() ?? String(todayDeposits)} />
          <Stat label="Total Deposits" value={overallDeposits?.toString?.() ?? String(overallDeposits)} />
        </div>
      </div>

      {address ? (
        <div className="mt-6">
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-md">
            <h3 className="text-card-foreground text-base font-semibold mb-3">Your Notes</h3>
            <NoteList />
          </div>
        </div>
      ) : null}
    </aside>
  )
}

