import Image from "next/image";
import Close from "../../../public/svg/Close";
import GenericModal from "../../utils/GenericModal";
import React, { useEffect, useState, useRef } from "react";

const loader = ({ src }: { src: string }) => {
  return src;
};


const NoteAccountModal = () => {
  const [noteValue, setNoteValue] = useState("");
  return (
    <GenericModal
      popoverId="connect-modal"
      style="text-white align-items:center; border-outline-grey mx-auto w-[90vw] rounded-[25px] border-[1px] border-solid bg-[#1c1b1f] md:h-[30rem] md:w-[45rem]"
    >
      <div className="lg:border-outline-grey basis-5/6 lg:col-span-2 lg:border-r-[1px] lg:border-solid lg:py-4 lg:pl-8">
        <h2 className="my-4 text-center text-[1.125em] font-bold text-white lg:text-start">
          Connect a Note Account
        </h2>
      </div>
      <div className="flex">
        <div className="relative bg-[#212429] p-12 py-6 rounded-xl mb-5 ml-10 border-transparent hover:border-zinc-600">
          <div className="flex items-center rounded-xl">
            <input
              className={getInputClassname()}
              type={"text"}
              value={noteValue}
              placeholder={"type or paste your private key here..."}
              disabled={false}
              onChange={(e) => {
                setNoteValue(e.target.value);
              }}
            />
          </div>
        </div>

        <button style={{ backgroundColor: 'blue', color: 'white' , marginLeft: '10px'}}
          aria-haspopup="dialog"
          onClick={() => console.log("Connect Note Account")}
          className="rounded-[12px] bg-button-primary bg-blue px-4 py-3 text-background-primary-light transition-all duration-300 hover:rounded-[30px] md:py-4"
        >
          Connect
        </button>
      </div>
      <div className="items-center lg:border-outline-grey ml-10 basis-5/6 lg:col-span-2 lg:border-r-[1px] lg:border-solid lg:py-4 lg:pl-8">
        <h2 className="my-4 text-center text-[1.125em] font-bold text-white lg:text-start">
          Or
        </h2>
      </div>
      <button style={{ backgroundColor: 'blue', color: 'white' , marginRight: '10px'}}
          aria-haspopup="dialog"
          onClick={() => console.log("Create Note Account")}
          className="items-center rounded-[12px] bg-button-primary bg-blue px-6 py-3 text-background-primary-light transition-all duration-300 hover:rounded-[30px] md:py-4"
        >
          Create Note Account
        </button>
      {/* <div className="flex flex-col">
        <div className="flex w-full p-4 lg:grid lg:grid-cols-5 lg:p-0">
          <div className="lg:border-outline-grey basis-5/6 lg:col-span-2 lg:border-r-[1px] lg:border-solid lg:py-4 lg:pl-8">
            <h2 className="my-4 text-center text-[1.125em] font-bold text-white lg:text-start">
              Connect a Wallet
            </h2>
          </div>
          <div className="ml-auto lg:col-span-3 lg:py-4 lg:pr-8">
            <button
              //@ts-ignore
              popoverTarget="connect-modal"
              popoverTargetAction="hide"
              className="bg-outline-grey grid h-8 w-8 place-content-center rounded-full"
            >
              <Close />
            </button>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between lg:grid lg:grid-cols-5">
          <div className="lg:border-outline-grey px-8 lg:col-span-2 lg:h-full lg:border-r-[1px] lg:border-solid">
            <h4 className="text-text-grey mb-[1rem] font-semibold">Popular</h4>

            <div className="flex flex-col gap-4 py-8">
              {connectors.map((connector, index) => (
                <Wallet
                  key={connector.id || index}
                  src={getLightTheme(connector.icon)}
                  name={connector.name}
                  connector={connector}
                  alt="alt"
                />
              ))}
            </div>
          </div>
          <div className="border-red h-fit border-t-[.5px] border-solid p-4 lg:col-span-3 lg:flex lg:h-full lg:flex-col lg:border-none lg:px-8 lg:py-0">
            <h2 className="font-bold lg:mb-[3rem] lg:text-center lg:text-[1.125em]">
              What is a wallet?
            </h2>
            <article className="hidden flex-col place-content-center gap-8 self-center justify-self-center text-[0.875em] lg:flex">
              <div className="grid grid-cols-10 items-center gap-4">
                <div className="col-span-2 h-[3rem] w-[3rem] rounded-[10px] border-[2px] border-solid border-white">
                  <Image
                    alt="text"
                    loader={loader}
                    unoptimized
                    src={
                      "https://media.istockphoto.com/id/1084096262/vector/concept-of-mobile-payments-wallet-connected-with-mobile-phone.jpg?s=612x612&w=0&k=20&c=noILf6rTUyxN41JnmeFhUmqQWiCWoXlg0zCLtcrabD4="
                    }
                    width={100}
                    height={100}
                    className="h-full w-full rounded-[10px] object-cover"
                  />
                </div>
                <div className="col-span-8 flex flex-col gap-2">
                  <h4 className="text-[1.14em] font-bold">
                    A home for your digital assets
                  </h4>
                  <p className="text-text-grey">
                    Wallets are used to send, receive, store, and display
                    digital assets like Ethereum and NFTs.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-10 items-center gap-4">
                <div className="col-span-2 h-[3rem] w-[3rem] rounded-[10px] border-[2px] border-solid border-white">
                  <Image
                    alt="text"
                    loader={loader}
                    unoptimized
                    src={
                      "https://media.istockphoto.com/id/1084096262/vector/concept-of-mobile-payments-wallet-connected-with-mobile-phone.jpg?s=612x612&w=0&k=20&c=noILf6rTUyxN41JnmeFhUmqQWiCWoXlg0zCLtcrabD4="
                    }
                    width={100}
                    height={100}
                    className="h-full w-full rounded-[10px] object-cover"
                  />
                </div>
                <div className="col-span-8 flex flex-col gap-2">
                  <h4 className="text-[1.14em] font-bold">
                    A new way to sign-in
                  </h4>
                  <p className="text-text-grey pb-2">
                    Instead of creating new accounts and passwords on every
                    website, just connect your wallet.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div> */}
    </GenericModal>
  );

  function getInputClassname() {
    let className =
      ' w-full outline-none h-4  appearance-none text-1xl bg-transparent'
    return className
  }
};

type Theme = string | { dark: string; light: string };

function getLightTheme(value: Theme): string {
  if (typeof value === "object" && value !== null) {
    // Assert that 'value' is of the expected object type
    const theme = value as { dark: string; light: string };
    return theme.light;
  } else {
    // Handle the case where 'value' is a string
    return value as string;
  }
}

const NoteAccountButton = ({
  text = " Note Account",
  className = "rounded-[12px] bg-button-primary bg-blue px-6 py-3 text-background-primary-light transition-all duration-300 hover:rounded-[30px] md:py-4",
}: {
  text?: string;
  className?: string;
}) => {
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
        style={{ backgroundColor: "blue", color: "white" }}
        aria-haspopup="dialog"
        onClick={() => togglePopover({ targetId: "connect-modal" })}
        className={className}
      >
        {text}
      </button>
      <NoteAccountModal />
    </>
  );
};

export default NoteAccountButton;
