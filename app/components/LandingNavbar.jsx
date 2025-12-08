"use client";
import React, { useEffect, useState } from "react";
import Logo from "./Logo";
import Link from "next/link";
import { Menu, Moon, Sun } from "lucide-react";

function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    // Check system preference if no local storage
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

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-border py-4"
            : "bg-transparent border-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Logo href="/" />

          <div className="hidden md:flex items-center gap-8 font-medium text-muted-foreground">
            <Link
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#compliance"
              className="hover:text-foreground transition-colors"
            >
              Compliance
            </Link>
            <Link
              href="#anonymous"
              className="hover:text-foreground transition-colors"
            >
              Anonymous Accounts
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link
              href="/app"
              className="px-6 py-2.5 bg-accent text-accent-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-[0_0_15px_-3px_var(--accent)] hover:shadow-[0_0_20px_0px_var(--accent)] active:scale-95"
            >
              Launch App
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl animate-in slide-in-from-right duration-300 md:hidden flex flex-col p-6">
          <div className="flex justify-between items-center mb-12">
            <Logo />
            <button onClick={() => setMobileMenuOpen(false)} className="p-2">
              <X size={28} />
            </button>
          </div>

          <div className="flex flex-col gap-6 text-xl font-medium text-muted-foreground">
            <Link href="#features" onClick={() => setMobileMenuOpen(false)}>
              Features
            </Link>
            <Link href="#anonymous" onClick={() => setMobileMenuOpen(false)}>
              Anonymous Accounts
            </Link>
            <Link href="#compliance" onClick={() => setMobileMenuOpen(false)}>
              Compliance
            </Link>
          </div>

          <div className="mt-auto flex flex-col gap-4">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-between w-full p-4 rounded-xl bg-muted text-foreground font-medium"
            >
              <span>Switch Theme</span>
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link
              href="/app"
              className="w-full py-4 bg-accent text-accent-foreground text-center font-bold rounded-xl text-lg"
            >
              Launch App
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default LandingNavbar;
