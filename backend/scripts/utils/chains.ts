import dotenv from "dotenv";
import { foundry, polygonMumbai, polygon, Chain } from "viem/chains";

const CHAIN = process.env.CHAIN || "foundry";

const chains: {[key: string]: Chain} = {
    foundry,
    polygonMumbai,
    polygon
};

export const chain: Chain = chains[CHAIN];