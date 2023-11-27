"use strict";
exports.__esModule = true;
exports.walletClient = exports.publicClient = void 0;
require('dotenv').config({ path: __dirname + '/../../.env' });
var viem_1 = require("viem");
var chains_1 = require("./chains");
exports.publicClient = (0, viem_1.createPublicClient)({
    chain: chains_1.chain,
    transport: (0, viem_1.http)(chains_1.chainRpc)
});
var viem_2 = require("viem");
var accounts_1 = require("viem/accounts");
var ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
if (!ADMIN_PRIVATE_KEY) {
    throw new Error('ADMIN_PRIVATE_KEY is not defined');
}
var account = (0, accounts_1.privateKeyToAccount)(ADMIN_PRIVATE_KEY);
exports.walletClient = (0, viem_2.createWalletClient)({
    account: account,
    chain: chains_1.chain,
    transport: (0, viem_1.http)(chains_1.chainRpc)
});
