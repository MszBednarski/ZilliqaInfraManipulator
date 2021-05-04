import type { Value, Contract } from "@zilliqa-js/contract";
import type { Transaction } from "@zilliqa-js/account";
import { units, Zilliqa } from "@zilliqa-js/zilliqa";
import { BN, Long, validation } from "@zilliqa-js/zilliqa";
import { fromBech32Address } from "@zilliqa-js/crypto";
import type { RPCResponse } from "@zilliqa-js/core";
import { getVersion, getNetworkName } from "../config";
import { Types } from "../types";

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
  logTxLink(tx, "Deploy");
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

const sleep = async (mil: number) =>
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
  const [state, errState] = ((await retryLoop(maxRetries, intervalMs, () =>
    zil.blockchain.getSmartContractState(address)
  )) as unknown) as [{ _balance: string; [key: string]: unknown }, any];
  if (!state) {
    throw err("mutable", JSON.stringify(errState));
  }
  const balance = new BN(state._balance);
  logBalance(balance);
  logState(init as {});
  logState(state as {});
  logContractLink(address, address);
  return { state: init as Value[], balance, mutableState: state };
}

function logState(v: {}) {
  const color = "\x1b[33m%s\x1b[0m";
  console.log(color, JSON.stringify(v, null, 4));
}

function logBalance(inQa: BN) {
  const color = "\x1b[35m%s\x1b[0m";
  console.log(
    color,
    `In Zil: ${units.fromQa(inQa, units.Units.Zil).toString()}`
  );
  console.log(color, `In Li: ${units.fromQa(inQa, units.Units.Li).toString()}`);
  console.log(color, `In Qa: ${inQa.toString()}`);
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
  return new BN(minGas.result);
}

export async function callContract(
  zil: Zilliqa,
  a: string,
  transition: string,
  args: Value[],
  amount: BN,
  gasLimit: number
): Promise<Transaction> {
  const contract = getContract(zil, a);
  const gasPrice = await getMinGasPrice(zil);
  const tx = await contract.call(
    transition,
    args,
    {
      version: getVersion(),
      amount: amount,
      gasPrice: gasPrice,
      gasLimit: Long.fromNumber(gasLimit),
    },
    33,
    1000,
    false
  );
  logTxLink(tx, transition);
  return tx;
}

function logTxLink(t: Transaction, msg: string) {
  const id = t.id;
  const url = `https://viewblock.io/zilliqa/tx/0x${id}?network=${getNetworkName()}`;
  const color = "\x1b[36m%s\x1b[0m";
  console.log(color, msg);
  console.log(color, url);
}

function logContractLink(a: string, msg: string) {
  const url = `https://viewblock.io/zilliqa/address/${a}?network=${getNetworkName()}&tab=state`;
  const color = "\x1b[31m%s\x1b[0m";
  console.log(color, msg);
  console.log(color, url);
}
