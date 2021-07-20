"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrivateKeys = exports.getNode = exports.getVersion = exports.getNetworkName = exports.CUR_NETWORK = void 0;
require("dotenv").config();
var util_1 = require("@zilliqa-js/util");
var Logger_1 = require("./Logger");
exports.CUR_NETWORK = process.env.CUR_NETWORK;
var nodes = {
    TESTNET: "https://dev-api.zilliqa.com",
    MAINNET: "https://api.zilliqa.com/",
};
var version = {
    TESTNET: util_1.bytes.pack(333, 1),
    MAINNET: util_1.bytes.pack(1, 1),
};
var networkName = {
    TESTNET: "testnet",
    MAINNET: "mainnet",
};
function getNetworkName() {
    return networkName[exports.CUR_NETWORK];
}
exports.getNetworkName = getNetworkName;
function getVersion() {
    return version[exports.CUR_NETWORK];
}
exports.getVersion = getVersion;
function getNode() {
    return nodes[exports.CUR_NETWORK];
}
exports.getNode = getNode;
/**
 * Add PRIV_${CUR_NETWORK}
 * and any
 * PRIV_${CUR_NETWORK}_${cur}
 * in ascending order starting from 1
 */
function getPrivateKeys(zil) {
    var key = process.env["PRIV_" + exports.CUR_NETWORK];
    if (typeof key != "string") {
        throw new Error("Private Key for " + exports.CUR_NETWORK + " not defined");
    }
    zil.wallet.addByPrivateKey(key);
    // add other private keys
    var cur = 1;
    while (true) {
        var nextKey = process.env["PRIV_" + exports.CUR_NETWORK + "_" + cur];
        if (typeof nextKey != "string") {
            break;
        }
        else {
            zil.wallet.addByPrivateKey(nextKey);
        }
        cur++;
    }
    Logger_1.debug("Loaded:");
    Logger_1.debug(Object.keys(zil.wallet.accounts));
}
exports.getPrivateKeys = getPrivateKeys;
