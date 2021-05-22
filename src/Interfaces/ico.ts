import { getZil } from "../zilSetup";
import { ZilliqaICOContract } from "../ContractCode/ZilliqaICOContract";
import { createValParam, deploy, callContract, formatAddress } from "../utill";
import { BN } from "@zilliqa-js/zilliqa";
import type { Transaction } from "@zilliqa-js/account";
import type { Contract } from "@zilliqa-js/contract";

export async function deployICOContract(
  init_admin: string,
  token_impl: string,
  token_qa_per_zil_qa: BN,
  ico_deadline: string,
  funding_goal: BN
): Promise<[Transaction, Contract]> {
  const zil = await getZil();
  const [tx, contract] = await deploy(
    zil,
    ZilliqaICOContract,
    [
      createValParam("Uint32", "_scilla_version", "0"),
      createValParam("ByStr20", "init_admin", formatAddress(init_admin)),
      createValParam("ByStr20", "token_impl", formatAddress(token_impl)),
      createValParam(
        "Uint128",
        "token_qa_per_zil_qa",
        token_qa_per_zil_qa.toString()
      ),
      createValParam("BNum", "ico_deadline", ico_deadline),
      createValParam("Uint128", "funding_goal", funding_goal.toString()),
    ],
    12000
  );
  return [tx, contract];
}

export async function BuyToken(
  contractAddress: string,
  qaToSend: BN,
  withoutConfirm?: boolean
) {
  const zil = await getZil();
  const tx = await callContract(
    zil,
    contractAddress,
    "BuyToken",
    [],
    qaToSend,
    10000,
    withoutConfirm
  );
  return tx;
}
