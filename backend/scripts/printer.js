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
var client_1 = require("./utils/client"); // create public client with the good chain
var CryptoJS = require('crypto-js');
require('dotenv').config({ path: __dirname + '/../.env' });
var IMAGE_MANAGER_ADDRESS = process.env.IMAGE_MANAGER_ADDRESS;
var ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;
function initiatePrint(args) {
    return __awaiter(this, void 0, void 0, function () {
        var decrypted;
        return __generator(this, function (_a) {
            // vérifie que le NFT n'est pas "printed" (sinon cancel la commande)
            console.log('initiatePrint', args);
            decrypted = CryptoJS.AES.decrypt(args.cryptedOrderId, ENCRYPTION_SECRET).toString(CryptoJS.enc.Utf8);
            console.log('decrypted', decrypted);
            return [2 /*return*/];
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var data, printerAddress, unwatch;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!IMAGE_MANAGER_ADDRESS) {
                        throw new Error('IMAGE_MANAGER_ADDRESS is not defined');
                    }
                    if (!ENCRYPTION_SECRET) {
                        throw new Error('ENCRYPTION_SECRET is not defined');
                    }
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
                            console.log('ConfirmOrder event received');
                            console.log(logs);
                            var args = logs[0].args;
                            console.log(args);
                            initiatePrint(args);
                        }
                    });
                    return [2 /*return*/];
            }
        });
    });
}
main();
// const decrypted = CryptoJS.AES.decrypt(clientEncryptedTimestamp, API_KEY).toString(CryptoJS.enc.Utf8);
