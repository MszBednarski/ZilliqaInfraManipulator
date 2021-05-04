import { getZil } from "./zilSetup";
import {
  createValParam,
  deploy,
  callContract,
  getContractState,
  formatAddress,
} from "./utill";
import { units } from "@zilliqa-js/util";
import { BN } from "@zilliqa-js/zilliqa";

const code = `
scilla_version 0
import ListUtils IntUtils
library Test

type Error =
| NotActivated
| StagingAdminNotExist

let make_error =
fun (result: Error) =>
let result_code =
match result with
| NotActivated => Int32 -3
| StagingAdminNotExist => Int32 -4
end
in
{ _exception: "Error"; code: result_code }

let one_msg =
fun (m : Message) =>
let e = Nil {Message} in
Cons {Message} m e

let addfunds_tag = "AddFunds"

contract Test(
    collectorAddr: ByStr20
)

field isActive: Bool = False

procedure ThrowError(err: Error)
    e = make_error err;
    throw e
end

procedure IsActive()
    isActive_tmp <- isActive;
    match isActive_tmp with
    | True  =>
    | False =>
        e = NotActivated;
        ThrowError e
    end
end

transition Activate()
    accept;
    bal <- _balance;
    feeMsg = {_tag: addfunds_tag; _recipient: collectorAddr; _amount: bal};
    msgs = one_msg feeMsg;
    true_val = True;
    isActive := true_val;
    send msgs
end

transition DoNothing()
    IsActive
end

`;

/**
 * testnet tx:
 */

(async () => {
  try {
    const cur = "zil1rmleu8svym3gufguyv0na0gp9lpg39609n2dwn";
    // await deployTest()
    const state = await getState(cur);
    //check if can if not active
    // await DoNothing(cur);
    // activate contract with 4 zils
    await Activate(cur, "4");
    // try to do again
    await DoNothing(cur);

  } catch (e) {
    console.error(e);
  }
})();

async function deployTest() {
  const zil = await getZil();
  const [tx, contract] = await deploy(
    zil,
    code,
    [
      createValParam("Uint32", "_scilla_version", "0"),
      createValParam(
        "ByStr20",
        "collectorAddr",
        formatAddress("zil12n666f9925le2zgewkrxn6u489562thl3gazeg")
      ),
    ],
    12000
  );
  return [tx, contract];
}

async function getState(a: string) {
  const zil = await getZil();
  const state = await getContractState(zil, a, 2);
  return state;
}

async function Activate(a: string, zils: string) {
  const zil = await getZil();
  const tx = await callContract(
    zil,
    a,
    "Activate",
    [],
    units.toQa(new BN(zils), units.Units.Zil),
    10000
  );
  return tx;
}

async function DoNothing(a: string) {
  const zil = await getZil();
  const tx = await callContract(zil, a, "DoNothing", [], new BN(0), 10000);
  return tx;
}
