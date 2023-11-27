import { createPublicClient, http } from "viem";
import { chain, chainRpc } from "./chains";

export const publicClient = createPublicClient({
    chain: chain,
    transport: http(chainRpc),
})
