import { Zilliqa } from "@zilliqa-js/zilliqa";
import type { Account } from "@zilliqa-js/account";
export declare const VERSION: number;
export declare function getZil(): Promise<Zilliqa>;
export declare function getDefaultAcc(): Promise<Account>;
