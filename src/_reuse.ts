import { getZil } from "./zilSetup";
import { createValParam, callContract, getContractState } from "./utill";
import { BN } from "@zilliqa-js/zilliqa";

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
