import { deployQZIL, Transfer, Mint } from "../Interfaces/qzil";
import { deployICOContract, BuyToken } from "../Interfaces/ico";
import { BN } from "@zilliqa-js/zilliqa";
import { units } from "@zilliqa-js/util";
import { DrainContractBalance } from "../_reuse";
import { getZil } from "../zilSetup";
import { confirmTx, getBlockNumber, waitUntilBlock } from "../utill";

(async () => {
  try {
    const owner = "0x03b39223A540467A53BB044Fb7bFA3f44530135A";
    // deploy the token contract with a 100 tokens
    const [, qzilContract] = await deployQZIL(
      owner,
      units.toQa(new BN(100), units.Units.Zil)
    );
    if (!qzilContract.address) {
      throw new Error("Failed to deploy qzil");
    }
    const qzilImplementation = qzilContract.address;
    // get ico deadline set for 6 min
    const block = await getBlockNumber(60 * 6);
    // deploy the ico contract
    const [, icoContract] = await deployICOContract(
      owner,
      qzilImplementation,
      // have a simple 1 to 2 ratio, for each qa you get 2 qa of the token
      new BN(2),
      block,
      units.toQa(new BN(100), units.Units.Zil) // I want to ico to 100 zils
    );
    if (!icoContract.address) {
      throw new Error("Failed to deploy ico");
    }
    const icoImplementation = icoContract.address;
    const tokens = units.toQa(new BN(200), units.Units.Zil);
    // transfer 200 tokens to the owner
    await Mint(qzilImplementation, owner, tokens);
    // transfer 200 tokens from the owner to the ico contract
    await Transfer(qzilImplementation, icoImplementation, tokens);
    // declare loaded buyer addresses
    const zil = await getZil();
    const buyer1 = "0x2F714FAe25321eBd0A6B128Ae47F1054464feaba";
    const buyer2 = "0x6Cd3667Ba79310837e33f0aEcBE13688a6CBCa32";
    zil.wallet.setDefault(buyer1);
    await confirmTx(
      await BuyToken(
        icoImplementation,
        units.toQa(new BN(30), units.Units.Zil),
        true
      ),
      "Buy token with 30 zil => 60 qzil"
    );
    zil.wallet.setDefault(buyer2);
    await confirmTx(
      await BuyToken(
        icoImplementation,
        units.toQa(new BN(70), units.Units.Zil),
        true
      ),
      "Buy token with 70 zil => 140 qzil"
    );
    //try buying more see what happens
    await confirmTx(
      await BuyToken(
        icoImplementation,
        units.toQa(new BN(5), units.Units.Zil),
        true
      ),
      "Buy token with 5 ZIL => should fail insufficient supply of tokens"
    );

    //wait until ico ends!
    await waitUntilBlock(block);

    // Drain the contract balance to collect raised zils
    zil.wallet.setDefault(owner);
    await DrainContractBalance(
      icoImplementation,
      units.toQa(new BN(100), units.Units.Zil)
    );
  } catch (e) {
    console.error(e);
  }
})();
