import { Zilliqa, BN } from "@zilliqa-js/zilliqa";
import { units } from "@zilliqa-js/util";
import type { Account } from "@zilliqa-js/account";
import { getPrivateKeys, getNode, getVersion, CUR_NETWORK } from "./config";
import { debug } from "./Logger";

const zil = new Zilliqa(getNode());
getPrivateKeys(zil);
export const VERSION = getVersion();
const color = "\x1b[41m\x1b[5m%s\x1b[0m";
const logColor = (s: string) => debug(color, s);

var alreadyLogged = false;

export async function getZil() {
  if (alreadyLogged) {
    return zil;
  } else {
    alreadyLogged = true;
    const def = zil.wallet.defaultAccount;
    if (typeof def == "undefined") {
      throw new Error("No default acc");
    }
    const defaultAddress = def.address;
    const balanceResponse = await zil.blockchain.getBalance(defaultAddress);
    const b = units.fromQa(
      new BN(balanceResponse.result.balance),
      units.Units.Zil
    );
    debug(`ADDRESS: ${defaultAddress}`);
    debug(`ACCOUNT BALANCE: ${b.toString()}`);
    logColor(`::: NETWORK => ${CUR_NETWORK} !!!!`);
    return zil;
  }
}

export async function getDefaultAcc(): Promise<Account> {
  if (!alreadyLogged) {
    await getZil();
  }
  const acc = zil.wallet.defaultAccount;
  if (!acc) {
    throw new Error("No default account");
  }
  return acc;
}
