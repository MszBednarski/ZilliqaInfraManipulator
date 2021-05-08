import { getZil } from "./zilSetup";
import {
  createValParam,
  deploy,
  callContract,
  formatAddress,
  getParentDir,
} from "./utill";
import { getState } from "./_reuse";
import { units } from "@zilliqa-js/util";
import { BN } from "@zilliqa-js/zilliqa";
import { readFileSync } from "fs";
import { resolve } from "path";

(async () => {
  try {
    const cur = "zil19q4w6zepthsy9zw5qmm059gyz63uzsp4fyp3js";
    const acc = "0x03b39223A540467A53BB044Fb7bFA3f44530135A";
    //token payment contract
    const to = "zil1wzshrzzj4f8t7mzgyr0ct474l4v67kvlemwux9";
    // await deployQZIL(acc, 1000000);
    // await Mint(cur, acc, 10);
    await Transfer(cur, to, 42);
    const state = await getState(cur);
  } catch (e) {
    console.error(e);
  }
})();

// contract_owner: ByStr20,
// init_minter: ByStr20,
// name: String,
// symbol: String,
// decimals: Uint32,
// init_supply: Uint128,
// num_minting_blocks: Uint128

async function deployQZIL(owner: string, initSupply: number) {
  const code = readFileSync(
    resolve(getParentDir(), "./Experiments/QZIL.scilla"),
    "utf-8"
  );
  const zil = await getZil();
  const [tx, contract] = await deploy(
    zil,
    code,
    [
      createValParam("Uint32", "_scilla_version", "0"),
      createValParam("ByStr20", "contract_owner", formatAddress(owner)),
      createValParam("ByStr20", "init_minter", formatAddress(owner)),
      createValParam("String", "name", "QZIL"),
      createValParam("String", "symbol", "QZ"),
      createValParam("Uint32", "decimals", "12"),
      createValParam(
        "Uint128",
        "init_supply",
        units.toQa(new BN(initSupply), units.Units.Zil).toString()
      ),
      createValParam("Uint128", "num_minting_blocks", "10000000"),
    ],
    12000
  );
  return [tx, contract];
}

async function Mint(a: string, recipient: string, amount: number) {
  const zil = await getZil();
  const tx = await callContract(
    zil,
    a,
    "Mint",
    [
      createValParam("ByStr20", "recipient", formatAddress(recipient)),
      createValParam(
        "Uint128",
        "amount",
        units.toQa(new BN(amount), units.Units.Zil).toString()
      ),
    ],
    new BN(0),
    10000
  );
  return tx;
}

async function Transfer(a: string, to: string, amount: number) {
  const zil = await getZil();
  const tx = await callContract(
    zil,
    a,
    "Transfer",
    [
      createValParam("ByStr20", "to", formatAddress(to)),
      createValParam(
        "Uint128",
        "amount",
        units.toQa(new BN(amount), units.Units.Zil).toString()
      ),
    ],
    new BN(0),
    10000
  );
  return tx;
}
