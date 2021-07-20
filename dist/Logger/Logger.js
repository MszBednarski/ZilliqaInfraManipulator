"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var util_1 = require("util");
var fs_1 = require("fs");
var path_1 = require("path");
var index_1 = require("../utill/index");
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.log = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        console.log.apply(console, __spreadArray([message], optionalParams));
        if (Logger.buffer != "") {
            Logger.buffer += "\n";
        }
        Logger.buffer += util_1.format.apply(void 0, __spreadArray([message], optionalParams));
    };
    Logger.flush = function (path) {
        fs_1.writeFileSync(path_1.resolve(index_1.getParentDir(), path), Logger.buffer);
        Logger.buffer = "";
    };
    Logger.buffer = "";
    return Logger;
}());
exports.Logger = Logger;
