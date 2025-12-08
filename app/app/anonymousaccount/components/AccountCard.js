import { Check, Copy, Wallet } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";

const AccountCard = ({ account, index }) => {
  const [copied, setCopied] = useState("");

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-accent/30 transition-colors group"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center text-accent">
          <Wallet size={20} />
        </div>
        <div>
          <h3 className="font-bold text-sm">Anon Account #{index + 1}</h3>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="bg-muted/40 p-2 rounded-lg flex items-center justify-between border border-transparent group-hover:border-border transition-colors">
          <div className="text-xs font-mono text-muted-foreground truncate max-w-[250px]">
            <span className="font-bold text-foreground mr-2">ADDR:</span>
            {account.address}
          </div>
          <button
            onClick={() => handleCopy(account.address, "addr")}
            className="text-accent hover:text-foreground"
          >
            {copied === "addr" ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>

        <div className="bg-muted/40 p-2 rounded-lg flex items-center justify-between border border-transparent group-hover:border-border transition-colors">
          <div className="text-xs font-mono text-muted-foreground truncate max-w-[250px]">
            <span className="font-bold text-foreground mr-2">KEY:</span>
            {account.privKey ? `${account.privKey.slice(0, 10)}...` : "******"}
          </div>
          <button
            onClick={() => handleCopy(account.privKey, "key")}
            className="text-accent hover:text-foreground"
          >
            {copied === "key" ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>

        {account.balances && Object.keys(account.balances).length > 0 && (
          <div className="pt-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 ml-1">
              Balances
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(account.balances).map(([token, amount]) => (
                <div
                  key={token}
                  className="bg-muted/40 p-2 rounded-lg flex justify-between items-center border border-transparent group-hover:border-border transition-colors"
                >
                  <span className="text-xs font-bold text-foreground">
                    {token}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AccountCard;
