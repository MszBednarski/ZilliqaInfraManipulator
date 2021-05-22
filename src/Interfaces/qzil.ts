import { getZil } from "../zilSetup";
import {
  createValParam,
  deploy,
  callContract,
  formatAddress,
  getParentDir,
} from "../utill";
import { BN } from "@zilliqa-js/zilliqa";
import type { Transaction } from "@zilliqa-js/account";
import type { Contract } from "@zilliqa-js/contract";
import { readFileSync } from "fs";
import { resolve } from "path";

// contract_owner: ByStr20,
// init_minter: ByStr20,
// name: String,
// symbol: String,
// decimals: Uint32,
// init_supply: Uint128,
// num_minting_blocks: Uint128

/**
 * @decimals 12
 */
export async function deployQZIL(
  owner: string,
  initSupplyQa: BN
): Promise<[Transaction, Contract]> {
  const code = readFileSync(
    resolve(getParentDir(), "../Experiments/QZIL.scilla"),
    "utf-8"
  );
  const zil = await getZil();
  const [tx, contract] = await deploy(
    zil,
    code,
    [
      createValParam("Uint32", "_scilla_version", "0"),
      createValParam("ByStr20", "contract_owner", formatAddress(owner)),
      createValParam("ByStr20", "init_minter", formatAddress(owner)),
      createValParam("String", "name", "QZIL"),
      createValParam("String", "symbol", "QZ"),
      createValParam("Uint32", "decimals", "12"),
      createValParam("Uint128", "init_supply", initSupplyQa.toString()),
      createValParam("Uint128", "num_minting_blocks", "10000000"),
    ],
    12000
  );
  return [tx, contract];
}

export async function Mint(a: string, recipient: string, amount: BN) {
  const zil = await getZil();
  const tx = await callContract(
    zil,
    a,
    "Mint",
    [
      createValParam("ByStr20", "recipient", formatAddress(recipient)),
      createValParam("Uint128", "amount", amount.toString()),
    ],
    new BN(0),
    10000
  );
  return tx;
}

export async function Transfer(a: string, to: string, amount: BN) {
  const zil = await getZil();
  const tx = await callContract(
    zil,
    a,
    "Transfer",
    [
      createValParam("ByStr20", "to", formatAddress(to)),
      createValParam("Uint128", "amount", amount.toString()),
    ],
    new BN(0),
    10000
  );
  return tx;
}
