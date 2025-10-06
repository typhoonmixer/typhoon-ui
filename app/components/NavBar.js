'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Tornado, Wallet2, Lock, SlidersHorizontal } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useAccount } from '@starknet-react/core';
import NetworkSwitcher from './lib/NetworkSwitcher';
import { UserModalMount } from './lib/AddressBar';
import ConnectButton from './lib/Connect';

export default function Navbar() {
  const pathname = usePathname();
  const { address } = useAccount();

  const linkClass = (path) =>
    `text-sm md:text-base font-semibold hover:text-accent ${
      pathname === path ? 'text-accent' : 'text-foreground'
    }`;

  return (
    <>
    <nav className="w-full bg-transparent">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className={`mr-0 flex items-center gap-2 ${linkClass('/')}`}>
            <Tornado className="h-5 w-5 text-accent" />
            <span>Typhoon</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/compliance" className={linkClass('/compliance')}>Compliance</Link>
            <Link href="/anonymousaccount" className={linkClass('/anonymousaccount')}>Anonymous Account</Link>
            <a target="_blank" rel="noopener noreferrer" href='https://typhoon-2.gitbook.io/typhoon-docs' className="text-foreground hover:text-accent text-sm md:text-base font-semibold">Docs</a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NetworkSwitcher />
          {/* Wallet icon: user modal if connected, otherwise open connect modal */}
          <button
            aria-label={address ? 'Account' : 'Connect'}
            onClick={() => {
              if (address) {
                const pop = document.getElementById('user-popover');
                // @ts-ignore
                pop?.togglePopover?.();
              } else {
                const pop = document.getElementById('connect-modal');
                // @ts-ignore
                pop?.togglePopover?.();
              }
            }}
            className="grid h-10 w-10 place-content-center rounded-lg border border-border bg-muted/30 hover:bg-muted/50"
          >
            <Wallet2 className="h-5 w-5 text-card-foreground" />
          </button>
          <button
            aria-label="Lock"
            className="grid h-10 w-10 place-content-center rounded-lg border border-border bg-muted/30 hover:bg-muted/50"
          >
            <Lock className="h-5 w-5 text-card-foreground" />
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-accent px-3 py-1.5 text-sm text-accent hover:bg-accent/10">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Settings</span>
          </button>
          {/* Hidden modals mount */}
          <ConnectButton className="hidden" text="" />
          <UserModalMount />
        </div>
      </div>
    </nav>
    <Toaster position="bottom-right" toastOptions={{
      duration: 6000,
      style: { background: 'var(--card)', color: 'var(--card-foreground)', border: '1px solid var(--border)' },
    }} />
    </>
  );
}
