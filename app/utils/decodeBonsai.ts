import { getSealAndJournal, Client } from "bonsai-sdk"
import { ethers } from "ethers";

export async function uploadInputs(n: number): Promise<any> {
    const types = ["uint256"];
    const values = [n];

    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(types, values);

    const bonsaiClient = await Client.fromEnv(process.env.NEXT_PUBLIC_VERSION)
    let inputId = await bonsaiClient.uploadInput(encoded)
    // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2]

    let session = await bonsaiClient.createSession(process.env.NEXT_PUBLIC_IMAGE_ID, inputId, [], false)
    let receipt = undefined
    while (true) {
        // Get current status (assumed to return a Promise)
        const res = await session.status(bonsaiClient);

        if (res.status === "RUNNING") {
            console.error(
                `Current status: ${res.status} - state: ${res.state || ""} - continue polling...`
            );
            // Wait for 15 seconds before polling again
            await new Promise(resolve => setTimeout(resolve, 15000));
            continue;
        }

        if (res.status === "SUCCEEDED") {
            if (!res.receipt_url) {
                throw new Error("API error, missing receipt on completed session");
            }
            const receiptUrl = res.receipt_url;
            const receiptBuf = await bonsaiClient.download(receiptUrl);
            let proof = await getSealAndJournal(receiptBuf)
            console.log("seal ", proof[0])
            console.log("journal ", proof[1])
            
        } else {
            throw new Error(
                `Workflow exited: ${res.status} - | err: ${res.error_msg || ""}`
            );
        }

        // Exit the loop once done
        break;
    }
    // const snarkSession = await bonsaiClient.createSnark(session.uuid);
    // console.info(`Created snark session: ${snarkSession.uuid}`);

    // // Poll the session status until it's not "RUNNING".
    // let snarkReceipt: any;
    // while (true) {
    //     const res = await snarkSession.status(bonsaiClient);

    //     if (res.status === "RUNNING") {
    //         console.info(`Current status: ${res.status} - continue polling...`);
    //         // Wait for 15 seconds before trying again.
    //         await new Promise(resolve => setTimeout(resolve, 15000));
    //         continue;
    //     } else if (res.status === "SUCCEEDED") {
    //         if (res.output == null) {
    //             throw new Error("No snark generated :(");
    //         }
    //         snarkReceipt = res.output;
    //         break;
    //     } else {
    //         throw new Error(
    //             `Workflow exited: ${res.status} - err: ${res.error_msg || ""}`
    //         );
    //     }
    // }
    // console.log("snark: ",snarkReceipt)
    return receipt
}
