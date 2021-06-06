import { getZil } from "../zilSetup";
import { ZilliqaGuardedTokenPayout } from "../ContractCode/ZilliqaGuardedTokenPayout";
import { createValParam, deploy, callContract, formatAddress } from "../utill";
import { BN } from "@zilliqa-js/zilliqa";
import type { Transaction } from "@zilliqa-js/account";
import type { Contract } from "@zilliqa-js/contract";

/**
 * init_admin: ByStr20,
  init_token_impl: ByStr20,
  fixed_payout_amount: Uint128,
  init_payout_schedule: List BNum
 */
export async function deployGuardedPayout(
  init_admin: string,
  token_impl: string,
  fixed_payout_amount: BN,
  init_payout_schedule: string[]
): Promise<[Transaction, Contract]> {
  const zil = await getZil();
  const [tx, contract] = await deploy(
    zil,
    ZilliqaGuardedTokenPayout,
    [
      createValParam("Uint32", "_scilla_version", "0"),
      createValParam("ByStr20", "init_admin", formatAddress(init_admin)),
      createValParam("ByStr20", "init_token_impl", formatAddress(token_impl)),
      createValParam(
        "Uint128",
        "fixed_payout_amount",
        fixed_payout_amount.toString()
      ),
      createValParam(
        "List (BNum)",
        "init_payout_schedule",
        //@ts-ignore
        init_payout_schedule
      ),
    ],
    12000
  );
  return [tx, contract];
}

export async function Withdraw(a: string, withoutConfirm?: boolean) {
  const zil = await getZil();
  const tx = await callContract(
    zil,
    a,
    "Withdraw",
    [],
    new BN(0),
    10000,
    withoutConfirm
  );
  return tx;
}
