import {
  ArrowRight,
  ChevronRight,
  Ghost,
  Globe,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import React from "react";

function AnonymousAccountsSection() {
  return (
    <section
      id="anonymous"
      className="py-24 md:py-32 px-6 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
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
                  <p className="text-sm font-medium">Connected to StarkDefi</p>
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
          <div>
            <Link
              href="/app/anonymousaccount"
              className="text-accent font-bold hover:text-accent-foreground flex items-center gap-2 transition-colors group"
            >
              Create Anonymous Account
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AnonymousAccountsSection;
