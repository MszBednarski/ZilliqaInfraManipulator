/// <reference types="bn.js" />
import { Transaction } from "@zilliqa-js/account";
import { BN } from "@zilliqa-js/zilliqa";
import { Logger } from "./Logger";
export declare const debug: typeof Logger.log;
export declare const flushDebug: typeof Logger.flush;
export declare function state(v: {}): void;
export declare function balance(inQa: BN): void;
export declare function txLink(t: Transaction, msg: string): void;
export declare function contractLink(a: string, msg: string): void;
