"use client";
import React from "react";
import { useNetwork, useSwitchChain } from "@starknet-react/core";
import { mainnet, sepolia } from "@starknet-react/chains";
import GenericModal from "../../utils/GenericModal";
import toast from 'react-hot-toast';

const networks = [
  { id: sepolia.id, name: "Sepolia" },
  { id: mainnet.id, name: "Mainnet" },
];

export default function NetworkSwitcher() {
  const { chain } = useNetwork();
  const { switchChain, switchChainAsync, isPending } = useSwitchChain({});
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const current = React.useMemo(() => {
    if (!mounted) return 'Network';
    try {
      const hint = (localStorage.getItem('preferredChain') || '').toLowerCase();
      if (hint.includes('main')) return 'Mainnet';
      if (hint.includes('sepolia')) return 'Sepolia';
    } catch {}
    return networks.find((n) => n.id === chain?.id)?.name || 'Unknown';
  }, [mounted, chain?.id]);

  const togglePopover = (id: string) => {
    const pop = document.getElementById(id);
    // @ts-ignore
    pop?.togglePopover?.();
  };

  return (
    <>
      <button
        aria-haspopup="dialog"
        onClick={() => togglePopover("network-modal")}
        className="inline-flex items-center rounded-lg border border-accent bg-muted/20 hover:bg-muted/40"
      >
        <div className="grid h-8 w-8 place-content-center rounded-md bg-accent text-accent-foreground">
          <span className="text-xs font-semibold">{(mounted ? current : 'N').charAt(0)}</span>
        </div>
        <div className="px-3 py-1.5 text-sm font-medium text-card-foreground">{mounted ? current : 'Network'}</div>
      </button>

      {mounted && (
      <GenericModal
        popoverId="network-modal"
        style="mx-auto mt-16 w-[90vw] max-w-[20rem] rounded-[12px] border border-border bg-card p-3"
      >
        <div className="flex items-center justify-between px-1 pb-2">
          <span className="text-sm text-muted-foreground">Choose network</span>
          <button
            // @ts-ignore
            popoverTarget="network-modal"
            popoverTargetAction="hide"
            className="grid h-7 w-7 place-content-center rounded-full hover:bg-muted"
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
                  let switched = false;
                  try {
                    const tId = toast.loading(`Switching to ${n.name}…`, { position: 'bottom-right', duration: 6000 });
                    await switchChainAsync({ chainId: n.id });
                    toast.dismiss(tId);
                    toast.success(`Switched to ${n.name}`, { position: 'bottom-right', duration: 6000 });
                    switched = true;
                  } catch (e) {
                    // Fallback for wallets that don't support programmatic switching (e.g., Braavos)
                    const pref = n.id === mainnet.id ? 'mainnet' : 'sepolia';
                    try { localStorage.setItem('preferredChain', pref); } catch {}
                    toast.success(`App set to ${n.name}. If your wallet didn't switch, please change it in the wallet to interact.`, { position: 'bottom-right', duration: 6000 });
                    // Reload so defaultChainId picks up preferredChain for read operations
                    window.location.reload();
                  } finally {
                    try {
                      const pop = document.getElementById("network-modal");
                      // @ts-ignore
                      pop?.hidePopover?.();
                    } catch {}
                  }
                }}
                className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                  active
                    ? 'border-accent text-accent'
                    : 'border-border text-card-foreground hover:bg-muted/40'
                }`}
              >
                <span>{n.name}</span>
                {active && <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />}
              </button>
            );
          })}
        </div>
      </GenericModal>
      )}
    </>
  );
}
