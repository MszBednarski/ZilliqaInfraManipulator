"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractLink = exports.txLink = exports.balance = exports.state = exports.flushDebug = exports.debug = void 0;
var config_1 = require("../config");
var zilliqa_1 = require("@zilliqa-js/zilliqa");
var Logger_1 = require("./Logger");
exports.debug = Logger_1.Logger.log;
exports.flushDebug = Logger_1.Logger.flush;
var RED = "\x1B[31m%s\x1b[0m";
var CYAN = "\x1B[36m%s\x1b[0m";
var GREEN = "\x1B[32m%s\x1b[0m";
var MAGENTA = "\x1B[35m%s\x1b[0m";
function state(v) {
    var color = "\x1b[33m%s\x1b[0m";
    exports.debug(color, JSON.stringify(v, null, 4));
}
exports.state = state;
function balance(inQa) {
    var color = "\x1b[35m%s\x1b[0m";
    exports.debug(color, "In Zil: " + zilliqa_1.units.fromQa(inQa, zilliqa_1.units.Units.Zil).toString());
    exports.debug(color, "In Li: " + zilliqa_1.units.fromQa(inQa, zilliqa_1.units.Units.Li).toString());
    exports.debug(color, "In Qa: " + inQa.toString());
}
exports.balance = balance;
function txLink(t, msg) {
    var id = t.id;
    var url = "https://viewblock.io/zilliqa/tx/0x" + id + "?network=" + config_1.getNetworkName();
    exports.debug(MAGENTA, msg);
    var receipt = t.getReceipt();
    if (receipt) {
        if (receipt.success) {
            exports.debug(GREEN, "Success.");
        }
        else {
            exports.debug(RED, "Failed.");
            if (receipt.errors) {
                Object.entries(receipt.errors).map(function (_a) {
                    var k = _a[0], v = _a[1];
                    exports.debug(RED, v);
                });
            }
        }
    }
    exports.debug(CYAN, url);
}
exports.txLink = txLink;
function contractLink(a, msg) {
    var url = "https://viewblock.io/zilliqa/address/" + a + "?network=" + config_1.getNetworkName() + "&tab=state";
    exports.debug(RED, msg);
    exports.debug(RED, url);
}
exports.contractLink = contractLink;
