"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wind,
  Moon,
  Sun,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Zap,
  EyeOff,
  Lock,
  FileText,
  ChevronRight,
  Tornado,
  Ghost,
  Globe,
} from "lucide-react";
import Logo from "./components/Logo";

// --- NAVBAR COMPONENT ---
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark"); // Default to dark based on client preference usually

  // Initialize theme
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
          {/* Logo */}
          <Logo href="/" />

          {/* Desktop Nav */}
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
              href="#developers"
              className="hover:text-foreground transition-colors"
            >
              Developers
            </Link>
          </div>

          {/* Actions */}
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

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl animate-in slide-in-from-right duration-300 md:hidden flex flex-col p-6">
          <div className="flex justify-between items-center mb-12">
            <span className="font-bold text-xl flex items-center gap-2">
              <Wind className="text-accent" /> Typhoon
            </span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2">
              <X size={28} />
            </button>
          </div>

          <div className="flex flex-col gap-6 text-xl font-medium text-muted-foreground">
            <Link href="#features" onClick={() => setMobileMenuOpen(false)}>
              Features
            </Link>
            <Link href="#compliance" onClick={() => setMobileMenuOpen(false)}>
              Compliance
            </Link>
            <Link href="#developers" onClick={() => setMobileMenuOpen(false)}>
              Developers
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
};

// --- FEATURE CARD COMPONENT ---
const FeatureCard = ({ icon, title, desc }) => (
  <div className="group p-8 rounded-3xl bg-card border border-border hover:border-accent/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-accent/5">
    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3 text-card-foreground">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{desc}</p>
  </div>
);

