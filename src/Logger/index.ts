import { Transaction } from "@zilliqa-js/account";
import { getNetworkName } from "../config";
import { units, BN } from "@zilliqa-js/zilliqa";
import { Logger } from "./Logger";

export const debug = Logger.log;
export const flushDebug = Logger.flush;

const RED = "\x1B[31m%s\x1b[0m";
const CYAN = "\x1B[36m%s\x1b[0m";
const GREEN = "\x1B[32m%s\x1b[0m";
const MAGENTA = "\x1B[35m%s\x1b[0m";

export function state(v: {}) {
  const color = "\x1b[33m%s\x1b[0m";
  debug(color, JSON.stringify(v, null, 4));
}

export function balance(inQa: BN) {
  const color = "\x1b[35m%s\x1b[0m";
  debug(color, `In Zil: ${units.fromQa(inQa, units.Units.Zil).toString()}`);
  debug(color, `In Li: ${units.fromQa(inQa, units.Units.Li).toString()}`);
  debug(color, `In Qa: ${inQa.toString()}`);
}

export function txLink(t: Transaction, msg: string) {
  const id = t.id;
  const url = `https://viewblock.io/zilliqa/tx/0x${id}?network=${getNetworkName()}`;
  debug(MAGENTA, msg);
  const receipt = t.getReceipt();
  if (receipt) {
    if (receipt.success) {
      debug(GREEN, "Success.");
    } else {
      debug(RED, "Failed.");
      if (receipt.errors) {
        Object.entries(receipt.errors).map(([k, v]) => {
          debug(RED, v);
        });
      }
    }
  }
  debug(CYAN, url);
}

export function contractLink(a: string, msg: string) {
  const url = `https://viewblock.io/zilliqa/address/${a}?network=${getNetworkName()}&tab=state`;
  debug(RED, msg);
  debug(RED, url);
}
