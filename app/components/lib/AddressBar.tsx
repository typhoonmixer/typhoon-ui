"use client";
import {
  useAccount,
  useDisconnect,
  useStarkProfile,
  useConnect,
  useSwitchChain,
  useNetwork,
} from "@starknet-react/core";
import Blockies from "react-blockies";
import AccountBalance from "./AccountBalance";
import GenericModal from "../../utils/GenericModal";
import Close from "../../../public/svg/Close";
import { useEffect, useState } from "react";
import CopyButton from "../../utils/CopyButton";
import { constants } from "starknet";

const UserModal = () => {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { chain } = useNetwork();

  const { disconnect } = useDisconnect();
  const [imageError, setImageError] = useState(false);
  const { data: starkProfile } = useStarkProfile({
    address,
  });

  return (
    <GenericModal
      popoverId="user-popover"
      style="fixed inset-0 z-[1000]"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60"
        onClick={() => {
          const popover = document.getElementById("user-popover");
          // @ts-ignore
          popover?.hidePopover?.();
        }}
      />
      {/* Card */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="pointer-events-auto mx-auto mt-12 md:mt-16 w-[92vw] max-w-[32rem] rounded-[16px] border border-border bg-card p-5 text-card-foreground shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">Connected</h3>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" aria-label="Wallet connected" />
              <span className="ml-2 inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
                {mounted ? ((() => {
                  let hint = '';
                  try { hint = (localStorage.getItem('preferredChain') || '').toLowerCase(); } catch {}
                  if (hint.includes('main')) return 'Starknet';
                  if (hint.includes('sepolia')) return 'Starknet Sepolia Testnet';
                  return chain?.name || 'Network';
                })()) : 'Network'}
              </span>
            </div>
            <button
              className="grid h-8 w-8 place-content-center rounded-full hover:bg-muted"
              onClick={() => {
                const pop = document.getElementById("user-popover");
                // @ts-ignore
                pop?.hidePopover?.();
              }}
            >
              <Close />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="h-9 w-9 overflow-clip rounded-full md:h-10 md:w-10">
              {!imageError && starkProfile?.profilePicture ? (
                <img
                  src={starkProfile?.profilePicture}
                  className="w-full rounded-full"
                  alt="starknet profile"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Blockies seed={address || ""} scale={8} className="mx-auto h-full w-full rounded-full" />
              )}
            </div>
            <CopyButton
              copyText={starkProfile?.name || address || ""}
              buttonText={
                starkProfile?.name || address?.slice(0, 10).concat("...").concat(address?.slice(-5))
              }
              className="flex items-center gap-2 text-sm text-card-foreground/90 hover:text-card-foreground"
              iconClassName="text-accent"
            />
          </div>

          <div className="mt-4">
            <h4 className="mb-2 text-sm text-muted-foreground">Assets</h4>
            <AccountBalance address={address || ""} heading={false} />
          </div>

          <div className="mt-4">
            <button
              onClick={() => {
                const popover = document.getElementById("user-popover");
                // @ts-ignore
                popover?.hidePopover?.();
                disconnect();
              }}
              className="w-full rounded-[10px] border border-border bg-muted p-2.5 text-red-400 hover:bg-muted/70"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </GenericModal>
  );
};

const AddressBar = () => {
  const { address } = useAccount();
  
  const { data: starkProfile } = useStarkProfile({
    address,
  });
  const [imageError, setImageError] = useState(false);
  if (!address) {
    return null;
  }

  const togglePopover = ({ targetId }: { targetId: string }) => {
    const popover = document.getElementById(targetId);
    // @ts-ignore
    popover.togglePopover();
    if (popover) {
      popover.addEventListener("toggle", () => {
        if (popover.matches(":popover-open")) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "auto";
        }
      });
    }
  };

  return (
    <>
      <button
        aria-haspopup="dialog"
        onClick={() => togglePopover({ targetId: "user-popover" })}
        className="rounded-full border border-border bg-muted px-3 py-1.5 text-card-foreground hover:bg-muted/70"
      >
        {
          <span className="flex items-center">
            {!imageError && starkProfile?.profilePicture ? (
              <img
                src={starkProfile.profilePicture}
                className="mr-2 h-8 w-8 rounded-full"
                alt="starknet profile"
                onError={() => {
                  setImageError(true);
                }}
              />
            ) : (
              <Blockies seed={address} className="mr-2 h-8 w-8 rounded-full" />
            )}
            {starkProfile?.name
              ? starkProfile.name
              : address?.slice(0, 6).concat("...").concat(address?.slice(-5))}
          </span>
        }
      </button>
      <UserModal />
    </>
  );
};

export default AddressBar;
export const UserModalMount = UserModal;
