import Link from "next/link";

import React from "react";
import NetworkSwitcher from "./lib/NetworkSwitcher";
import {
  ChevronDown,
  ChevronUp,
  Lock,
  SlidersHorizontal,
  Wallet2,
} from "lucide-react";
import SettingsDropDown from "./SettingsDropDown";

function MobileMenuOverlay({
  linkClass,
  handleWalletClick,
  isMobileSettingsOpen,
  setIsMobileSettingsOpen,
  theme,
  changeTheme,
}) {
  return (
    <div className="lg:hidden absolute top-full left-0 w-full h-screen bg-background border-t border-border shadow-2xl p-6 flex flex-col gap-6 animate-in slide-in-from-top-5 z-[1000] overflow-y-auto pb-24">
      {/* Mobile Nav Links */}
      <div className="flex flex-col gap-4">
        <Link
          href="/app"
          className={linkClass("/app")}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Dashboard
        </Link>
        <Link
          href="/app/compliance"
          className={linkClass("/app/compliance")}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Compliance
        </Link>
        <Link
          href="/app/anonymousaccount"
          className={linkClass("/app/anonymousaccount")}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Anonymous Account
        </Link>
        <a
          href="https://typhoon-2.gitbook.io/typhoon-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:text-accent font-semibold"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Docs
        </a>
      </div>

      <div className="h-px bg-border w-full" />

      {/* Mobile Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Network
          </span>
          <NetworkSwitcher />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleWalletClick}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors text-card-foreground"
          >
            <Wallet2 className="h-5 w-5" />
            <span className="text-sm font-medium">Wallet</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors text-card-foreground">
            <Lock className="h-5 w-5" />
            <span className="text-sm font-medium">Lock</span>
          </button>
        </div>

        {/* Mobile Settings Dropdown */}
        <div>
          <button
            onClick={() => setIsMobileSettingsOpen(!isMobileSettingsOpen)}
            className={`w-full flex items-center justify-between h-10 px-4 rounded-lg border transition-colors ${
              isMobileSettingsOpen
                ? "border-accent text-accent bg-accent/10"
                : "border-border bg-muted/30 text-card-foreground hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm font-medium">Settings</span>
            </div>
            {isMobileSettingsOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {isMobileSettingsOpen && (
            <div className="mt-2 rounded-xl border border-border bg-card p-4 animate-in fade-in slide-in-from-top-1">
              <SettingsDropDown
                theme={theme}
                changeTheme={changeTheme}
                setIsSettingsOpen={setIsMobileSettingsOpen}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MobileMenuOverlay;
