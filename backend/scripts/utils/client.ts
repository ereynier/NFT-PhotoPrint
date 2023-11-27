require('dotenv').config({ path: __dirname+'/../../.env' });
import { createPublicClient, http } from "viem";
import { chain, chainRpc } from "./chains";

export const publicClient = createPublicClient({
    chain: chain,
    transport: http(chainRpc),
})


import { createWalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY as `0x${string}`

if (!ADMIN_PRIVATE_KEY) {
    throw new Error('ADMIN_PRIVATE_KEY is not defined')
}

const account = privateKeyToAccount(ADMIN_PRIVATE_KEY)

export const walletClient = createWalletClient({
    account,
    chain: chain,
    transport: http(chainRpc)
})