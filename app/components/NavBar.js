"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import MobileMenuOverlay from "./MobileMenuOverlay";
import Link from "next/link";
import { Wallet2, Lock, SlidersHorizontal, Menu, X } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useAccount } from "@starknet-react/core";
import NetworkSwitcher from "./lib/NetworkSwitcher";
import { UserModalMount } from "./lib/AddressBar";
import ConnectButton from "./lib/Connect";
import SettingsDropDown from "./SettingsDropDown";
import Logo from "./Logo";

export default function Navbar() {
  const pathname = usePathname();
  const { address } = useAccount();
  const [theme, setTheme] = useState("dark");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

  const settingsRef = useRef(null);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (systemPrefersDark) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "system") {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.documentElement.classList.toggle("dark", systemDark);
    } else {
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
  };

  const linkClass = (path) =>
    `text-sm md:text-base font-semibold hover:text-accent transition-colors ${
      pathname === path ? "text-accent" : "text-foreground"
    }`;

  const handleWalletClick = () => {
    if (address) {
      document.getElementById("user-popover")?.togglePopover?.();
    } else {
      document.getElementById("connect-modal")?.togglePopover?.();
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="w-full bg-transparent px-4 md:px-8 lg:px-[120px] relative z-50">
        <div className="mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Logo classname="text-foreground hover:text-accent" href="/app" />

            <div className="hidden lg:flex items-center gap-4">
              <Link href="/app" className={linkClass("/app")}>
                Dashboard
              </Link>
              <Link
                href="/app/compliance"
                className={linkClass("/app/compliance")}
              >
                Compliance
              </Link>
              <Link
                href="/app/anonymousaccount"
                className={linkClass("/app/anonymousaccount")}
              >
                Anonymous Account
              </Link>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/typhoonmixer/typhoon_sdk_docs"
                className="text-foreground hover:text-accent text-sm md:text-base font-semibold transition-colors"
              >
                Docs
              </a>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <NetworkSwitcher />

            <button
              aria-label={address ? "Account" : "Connect"}
              onClick={handleWalletClick}
              className="grid h-10 w-10 place-content-center rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <Wallet2 className="h-5 w-5 text-card-foreground" />
            </button>

            <button
              aria-label="Lock"
              className="grid h-10 w-10 place-content-center rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <Lock className="h-5 w-5 text-card-foreground" />
            </button>

            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  isSettingsOpen
                    ? "border-accent text-accent bg-accent/10"
                    : "border-accent text-accent hover:bg-accent/10"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>

              {isSettingsOpen && (
                <div className="absolute right-0 top-12 z-[100]">
                  <SettingsDropDown
                    theme={theme}
                    changeTheme={changeTheme}
                    setIsSettingsOpen={setIsSettingsOpen}
                  />
                </div>
              )}
            </div>
          </div>

          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <MobileMenuOverlay
            linkClass={linkClass}
            handleWalletClick={handleWalletClick}
            isMobileSettingsOpen={isMobileSettingsOpen}
            setIsMobileSettingsOpen={setIsMobileSettingsOpen}
            theme={theme}
            changeTheme={changeTheme}
          />
        )}

        <ConnectButton className="hidden" text="" />
        <UserModalMount />
      </nav>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 6000,
          style: {
            background: "var(--card)",
            color: "var(--card-foreground)",
            border: "1px solid var(--border)",
          },
        }}
      />
    </>
  );
}
