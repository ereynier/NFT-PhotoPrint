"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var PrinterABI = require('./utils/abi/Printer.abi.json');
var ImageManagerABI = require('./utils/abi/ImageManager.abi.json');
var viem_1 = require("viem");
var client_1 = require("./utils/client"); // create public client with the good chain
var CryptoJS = require('crypto-js');
require('dotenv').config({ path: __dirname + '/../.env' });
var IMAGE_MANAGER_ADDRESS = process.env.IMAGE_MANAGER_ADDRESS;
var ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;
var CREATIVEHUB_BASEURL = process.env.CREATIVEHUB_BASEURL;
var CREATIVEHUB_API_KEY = process.env.CREATIVEHUB_API_KEY;
function checkEnv() {
    if (!IMAGE_MANAGER_ADDRESS) {
        throw new Error('IMAGE_MANAGER_ADDRESS is not defined');
    }
    if (!ENCRYPTION_SECRET) {
        throw new Error('ENCRYPTION_SECRET is not defined');
    }
    if (!CREATIVEHUB_BASEURL) {
        throw new Error('CREATIVEHUB_BASEURL is not defined');
    }
    if (!CREATIVEHUB_API_KEY) {
        throw new Error('CREATIVEHUB_API_KEY is not defined');
    }
}
function cancelOrder(orderId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('cancelOrder', orderId);
                    return [4 /*yield*/, fetch("".concat(CREATIVEHUB_BASEURL, "/api/v1/orders/").concat(orderId), {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'accept': 'application/json',
                                'Authorization': "ApiKey ".concat(CREATIVEHUB_API_KEY)
                            }
                        })
                            .then(function (response) { return response.json(); })
                            .then(function (data) {
                            console.log('cancelOrder', data);
                        })["catch"](function (err) {
                            console.error(err);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function initiatePrint(args, printerAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var imageLockedData, imageLocked, e_1, decrypted, orderId, shippingId, order, externalReference, printedHash, e_2, transaction, confirmation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('initiatePrint', args);
                    return [4 /*yield*/, client_1.publicClient.readContract({
                            address: printerAddress,
                            abi: PrinterABI,
                            functionName: 'getImageLockedByUser',
                            args: [args.user]
                        })];
                case 1:
                    imageLockedData = _a.sent();
                    imageLocked = {
                        imageAddress: imageLockedData[0],
                        imageId: Number(imageLockedData[1]),
                        printed: imageLockedData[2],
                        timestampLock: Number(imageLockedData[3]),
                        cryptedOrderId: imageLockedData[4],
                        owner: imageLockedData[5]
                    };
                    if (imageLocked.imageAddress !== args.imageAddress) {
                        console.error('imageLocked address not matching args', imageLocked, args);
                        return [2 /*return*/];
                    }
                    if (imageLocked.imageId !== Number(args.imageId)) {
                        console.error('imageLocked Id not matching args', imageLocked, args);
                        return [2 /*return*/];
                    }
                    if (imageLocked.cryptedOrderId !== args.cryptedOrderId) {
                        console.error('imageLocked cryptedOrderId not matching args', imageLocked, args);
                        return [2 /*return*/];
                    }
                    if (imageLocked.owner !== args.user) {
                        console.error('imageLocked owner not matching args', imageLocked, args);
                        return [2 /*return*/];
                    }
                    if (!imageLocked.printed) return [3 /*break*/, 6];
                    console.error('imageLocked already printed', imageLocked);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, cancelOrder(args.cryptedOrderId.split(':')[0])];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
                case 6:
                    decrypted = CryptoJS.AES.decrypt(args.cryptedOrderId, ENCRYPTION_SECRET).toString(CryptoJS.enc.Utf8);
                    orderId = decrypted.split(':')[0];
                    shippingId = decrypted.split(':')[1];
                    return [4 /*yield*/, fetch("".concat(CREATIVEHUB_BASEURL, "/api/v1/orders/").concat(orderId), {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'accept': 'application/json',
                                'Authorization': "ApiKey ".concat(CREATIVEHUB_API_KEY)
                            }
                        })
                            .then(function (response) { return response.json(); })
                            .then(function (data) {
                            console.log('order', data);
                            return data;
                        })["catch"](function (err) {
                            console.error(err);
                            return;
                        })];
                case 7:
                    order = _a.sent();
                    if (!order) {
                        console.error('order not found', orderId);
                        return [2 /*return*/];
                    }
                    if (String(order['Id']) !== String(orderId)) {
                        console.error('order Id not matching', order, orderId);
                        return [2 /*return*/];
                    }
                    if (order['OrderState'] !== 'EmbryonicOrder') {
                        console.error('order not in embryonic state', order);
                        return [2 /*return*/];
                    }
                    externalReference = (0, viem_1.keccak256)((0, viem_1.toHex)("".concat(imageLocked.imageAddress).concat(Number(imageLocked.imageId)).concat(args.user)));
                    if (order["ExternalReference"] != externalReference) {
                        console.error('order not matching', order, orderId);
                        return [2 /*return*/];
                    }
                    _a.label = 8;
                case 8:
                    _a.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, client_1.walletClient.writeContract({
                            address: printerAddress,
                            abi: PrinterABI,
                            functionName: 'setPrinted',
                            args: [args.user]
                        })];
                case 9:
                    printedHash = _a.sent();
                    return [3 /*break*/, 11];
                case 10:
                    e_2 = _a.sent();
                    console.error(e_2);
                    return [2 /*return*/];
                case 11: return [4 /*yield*/, client_1.publicClient.waitForTransactionReceipt({
                        confirmations: 5,
                        hash: printedHash,
                        pollingInterval: 15000,
                        timeout: 2 * 60 * 60 * 1000
                    })];
                case 12:
                    transaction = _a.sent();
                    if (!(!transaction || transaction.status == 'reverted')) return [3 /*break*/, 13];
                    console.error('transaction failed', transaction, args);
                    return [2 /*return*/];
                case 13: return [4 /*yield*/, fetch("".concat(CREATIVEHUB_BASEURL, "/api/v1/orders/confirmed"), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'accept': 'application/json',
                            'Authorization': "ApiKey ".concat(CREATIVEHUB_API_KEY)
                        },
                        body: JSON.stringify({
                            "OrderId": orderId,
                            "DeliveryOptionId": shippingId,
                            "DeliveryChargeExcludingSalesTax": 0,
                            "DeliveryChargeSalesTax": 0,
                            "ExternalReference": externalReference
                        })
                    })
                        .then(function (response) { return response.json(); })
                        .then(function (data) { return data; })["catch"](function (err) { console.error(err); })];
                case 14:
                    confirmation = _a.sent();
                    if (!confirmation || !confirmation['Id']) {
                        console.error('confirmation failed', confirmation);
                        return [2 /*return*/];
                    }
                    _a.label = 15;
                case 15: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var data, printerAddress, unwatch;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    checkEnv();
                    console.log("script started");
                    return [4 /*yield*/, client_1.publicClient.readContract({
                            address: IMAGE_MANAGER_ADDRESS,
                            abi: ImageManagerABI,
                            functionName: 'getPrinterAddress',
                            args: []
                        })];
                case 1:
                    data = _a.sent();
                    printerAddress = data;
                    console.log('printerAddress ', printerAddress);
                    unwatch = client_1.publicClient.watchContractEvent({
                        address: printerAddress,
                        abi: PrinterABI,
                        eventName: 'ConfirmOrder',
                        onLogs: function (logs) {
                            try {
                                var args = logs[0].args;
                                initiatePrint(args, printerAddress);
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    });
                    return [2 /*return*/];
            }
        });
    });
}
main();
