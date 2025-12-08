"use client";
import { useProvider } from "@starknet-react/core";
import { ChevronDown, Monitor, Moon, Sun, X } from "lucide-react";
import React, { useState } from "react";

function SettingsDropDown({ theme, changeTheme, setIsSettingsOpen }) {
  const [rpc, setRpc] = useState("blockscoutRPC");
  const { provider } = useProvider();

  return (
    <div className="absolute right-0 top-12 w-[340px] bg-card border border-border rounded-xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-card-foreground">Settings</h3>
        <button
          onClick={() => setIsSettingsOpen(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-xs font-mono text-muted-foreground mb-2 block uppercase tracking-wider">
            App Theme
          </label>
          <div className="grid grid-cols-3 gap-2 bg-muted/50 p-1 rounded-lg border border-border">
            <button
              onClick={() => changeTheme("light")}
              className={`flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                theme === "light"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <Sun size={14} /> Light
            </button>
            <button
              onClick={() => changeTheme("dark")}
              className={`flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                theme === "dark"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <Moon size={14} /> Dark
            </button>
            <button
              onClick={() => changeTheme("system")}
              className={`flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                theme === "system"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <Monitor size={14} /> Auto
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            RPC endpoint
          </label>
          <div className="relative">
            <select
              value={rpc}
              onChange={(e) => setRpc(e.target.value)}
              className="w-full bg-muted/50 border border-border bg-card text-foreground text-sm rounded-lg px-3 py-2.5 appearance-none focus:border-accent focus:outline-none cursor-pointer hover:border-border/80 transition-colors"
            >
              <option value="infura">Infura</option>
              <option value="alchemy">Alchemy</option>
              <option value="lava">Lava</option>
              <option value="blast">Blast</option>
              <option value="reddio">Reddio</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-3 text-muted-foreground pointer-events-none"
            />
          </div>
          {provider && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] font-bold text-green-500">
                RPC status:
              </span>
              <span className="text-[10px] text-green-500">OK</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => {
              setRpc("blockscoutRPC");
            }}
            className="flex-1 py-2 rounded-lg border border-accent/30 text-accent text-sm font-bold hover:bg-accent/10 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="flex-1 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 transition-colors shadow-lg shadow-accent/20"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsDropDown;
