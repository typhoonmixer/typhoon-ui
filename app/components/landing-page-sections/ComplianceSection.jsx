import { ArrowRight, ChevronRight, FileText, Lock } from "lucide-react";
import Link from "next/link";
import React from "react";

function ComplianceSection() {
  return (
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
            Financial privacy shouldn't mean non-compliance. Typhoon includes a
            built-in
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
  );
}

export default ComplianceSection;
