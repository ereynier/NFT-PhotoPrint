"use strict";
exports.__esModule = true;
exports.chain = void 0;
require('dotenv').config({ path: __dirname + '/../.env' });
var chains_1 = require("viem/chains");
var CHAIN = process.env.CHAIN || "foundry";
var chains = {
    foundry: chains_1.foundry,
    polygonMumbai: chains_1.polygonMumbai,
    polygon: chains_1.polygon
};
exports.chain = chains[CHAIN];
