/// <reference types="bn.js" />
import type { Value, Contract } from "@zilliqa-js/contract";
import type { Transaction } from "@zilliqa-js/account";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import { BN } from "@zilliqa-js/zilliqa";
import { Types } from "../types";
export declare function getBlockNumber(secondsToAdd: number): Promise<string>;
export declare function getCurrentBlock(): Promise<number>;
export declare function getSecondsPerBlock(): Promise<number>;
export declare function getParentDir(): string;
export declare function createValParam(type: Types.All, vname: string, value: Value["value"]): Value;
export declare function deploy(zil: Zilliqa, code: string, v: Value[], gasLimit: number): Promise<[Transaction, Contract]>;
export declare function formatAddress(a: string): string;
export declare const sleep: (mil: number) => Promise<unknown>;
/**
 * @param address the address of the contract to read state off
 * @param maxRetries optional max number of retries to call the blockchain
 * @param intervalMs optional interval in which the retries increase lineraly with
 * @returns the state of the qvote contract
 * @example
 * const qvState = await qv.getContractState(address1, 14);
 */
export declare function getContractState(zil: Zilliqa, a: string, maxRetries?: number, intervalMs?: number): Promise<{
    state: Value[];
    balance: BN;
    mutableState: unknown;
}>;
export declare function getContract(zil: Zilliqa, a: string): Contract;
export declare function getMinGasPrice(zil: Zilliqa): Promise<BN>;
export declare function confirmTx(tx: Transaction, transition: string): Promise<Transaction>;
export declare function callContract(zil: Zilliqa, a: string, transition: string, args: Value[], amount: BN, gasLimit: number, withoutConfirm?: boolean): Promise<Transaction>;
export declare function waitUntilBlock(target: string): Promise<void>;
