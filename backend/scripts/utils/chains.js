"use strict";
exports.__esModule = true;
exports.chainRpc = exports.chain = void 0;
require('dotenv').config({ path: __dirname + '/../../.env' });
var chains_1 = require("viem/chains");
var CHAIN = process.env.CHAIN || "foundry";
var MUMBAI_ALCHEMY_API_KEY = process.env.MUMBAI_ALCHEMY_API_KEY || "";
var POLYGON_ALCHEMY_API_KEY = process.env.POLYGON_ALCHEMY_API_KEY || "";
var chains = {
    foundry: chains_1.foundry,
    polygonMumbai: chains_1.polygonMumbai,
    polygon: chains_1.polygon
};
var rpc = {
    foundry: "",
    polygonMumbai: MUMBAI_ALCHEMY_API_KEY,
    polygon: POLYGON_ALCHEMY_API_KEY
};
exports.chain = chains[CHAIN];
exports.chainRpc = rpc[CHAIN];
