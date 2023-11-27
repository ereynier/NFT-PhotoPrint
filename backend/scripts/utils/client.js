"use strict";
exports.__esModule = true;
exports.publicClient = void 0;
var viem_1 = require("viem");
var chains_1 = require("./chains");
exports.publicClient = (0, viem_1.createPublicClient)({
    chain: chains_1.chain,
    transport: (0, viem_1.http)()
});
