import { getZil } from "../zilSetup";
import { ZilliqaCollector } from "../ContractCode/ZilliqaCollector";
import {
  createValParam,
  deploy,
  callContract,
} from "../utill";
import { units } from "@zilliqa-js/util";
import { BN } from "@zilliqa-js/zilliqa";

export async function deployCollector() {
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

export async function AddFunds(a: string, zils: string) {
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
