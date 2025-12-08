import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

function HeroSections() {
  return (
    <section className="relative pt-40 pb-20 md:pt-40 md:pb-32 px-6">
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
          Typhoon breaks the on-chain link between sender and receiver. Secure,
          compliant, and powered by Starknet ZK proofs.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/app"
            className="w-full sm:w-auto px-8 py-4 bg-accent text-accent-foreground font-bold text-lg rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_-10px_var(--accent)]"
          >
            Launch App <ArrowRight size={20} />
          </Link>
          <Link
            href="https://typhoon-2.gitbook.io/typhoon-docs"
            target="_blank"
            rel="noopener noreferrer"
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
  );
}

export default HeroSections;
