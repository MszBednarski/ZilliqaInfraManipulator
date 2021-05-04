import { getZil } from "./zilSetup";
import { ZilliqaCollector } from "./ContractCode/ZilliqaCollector";
import {
  createValParam,
  deploy,
  callContract,
  getContractState,
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
    const state = await getCollectorState(cur);
    // drain by cur balance
    // await DrainContractBalance(cur, state.balance);

    //update admin
    // await UpdateAdmin(cur, "0x03b39223A540467A53BB044Fb7bFA3f44530135A");
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

async function getCollectorState(a: string) {
  const zil = await getZil();
  const state = await getContractState(zil, a, 2);
  return state;
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

async function UpdateAdmin(a: string, newAdmin: string) {
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

async function DrainContractBalance(a: string, inQa: BN) {
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
