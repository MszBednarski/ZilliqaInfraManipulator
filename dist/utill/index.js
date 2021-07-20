"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitUntilBlock = exports.callContract = exports.confirmTx = exports.getMinGasPrice = exports.getContract = exports.getContractState = exports.sleep = exports.formatAddress = exports.deploy = exports.createValParam = exports.getParentDir = exports.getSecondsPerBlock = exports.getCurrentBlock = exports.getBlockNumber = void 0;
var zilliqa_1 = require("@zilliqa-js/zilliqa");
var crypto_1 = require("@zilliqa-js/crypto");
var config_1 = require("../config");
var zilSetup_1 = require("../zilSetup");
var log = __importStar(require("../Logger"));
function getBlockNumber(secondsToAdd) {
    return __awaiter(this, void 0, void 0, function () {
        var curBlockNumber, secondsPerTxBlock, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getCurrentBlock()];
                case 1:
                    curBlockNumber = _a.sent();
                    return [4 /*yield*/, getSecondsPerBlock()];
                case 2:
                    secondsPerTxBlock = _a.sent();
                    res = "" + (curBlockNumber + Math.round(secondsToAdd / secondsPerTxBlock));
                    log.debug("Current block number: " + curBlockNumber);
                    log.debug("Returned Block number: " + res);
                    return [2 /*return*/, res];
            }
        });
    });
}
exports.getBlockNumber = getBlockNumber;
function getCurrentBlock() {
    return __awaiter(this, void 0, void 0, function () {
        var zil, txblock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, zilSetup_1.getZil()];
                case 1:
                    zil = _a.sent();
                    return [4 /*yield*/, zil.blockchain.getLatestTxBlock()];
                case 2:
                    txblock = _a.sent();
                    if (typeof txblock.result == "undefined") {
                        throw new Error("Couldn't get tx block");
                    }
                    return [2 /*return*/, parseInt(txblock.result.header.BlockNum)];
            }
        });
    });
}
exports.getCurrentBlock = getCurrentBlock;
function getSecondsPerBlock() {
    return __awaiter(this, void 0, void 0, function () {
        var zil, txblockRate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, zilSetup_1.getZil()];
                case 1:
                    zil = _a.sent();
                    return [4 /*yield*/, zil.blockchain.getTxBlockRate()];
                case 2:
                    txblockRate = _a.sent();
                    if (typeof txblockRate.result == "undefined") {
                        throw new Error("Couldn't get tx block rate");
                    }
                    return [2 /*return*/, Math.ceil(1 / txblockRate.result)];
            }
        });
    });
}
exports.getSecondsPerBlock = getSecondsPerBlock;
function getParentDir() {
    if (require.main)
        return require.main.path;
    throw new Error("require main not defined");
}
exports.getParentDir = getParentDir;
function createValParam(type, vname, value) {
    return {
        type: type,
        value: value,
        vname: vname,
    };
}
exports.createValParam = createValParam;
function deploy(zil, code, v, gasLimit) {
    return __awaiter(this, void 0, void 0, function () {
        var contract, gasPrice, _a, tx, con;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    contract = zil.contracts.new(code, v);
                    return [4 /*yield*/, getMinGasPrice(zil)];
                case 1:
                    gasPrice = _b.sent();
                    return [4 /*yield*/, contract.deploy({
                            version: config_1.getVersion(),
                            gasPrice: gasPrice,
                            gasLimit: zilliqa_1.Long.fromNumber(gasLimit),
                        }, 33, 1000, false)];
                case 2:
                    _a = _b.sent(), tx = _a[0], con = _a[1];
                    log.txLink(tx, "Deploy");
                    return [2 /*return*/, [tx, con]];
            }
        });
    });
}
exports.deploy = deploy;
function formatAddress(a) {
    if (zilliqa_1.validation.isAddress(a) || zilliqa_1.validation.isBech32(a)) {
        var res = a.startsWith("zil") && a.length == 42 ? crypto_1.fromBech32Address(a) : a;
        return res;
    }
    else {
        throw "not an address";
    }
}
exports.formatAddress = formatAddress;
var sleep = function (mil) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, new Promise(function (res, rej) { return setTimeout(res, mil); })];
}); }); };
exports.sleep = sleep;
function retryLoop(maxRetries, intervalMs, func) {
    return __awaiter(this, void 0, void 0, function () {
        var err, x, temp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    err = {};
                    x = 0;
                    _a.label = 1;
                case 1:
                    if (!(x < maxRetries)) return [3 /*break*/, 5];
                    return [4 /*yield*/, exports.sleep(x * intervalMs)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, func()];
                case 3:
                    temp = _a.sent();
                    if (temp.result) {
                        return [2 /*return*/, [temp.result, temp.error]];
                    }
                    err = temp.error;
                    _a.label = 4;
                case 4:
                    x++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/, [undefined, err]];
            }
        });
    });
}
/**
 * @param address the address of the contract to read state off
 * @param maxRetries optional max number of retries to call the blockchain
 * @param intervalMs optional interval in which the retries increase lineraly with
 * @returns the state of the qvote contract
 * @example
 * const qvState = await qv.getContractState(address1, 14);
 */
