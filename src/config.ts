import { resolve } from "path";
require("dotenv").config({ path: resolve(process.cwd(), ".env") });
import { bytes } from "@zilliqa-js/util";
import type { Zilliqa } from "@zilliqa-js/zilliqa";
import { debug } from "./Logger";

type Nets = "TESTNET" | "MAINNET";

export const CUR_NETWORK: Nets = process.env.CUR_NETWORK as unknown as Nets;

const nodes: { [key in Nets]: string } = {
  TESTNET: "https://dev-api.zilliqa.com",
  MAINNET: "https://api.zilliqa.com/",
};

const version: { [key in Nets]: number } = {
  TESTNET: bytes.pack(333, 1),
  MAINNET: bytes.pack(1, 1),
};

const networkName: { [key in Nets]: string } = {
  TESTNET: "testnet",
  MAINNET: "mainnet",
};

export function getNetworkName() {
  return networkName[CUR_NETWORK];
}

export function getVersion() {
  return version[CUR_NETWORK];
}

export function getNode() {
  return nodes[CUR_NETWORK];
}

/**
 * Add PRIV_${CUR_NETWORK}
 * and any
 * PRIV_${CUR_NETWORK}_${cur}
 * in ascending order starting from 1
 */
export function getPrivateKeys(zil: Zilliqa) {
  const key = process.env[`PRIV_${CUR_NETWORK}`];
  if (typeof key != "string") {
    throw new Error(`Private Key for ${CUR_NETWORK} not defined`);
  }
  zil.wallet.addByPrivateKey(key);
  // add other private keys
  let cur = 1;
  while (true) {
    const nextKey = process.env[`PRIV_${CUR_NETWORK}_${cur}`];
    if (typeof nextKey != "string") {
      break;
    } else {
      zil.wallet.addByPrivateKey(nextKey);
    }
    cur++;
  }
  debug("Loaded:");
  debug(Object.keys(zil.wallet.accounts));
}
