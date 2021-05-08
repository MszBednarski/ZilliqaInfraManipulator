import { getZil } from "./zilSetup";
import { ZilliqaCollector } from "./ContractCode/ZilliqaCollector";
import {
  DrainContractBalance,
  UpdateAdmin,
  ClaimAdmin,
  getState
} from "./_reuse";
import {
  createValParam,
  deploy,
  callContract,
} from "./utill";
import { units } from "@zilliqa-js/util";
import { BN } from "@zilliqa-js/zilliqa";

/**
 * testnet tx:
 * 0x77b70bf8ef1cebee5d95db165b8cc931591813e1078285db2bd619e312892dee
 * zil12n666f9925le2zgewkrxn6u489562thl3gazeg
 */

(async () => {
  try {
    const cur = "zil12n666f9925le2zgewkrxn6u489562thl3gazeg";
    //await deployCollector()
    //give one zil
    // await AddFunds(
    //   cur,
    //   "1"
    // );
    const state = await getState(cur);
    // drain by cur balance
    // await DrainContractBalance(cur, state.balance);

    //update admin
    // await UpdateAdmin(cur, "0x03b39223A540467A53BB044Fb7bFA3f44530135A");

    //claim staged admin
    // await ClaimAdmin(cur);
  } catch (e) {
    console.error(e);
  }
})();

async function deployCollector() {
  const zil = await getZil();
  const [tx, contract] = await deploy(
    zil,
    ZilliqaCollector,
    [
      createValParam("Uint32", "_scilla_version", "0"),
      createValParam(
        "ByStr20",
        "init_admin",
        "0x03b39223A540467A53BB044Fb7bFA3f44530135A"
      ),
    ],
    12000
  );
  return [tx, contract];
}

async function AddFunds(a: string, zils: string) {
  const zil = await getZil();
  const tx = await callContract(
    zil,
    a,
    "AddFunds",
    [],
    units.toQa(new BN(zils), units.Units.Zil),
    10000
  );
  return tx;
}
