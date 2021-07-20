import type { Value, Contract } from "@zilliqa-js/contract";
import type { Transaction } from "@zilliqa-js/account";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import { BN, Long, validation } from "@zilliqa-js/zilliqa";
import { fromBech32Address } from "@zilliqa-js/crypto";
import type { RPCResponse } from "@zilliqa-js/core";
import { getVersion } from "../config";
import { Types } from "../types";
import { getZil } from "../zilSetup";
import * as log from "../Logger";

export async function getBlockNumber(secondsToAdd: number): Promise<string> {
  const curBlockNumber = await getCurrentBlock();
  const secondsPerTxBlock = await getSecondsPerBlock();
  const res =
    "" + (curBlockNumber + Math.round(secondsToAdd / secondsPerTxBlock));
  log.debug(`Current block number: ${curBlockNumber}`);
  log.debug(`Returned Block number: ${res}`);
  return res;
}

export async function getCurrentBlock(): Promise<number> {
  const zil = await getZil();
  const txblock = await zil.blockchain.getLatestTxBlock();
  if (typeof txblock.result == "undefined") {
    throw new Error("Couldn't get tx block");
  }
  return parseInt(txblock.result.header.BlockNum);
}

export async function getSecondsPerBlock(): Promise<number> {
  const zil = await getZil();
  const txblockRate = await zil.blockchain.getTxBlockRate();
  if (typeof txblockRate.result == "undefined") {
    throw new Error("Couldn't get tx block rate");
  }
  return Math.ceil(1 / txblockRate.result);
}

export function getParentDir() {
  if (require.main) return require.main.path;
  throw new Error("require main not defined");
}

export function createValParam(
  type: Types.All,
  vname: string,
  value: Value["value"]
): Value {
  return {
    type,
    value,
    vname,
  };
}

export async function deploy(
  zil: Zilliqa,
  code: string,
  v: Value[],
  gasLimit: number
): Promise<[Transaction, Contract]> {
  const contract = zil.contracts.new(code, v);
  const gasPrice = await getMinGasPrice(zil);
  const [tx, con] = await contract.deploy(
    {
      version: getVersion(),
      gasPrice,
      gasLimit: Long.fromNumber(gasLimit),
    },
    33,
    1000,
    false
  );
  log.txLink(tx, "Deploy");
  return [tx, con];
}

export function formatAddress(a: string) {
  if (validation.isAddress(a) || validation.isBech32(a)) {
    const res =
      a.startsWith("zil") && a.length == 42 ? fromBech32Address(a) : a;
    return res;
  } else {
    throw "not an address";
  }
}

export const sleep = async (mil: number) =>
  new Promise((res, rej) => setTimeout(res, mil));

async function retryLoop(
  maxRetries: number,
  intervalMs: number,
  func: () => Promise<RPCResponse<Value[], any>>
): Promise<[unknown, any]> {
  let err = {};
  for (let x = 0; x < maxRetries; x++) {
    await sleep(x * intervalMs);
    const temp = await func();
    if (temp.result) {
      return [temp.result, temp.error];
    }
    err = temp.error;
  }
  return [undefined, err];
}

/**
 * @param address the address of the contract to read state off
 * @param maxRetries optional max number of retries to call the blockchain
 * @param intervalMs optional interval in which the retries increase lineraly with
 * @returns the state of the qvote contract
 * @example
 * const qvState = await qv.getContractState(address1, 14);
 */
export async function getContractState(
  zil: Zilliqa,
  a: string,
  maxRetries = 6,
  intervalMs = 750
): Promise<{ state: Value[]; balance: BN; mutableState: unknown }> {
  const address = formatAddress(a);
  const err = (s: string, e: string) =>
    new Error(`There was an issue getting contract ${s} state, ${e}`);
  const [init, errInit] = await retryLoop(maxRetries, intervalMs, () =>
    zil.blockchain.getSmartContractInit(address)
  );
  if (!init) {
    throw err("init", JSON.stringify(errInit));
  }
  const [state, errState] = (await retryLoop(maxRetries, intervalMs, () =>
    zil.blockchain.getSmartContractState(address)
  )) as unknown as [{ _balance: string; [key: string]: unknown }, any];
  if (!state) {
    throw err("mutable", JSON.stringify(errState));
  }
  const balance = new BN(state._balance);
  log.balance(balance);
  log.state(init as {});
  log.state(state as {});
  log.contractLink(address, address);
  return { state: init as Value[], balance, mutableState: state };
}

export function getContract(zil: Zilliqa, a: string): Contract {
  const address = formatAddress(a);
  return zil.contracts.at(address);
}

export async function getMinGasPrice(zil: Zilliqa) {
  const minGas = await zil.blockchain.getMinimumGasPrice();
  if (!minGas.result) {
    throw "no gas price";
  }
  // increase minimum gas price by 30% so we get that first in line
  // treatment
  return new BN(minGas.result).mul(new BN(1.3));
}

export async function confirmTx(
  tx: Transaction,
  transition: string
): Promise<Transaction> {
  await tx.confirm(tx.hash, 33, 1000);
  log.txLink(tx, transition);
  return tx;
}

export async function callContract(
  zil: Zilliqa,
  a: string,
  transition: string,
  args: Value[],
  amount: BN,
  gasLimit: number,
  withoutConfirm?: boolean
): Promise<Transaction> {
  const contract = getContract(zil, a);
  const gasPrice = await getMinGasPrice(zil);
  const payload: Parameters<Contract["callWithoutConfirm"]> = [
    transition,
    args,
    {
      version: getVersion(),
      amount: amount,
      gasPrice: gasPrice,
      gasLimit: Long.fromNumber(gasLimit),
    },
    false,
  ];
  const tx = await contract.callWithoutConfirm(...payload);
  if (withoutConfirm) {
    return tx;
  } else {
    await confirmTx(tx, transition);
  }
  return tx;
}

export async function waitUntilBlock(target: string): Promise<void> {
  const secondsPerTxBlock = await getSecondsPerBlock();
  log.debug(`Waiting ... target: ${target}`);
  log.debug(`Current seconds per tx block is ${secondsPerTxBlock}`);
  const targetBNum = parseInt(target);
  while (true) {
    const cur = await getCurrentBlock();
    if (cur < targetBNum) {
      log.debug(`Current block ${cur}`);
      await sleep(secondsPerTxBlock * 1000);
      continue;
    } else {
      break;
    }
  }
}
