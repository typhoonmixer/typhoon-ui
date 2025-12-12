"use client";
import React, { useId } from "react";
import { useNetwork, useSwitchChain } from "@starknet-react/core";
import { mainnet, sepolia } from "@starknet-react/chains";
import GenericModal from "../../utils/GenericModal";
import toast from "react-hot-toast";

const networks = [
  { id: sepolia.id, name: "Sepolia" },
  { id: mainnet.id, name: "Mainnet" },
];

export default function NetworkSwitcher() {
  const { chain } = useNetwork();
  const { switchChain, switchChainAsync, isPending } = useSwitchChain({});
  const [mounted, setMounted] = React.useState(false);

  // Generate a unique ID for this specific instance of the switcher
  const uniqueId = useId();
  const modalId = `network-modal-${uniqueId.replace(/:/g, "")}`;

  React.useEffect(() => setMounted(true), []);

  const current = React.useMemo(() => {
    if (!mounted) return "Network";
    try {
      const hint = (localStorage.getItem("preferredChain") || "").toLowerCase();
      if (hint.includes("main")) return "Mainnet";
      if (hint.includes("sepolia")) return "Sepolia";
    } catch {}
    return networks.find((n) => n.id === chain?.id)?.name || "Unknown";
  }, [mounted, chain?.id]);

  const togglePopover = () => {
    const pop = document.getElementById(modalId);
    pop?.togglePopover?.();
  };

  return (
    <>
      <button
        aria-haspopup="dialog"
        onClick={togglePopover}
        className="inline-flex items-center rounded-lg border border-accent bg-muted/20 hover:bg-muted/40 transition-colors"
      >
        <div className="grid h-8 w-8 place-content-center rounded-md bg-accent text-accent-foreground">
          <span className="text-xs font-semibold">
            {(mounted ? current : "N").charAt(0)}
          </span>
        </div>
        <div className="px-3 py-1.5 text-sm font-medium text-card-foreground">
          {mounted ? current : "Network"}
        </div>
      </button>

      {mounted && (
        <GenericModal
          popoverId={modalId}
          // Responsive styles:
          // - fixed/inset-0/m-auto: Centers native popover on mobile & desktop
          // - z-[1000]: Ensures it sits above mobile menu (which is z-40)
          // - w-[90vw]: Prevents overflow on small phones
          style="fixed inset-0 m-auto z-[1000] w-[90vw] max-w-[20rem] h-fit rounded-xl border border-border bg-card p-4 shadow-2xl backdrop:bg-black/50"
        >
          <div className="flex items-center justify-between px-1 pb-3 mb-2 border-b border-border">
            <span className="text-sm font-medium text-muted-foreground">
              Choose network
            </span>
            <button
              popoverTarget={modalId}
              popoverTargetAction="hide"
              className="grid h-7 w-7 place-content-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {networks.map((n) => {
              const active = n.id === chain?.id;
              return (
                <button
                  key={String(n.id)}
                  disabled={isPending}
                  onClick={async () => {
                    try {
                      const tId = toast.loading(`Switching to ${n.name}…`, {
                        position: "bottom-right",
                      });
                      await switchChainAsync({ chainId: n.id.toString() });
                      toast.dismiss(tId);
                      toast.success(`Switched to ${n.name}`, {
                        position: "bottom-right",
                      });
                    } catch (e) {
                      // Fallback for wallets without programmatic switching
                      const pref = n.id === mainnet.id ? "mainnet" : "sepolia";
                      try {
                        localStorage.setItem("preferredChain", pref);
                      } catch {}

                      toast.success(
                        `App set to ${n.name}. Please ensure your wallet matches.`,
                        { position: "bottom-right" }
                      );
                      window.location.reload();
                    } finally {
                      try {
                        const pop = document.getElementById(modalId);
                        pop?.hidePopover?.();
                      } catch {}
                    }
                  }}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-all ${
                    active
                      ? "border-accent text-accent bg-accent/5"
                      : "border-border text-card-foreground hover:bg-muted/40"
                  }`}
                >
                  <span className="font-medium">{n.name}</span>
                  {active && (
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  )}
                </button>
              );
            })}
          </div>
        </GenericModal>
      )}
    </>
  );
}
