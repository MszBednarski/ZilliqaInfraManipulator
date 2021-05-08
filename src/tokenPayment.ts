import { getZil } from "./zilSetup";
import { TokenPayment } from "./ContractCode/TokenPayment";
import {
  DrainContractBalance,
  UpdateAdmin,
  ClaimAdmin,
  getState,
} from "./_reuse";
import { createValParam, deploy, callContract, formatAddress } from "./utill";
import { units } from "@zilliqa-js/util";
import { BN } from "@zilliqa-js/zilliqa";

(async () => {
  try {
    const cur = "zil1wzshrzzj4f8t7mzgyr0ct474l4v67kvlemwux9";
    const curAcc = "0x03b39223A540467A53BB044Fb7bFA3f44530135A";
    const tokenImplementation = "zil19q4w6zepthsy9zw5qmm059gyz63uzsp4fyp3js";
    // await deployTokenPayment(tokenImplementation, curAcc);
    // pay account1 and imported0 29 13 respectively
    // await Pay(
    //   cur,
    //   [
    //     "0x03b39223A540467A53BB044Fb7bFA3f44530135A",
    //     "zil1dnfkv7a8jvggxl3n7zhvhcfk3znvhj3j4myh8s",
    //   ],
    //   [29, 13]
    // );
    // drain contract from 15 tokens it received
    await DrainContractBalance(cur, new BN(14999999999985));
    //const state = await getState(cur);
  } catch (e) {
    console.error(e);
  }
})();

//   init_admin: ByStr20,
//   current_impl: ByStr20
async function deployTokenPayment(implementation: string, owner: string) {
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

async function Pay(a: string, addresses: string[], amts: number[]) {
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
