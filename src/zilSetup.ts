import { Zilliqa, BN } from "@zilliqa-js/zilliqa";
import { getPrivateKey, getNode, getVersion, CUR_NETWORK } from "./config";

const zil = new Zilliqa(getNode());
zil.wallet.addByPrivateKey(getPrivateKey());
export const VERSION = getVersion();
export const ZIL_DECIMALS = new BN(10 ** 12);
const color = "\x1b[41m\x1b[5m%s\x1b[0m";
const logColor = (s: string) => console.log(color, s);

export async function getZil() {
  const def = zil.wallet.defaultAccount;
  if (typeof def == "undefined") {
    throw new Error("No default acc");
  }
  const defaultAddress = def.address;
  const balanceResponse = await zil.blockchain.getBalance(defaultAddress);
  const b = new BN(balanceResponse.result.balance).div(ZIL_DECIMALS);
  console.log(`ADDRESS: ${defaultAddress}`);
  console.log(`ACCOUNT BALANCE: ${b.toString()}`);
  console.log("\n");
  logColor(`::: NETWORK => ${CUR_NETWORK} !!!!`);
  console.log("\n");
  return zil;
}