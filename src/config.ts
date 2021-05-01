require("dotenv").config();
import { bytes } from "@zilliqa-js/util";

type Nets = "TESTNET" | "MAINNET";

export const CUR_NETWORK: Nets = "TESTNET";

const nodes: { [key in Nets]: string } = {
  TESTNET: "https://dev-api.zilliqa.com",
  MAINNET: "https://api.zilliqa.com/",
};

const version: { [key in Nets]: number } = {
  TESTNET: bytes.pack(333, 1),
  MAINNET: bytes.pack(1, 1),
};

export function getVersion() {
  return version[CUR_NETWORK];
}

export function getNode() {
  return nodes[CUR_NETWORK];
}

export function getPrivateKey() {
  const key = process.env[`PRIV_${CUR_NETWORK}`];
  if (typeof key != "string") {
    throw new Error(`Private Key for ${CUR_NETWORK} not defined`);
  }
  return key;
}
