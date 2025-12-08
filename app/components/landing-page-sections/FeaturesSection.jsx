import { EyeOff, ShieldCheck, Zap } from "lucide-react";
import React from "react";

function FeaturesSection() {
  return (
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
            Built for speed, privacy, and usability. We leverage native Account
            Abstraction to provide a seamless experience.
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
  );
}

const FeatureCard = ({ icon, title, desc }) => (
  <div className="group p-8 rounded-3xl bg-card border border-border hover:border-accent/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-accent/5">
    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3 text-card-foreground">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{desc}</p>
  </div>
);

export default FeaturesSection;