function getContractState(zil, a, maxRetries, intervalMs) {
    if (maxRetries === void 0) { maxRetries = 6; }
    if (intervalMs === void 0) { intervalMs = 750; }
    return __awaiter(this, void 0, void 0, function () {
        var address, err, _a, init, errInit, _b, state, errState, balance;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    address = formatAddress(a);
                    err = function (s, e) {
                        return new Error("There was an issue getting contract " + s + " state, " + e);
                    };
                    return [4 /*yield*/, retryLoop(maxRetries, intervalMs, function () {
                            return zil.blockchain.getSmartContractInit(address);
                        })];
                case 1:
                    _a = _c.sent(), init = _a[0], errInit = _a[1];
                    if (!init) {
                        throw err("init", JSON.stringify(errInit));
                    }
                    return [4 /*yield*/, retryLoop(maxRetries, intervalMs, function () {
                            return zil.blockchain.getSmartContractState(address);
                        })];
                case 2:
                    _b = (_c.sent()), state = _b[0], errState = _b[1];
                    if (!state) {
                        throw err("mutable", JSON.stringify(errState));
                    }
                    balance = new zilliqa_1.BN(state._balance);
                    log.balance(balance);
                    log.state(init);
                    log.state(state);
                    log.contractLink(address, address);
                    return [2 /*return*/, { state: init, balance: balance, mutableState: state }];
            }
        });
    });
}
exports.getContractState = getContractState;
function getContract(zil, a) {
    var address = formatAddress(a);
    return zil.contracts.at(address);
}
exports.getContract = getContract;
function getMinGasPrice(zil) {
    return __awaiter(this, void 0, void 0, function () {
        var minGas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, zil.blockchain.getMinimumGasPrice()];
                case 1:
                    minGas = _a.sent();
                    if (!minGas.result) {
                        throw "no gas price";
                    }
                    // increase minimum gas price by 30% so we get that first in line
                    // treatment
                    return [2 /*return*/, new zilliqa_1.BN(minGas.result).mul(new zilliqa_1.BN(1.3))];
            }
        });
    });
}
exports.getMinGasPrice = getMinGasPrice;
function confirmTx(tx, transition) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tx.confirm(tx.hash, 33, 1000)];
                case 1:
                    _a.sent();
                    log.txLink(tx, transition);
                    return [2 /*return*/, tx];
            }
        });
    });
}
exports.confirmTx = confirmTx;
function callContract(zil, a, transition, args, amount, gasLimit, withoutConfirm) {
    return __awaiter(this, void 0, void 0, function () {
        var contract, gasPrice, payload, tx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    contract = getContract(zil, a);
                    return [4 /*yield*/, getMinGasPrice(zil)];
                case 1:
                    gasPrice = _a.sent();
                    payload = [
                        transition,
                        args,
                        {
                            version: config_1.getVersion(),
                            amount: amount,
                            gasPrice: gasPrice,
                            gasLimit: zilliqa_1.Long.fromNumber(gasLimit),
                        },
                        false,
                    ];
                    return [4 /*yield*/, contract.callWithoutConfirm.apply(contract, payload)];
                case 2:
                    tx = _a.sent();
                    if (!withoutConfirm) return [3 /*break*/, 3];
                    return [2 /*return*/, tx];
                case 3: return [4 /*yield*/, confirmTx(tx, transition)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/, tx];
            }
        });
    });
}
exports.callContract = callContract;
function waitUntilBlock(target) {
    return __awaiter(this, void 0, void 0, function () {
        var secondsPerTxBlock, targetBNum, cur;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSecondsPerBlock()];
                case 1:
                    secondsPerTxBlock = _a.sent();
                    log.debug("Waiting ... target: " + target);
                    log.debug("Current seconds per tx block is " + secondsPerTxBlock);
                    targetBNum = parseInt(target);
                    _a.label = 2;
                case 2:
                    if (!true) return [3 /*break*/, 7];
                    return [4 /*yield*/, getCurrentBlock()];
                case 3:
                    cur = _a.sent();
                    if (!(cur < targetBNum)) return [3 /*break*/, 5];
                    log.debug("Current block " + cur);
                    return [4 /*yield*/, exports.sleep(secondsPerTxBlock * 1000)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 7];
                case 6: return [3 /*break*/, 2];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.waitUntilBlock = waitUntilBlock;
