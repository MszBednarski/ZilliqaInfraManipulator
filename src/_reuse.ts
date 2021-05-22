import { getZil } from "./zilSetup";
import { createValParam, callContract, getContractState } from "./utill";
import { BN } from "@zilliqa-js/zilliqa";

export async function getBlockNumber(secondsToAdd: number): Promise<string> {
  const zil = await getZil();
  const txblock = await zil.blockchain.getLatestTxBlock();
  const txblockRate = await zil.blockchain.getTxBlockRate();
  if (typeof txblock.result == "undefined") {
    throw new Error("Couldn't get tx block");
  }
  if (typeof txblockRate.result == "undefined") {
    throw new Error("Couldn't get tx block rate");
  }
  const curBlockNumber = parseInt(txblock.result.header.BlockNum);
  const secondsPerTxBlock = 1 / txblockRate.result;
  const res =
    "" + (curBlockNumber + Math.round(secondsToAdd / secondsPerTxBlock));
  console.log(`Current block number: ${curBlockNumber}`);
  console.log(`Returned Block number: ${res}`);
  return res;
}

export async function UpdateAdmin(a: string, newAdmin: string) {
  const zil = await getZil();
  const tx = await callContract(
    zil,
    a,
    "UpdateAdmin",
    [createValParam("ByStr20", "admin", newAdmin)],
    new BN(0),
    10000
  );
  return tx;
}

export async function ClaimAdmin(a: string) {
  const zil = await getZil();
  const tx = await callContract(zil, a, "ClaimAdmin", [], new BN(0), 10000);
  return tx;
}

export async function DrainContractBalance(a: string, inQa: BN) {
  const zil = await getZil();
  const tx = await callContract(
    zil,
    a,
    "DrainContractBalance",
    [createValParam("Uint128", "amt", inQa.toString())],
    new BN(0),
    10000
  );
  return tx;
}

export async function getState(a: string) {
  const zil = await getZil();
  const state = await getContractState(zil, a, 2);
  return state;
}
