import type { Value, Contract } from "@zilliqa-js/contract";
import type { Transaction } from "@zilliqa-js/account";
import type { Zilliqa } from "@zilliqa-js/zilliqa";
import { BN, Long, validation } from "@zilliqa-js/zilliqa";
import { fromBech32Address } from "@zilliqa-js/crypto";
import type { RPCResponse } from "@zilliqa-js/core";
import { getVersion } from "./config";

export namespace Types {
  type Bits = "32" | "64" | "128" | "256";
  type ByStrLength = "20" | "30" | "";
  export type String = "String";
  export type Bool = "Bool";
  export type BNum = "BNum";
  export type Int<X extends Bits> = `Int${X}`;
  export type Uint<X extends Bits> = `Uint${X}`;
  export type ByStr<X extends ByStrLength> = `ByStr${X}`;
  export type Primitive =
    | Int<Bits>
    | Uint<Bits>
    | ByStr<ByStrLength>
    | string
    | BNum;
  export type Algebraic =
    | Bool
    | ScillaList<any>
    | ScillaMap<any, any>
    | Pair<any, any>;
  export type ScillaList<V extends All> = `List (${V})`;
  export type ScillaMap<
    K extends Primitive,
    V extends All
  > = `Map (${K}) (${V})`;
  export type Pair<V1 extends All, V2 extends All> = `Pair (${V1}) (${V2})`;
  export type All = Primitive | Algebraic;
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
  const minGas = await zil.blockchain.getMinimumGasPrice();
  if (!minGas.result) {
    throw "no gas price";
  }
  const gasPrice = new BN(minGas.result);
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
): Promise<[Value[] | undefined, any]> {
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
): Promise<{ state: Value[]; balance: BN }> {
  const address = formatAddress(a);
  const err = (s: string, e: string) =>
    new Error(`There was an issue getting contract ${s} state, ${e}`);
  const [init, errInit] = await retryLoop(maxRetries, intervalMs, () =>
    zil.blockchain.getSmartContractInit(address)
  );
  if (!init) {
    throw err("init", JSON.stringify(errInit));
  }
  const [state, errState] = await retryLoop(maxRetries, intervalMs, () =>
    zil.blockchain.getSmartContractState(address)
  );
  if (!state) {
    throw err("mutable", JSON.stringify(errState));
  }
  const bal = await zil.blockchain.getBalance(address);
  const balance = new BN(bal.result.balance);
  return { state: [...init, ...state], balance };
}
