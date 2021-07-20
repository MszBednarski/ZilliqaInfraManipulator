import type { Zilliqa } from "@zilliqa-js/zilliqa";
declare type Nets = "TESTNET" | "MAINNET";
export declare const CUR_NETWORK: Nets;
export declare function getNetworkName(): string;
export declare function getVersion(): number;
export declare function getNode(): string;
/**
 * Add PRIV_${CUR_NETWORK}
 * and any
 * PRIV_${CUR_NETWORK}_${cur}
 * in ascending order starting from 1
 */
export declare function getPrivateKeys(zil: Zilliqa): void;
export {};
