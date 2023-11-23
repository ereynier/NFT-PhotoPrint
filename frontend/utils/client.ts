import { createPublicClient, http } from "viem";
import { chain } from "./chains";

export const publicClient = createPublicClient({
    chain: chain,
    transport: http(),
})
