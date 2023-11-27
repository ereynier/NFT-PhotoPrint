import { foundry, polygonMumbai, polygon, Chain } from "viem/chains";

const CHAIN = process.env.CHAIN || "foundry";
const MUMBAI_ALCHEMY_API_KEY = process.env.MUMBAI_ALCHEMY_API_KEY || "";
const POLYGON_ALCHEMY_API_KEY = process.env.POLYGON_ALCHEMY_API_KEY || "";

const chains: {[key: string]: Chain} = {
    foundry,
    polygonMumbai,
    polygon
};

const rpc: {[key: string]: string} = {
    foundry: "",
    polygonMumbai: MUMBAI_ALCHEMY_API_KEY,
    polygon: POLYGON_ALCHEMY_API_KEY
};

export const chain: Chain = chains[CHAIN];

export const chainRpc: string = rpc[CHAIN];