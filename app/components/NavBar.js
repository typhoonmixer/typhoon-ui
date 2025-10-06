'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAccount } from '@starknet-react/core';
import NetworkSwitcher from './lib/NetworkSwitcher';
import AddressBar from './lib/AddressBar';
import ConnectButton from './lib/Connect';

export default function Navbar() {
  const pathname = usePathname();
  const { address } = useAccount();

  const linkClass = (path) =>
    `text-sm md:text-base font-semibold hover:text-accent ${
      pathname === path ? 'text-accent' : 'text-foreground'
    }`;

  return (
    <nav className="w-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/Typhoon_logo.png" alt="Typhoon Logo" className="h-8 w-auto" />
            <span className="text-foreground text-xl md:text-2xl font-bold">Typhoon</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/compliance" className={linkClass('/compliance')}>Compliance</Link>
            <Link href="/anonymousaccount" className={linkClass('/anonymousaccount')}>Anonymous Account</Link>
            <a target="_blank" rel="noopener noreferrer" href='https://typhoon-2.gitbook.io/typhoon-docs' className="text-foreground hover:text-accent text-sm md:text-base font-semibold">Docs</a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-muted-foreground"></span>
          <NetworkSwitcher />
          {address ? <AddressBar /> : <ConnectButton />}
        </div>
      </div>
    </nav>
  );
}