// --- MAIN PAGE ---
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden transition-colors duration-300">
      <Navbar />

      {/* --- HERO --- */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6">
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[500px] bg-accent blur-[120px] rounded-full pointer-events-none opacity-20 dark:opacity-20 mix-blend-screen"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/20 text-accent text-xs md:text-sm font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
            </span>
            Privacy Protocol on Starknet
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1] md:leading-[1.1]">
            Privacy is your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">
              Fundamental Right.
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Typhoon breaks the on-chain link between sender and receiver.
            Secure, compliant, and powered by Starknet ZK proofs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              href="/app"
              className="w-full sm:w-auto px-8 py-4 bg-accent text-accent-foreground font-bold text-lg rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_-10px_var(--accent)]"
            >
              Launch App <ArrowRight size={20} />
            </Link>
            <Link
              href="/docs"
              className="w-full sm:w-auto px-8 py-4 bg-card border border-border text-muted-foreground font-bold text-lg rounded-xl hover:text-foreground hover:border-foreground/20 transition-all flex items-center justify-center gap-2"
            >
              Documentation
            </Link>
          </div>

          {/* Stats Section */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
            {[
              { label: "Total Volume", value: "$4.2M+" },
              { label: "Anonymity Set", value: "12,403" },
              { label: "Relayer Fee", value: "0%" },
              { label: "Network", value: "Starknet" },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-card/50 border border-border backdrop-blur-sm hover:border-accent/30 transition-colors"
              >
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-semibold">
                  {stat.label}
                </p>
                <p className="text-2xl md:text-3xl font-mono font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section
        id="features"
        className="py-24 md:py-32 bg-muted/30 border-y border-border"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              The Architecture
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for speed, privacy, and usability. We leverage native
              Account Abstraction to provide a seamless experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<EyeOff size={28} strokeWidth={2} />}
              title="True Anonymity"
              desc="Your deposits are mixed into a shared pool. When you withdraw, cryptographic proofs verify your ownership without revealing the source wallet."
            />
            <FeatureCard
              icon={<Zap size={28} strokeWidth={2} />}
              title="Gasless Withdrawals"
              desc="Integrated Paymaster support allows you to withdraw funds to a completely empty wallet without needing ETH for gas. No paper trail."
            />
            <FeatureCard
              icon={<ShieldCheck size={28} strokeWidth={2} />}
              title="Arbitrary Amounts"
              desc="Unlike legacy mixers with fixed denominations, Typhoon supports flexible amounts, making it perfect for payroll, donations, and daily commerce."
            />
          </div>
        </div>
      </section>

      {/* --- ANONYMOUS ACCOUNTS (NEW) --- */}
      <section
        id="accounts"
        className="py-24 md:py-32 px-6 relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Mock UI Card - Placed first on large screens for alternating look */}
          <div className="order-2 md:order-1 relative">
            <div className="absolute inset-0 bg-purple-500 blur-[100px] opacity-10 rounded-full"></div>
            <div className="relative bg-card border border-border rounded-3xl p-8 shadow-2xl hover:scale-[1.02] transition-transform duration-500">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                    <Ghost size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-card-foreground">
                      Anon Account #4
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      0x...8a29
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold border border-accent/20">
                  ACTIVE
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-center gap-4">
                  <Globe size={20} className="text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Connected to StarkDefi
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Swapping via Typhoon
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-center gap-4 opacity-60">
                  <ShieldCheck size={20} className="text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Identity Shielded</p>
                    <p className="text-xs text-muted-foreground">
                      No link to main wallet
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 text-xs font-bold uppercase tracking-wider mb-6">
              <Ghost size={12} /> Ecosystem Access
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Anonymous <br /> Accounts.
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Typhoon anonymous accounts allows you or your users to access all
              the Starknet ecosystem in anonymous mode.
            </p>
            <p className="text-muted-foreground mb-8">
              Interact with DeFi, NFTs, and governance without doxxing your main
              wallet. Create ephemeral accounts on-the-fly, funded via privacy
              pools.
            </p>
            <button className="text-accent font-bold hover:text-accent-foreground flex items-center gap-2 transition-colors group">
              Create Anonymous Account{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </section>

      {/* --- COMPLIANCE --- */}
      <section
        id="compliance"
        className="py-24 md:py-32 px-6 relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold uppercase tracking-wider mb-6">
              <Lock size={12} /> Compliance Ready
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Privacy without <br /> the Risk.
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Financial privacy shouldn't mean non-compliance. Typhoon includes
              a built-in
              <span className="text-foreground font-semibold">
                {" "}
                Compliance Tool
              </span>{" "}
              that puts you in control of your data disclosure.
            </p>

            <div className="space-y-6">
              {[
                "Generate cryptographic proof of funds origin.",
                "Share view keys with auditors or exchanges safely.",
                "Maintain public privacy while ensuring regulatory transparency.",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 min-w-[24px] h-[24px] rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <ChevronRight size={14} strokeWidth={3} />
                  </div>
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/app/compliance"
                className="text-accent font-bold hover:text-accent-foreground flex items-center gap-2 transition-colors group"
              >
                Try Compliance Tool{" "}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>

          {/* Mock UI Card */}
          <div className="order-1 md:order-2 relative">
            <div className="absolute inset-0 bg-accent blur-[120px] opacity-20 rounded-full"></div>
            <div className="relative bg-card border border-border rounded-3xl p-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
                <div className="p-3 bg-muted rounded-xl text-accent">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-card-foreground">
                    Compliance Report
                  </h4>
                  <p className="text-sm text-muted-foreground font-mono">
                    ID: #ZK-9928-A
                  </p>
                </div>
                <div className="ml-auto px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20">
                  VERIFIED
                </div>
              </div>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Source Wallet</span>
                  <span className="text-card-foreground">0x7a...9f2</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Deposit Amount</span>
                  <span className="text-card-foreground font-bold">
                    1,000.00 STRK
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Note Hash</span>
                  <span className="text-card-foreground truncate w-32">
                    0x8b2...11a
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Timestamp</span>
                  <span className="text-card-foreground">2024-12-05 14:30</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-card border-t border-border py-16 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div>
            <Logo />
            <p className="text-muted-foreground text-sm max-w-xs mt-4">
              The privacy layer for Starknet. Open source, immutable, and
              trustless.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 md:gap-12 text-sm font-medium text-muted-foreground">
            <div className="flex flex-col gap-4">
              <span className="text-foreground font-bold text-xs uppercase tracking-wider">
                Product
              </span>
              <Link href="/app" className="hover:text-accent transition-colors">
                App
              </Link>
              <Link
                href="/app/compliance"
                className="hover:text-accent transition-colors"
              >
                Compliance
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-foreground font-bold text-xs uppercase tracking-wider">
                Resources
              </span>
              <Link
                href="https://typhoon-2.gitbook.io/typhoon-docs"
                className="hover:text-accent transition-colors"
              >
                Documentation
              </Link>
              <Link
                href="https://github.com/typhoonmixer/typhoon_sdk_docs"
                className="hover:text-accent transition-colors"
              >
                Typhoon SDK
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-foreground font-bold text-xs uppercase tracking-wider">
                Social
              </span>
              <Link
                href="https://x.com/Typhoon_mixer"
                className="hover:text-accent transition-colors"
              >
                Twitter
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-border/50 text-xs text-muted-foreground flex justify-between items-center">
          <p>© {new Date().getFullYear()} Typhoon Protocol.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
