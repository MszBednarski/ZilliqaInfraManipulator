import { getZil } from "../zilSetup";
import { TokenPayment } from "../ContractCode/TokenPayment";
import { createValParam, deploy, callContract, formatAddress } from "../utill";
import { units } from "@zilliqa-js/util";
import { BN } from "@zilliqa-js/zilliqa";

//   init_admin: ByStr20,
//   current_impl: ByStr20
export async function deployTokenPayment(implementation: string, owner: string) {
  const zil = await getZil();
  const [tx, contract] = await deploy(
    zil,
    TokenPayment,
    [
      createValParam("Uint32", "_scilla_version", "0"),
      createValParam("ByStr20", "init_admin", formatAddress(owner)),
      createValParam("ByStr20", "current_impl", formatAddress(implementation)),
    ],
    12000
  );
  return [tx, contract];
}

export async function Pay(a: string, addresses: string[], amts: number[]) {
  const zil = await getZil();
  const tx = await callContract(
    zil,
    a,
    "Pay",
    [
      createValParam(
        "List (ByStr20)",
        "addresses",
        //@ts-ignore
        addresses.map((addr) => formatAddress(addr))
      ),
      createValParam(
        "List (Uint128)",
        "amts",
        //@ts-ignore
        amts.map((amt) => units.toQa(new BN(amt), units.Units.Zil).toString())
      ),
    ],
    new BN(0),
    10000
  );
  return tx;
}
