import { getZil } from "../../zilSetup";
import { deployQZIL, Transfer, Mint } from "../../Interfaces/qzil";
import { deployICOContract, BuyToken } from "../../Interfaces/ico";
import { BN } from "@zilliqa-js/zilliqa";
import { units } from "@zilliqa-js/util";
import { DrainContractBalance } from "../../_reuse";
import { confirmTx, getBlockNumber, waitUntilBlock } from "../../utill";

/**
 * This one is to check the
 * refund scenario
 */
(async () => {
  try {
    const owner = "0x03b39223A540467A53BB044Fb7bFA3f44530135A";
    // deploy the token contract with a 300 tokens
    const [, qzilContract] = await deployQZIL(
      owner,
      units.toQa(new BN(300), units.Units.Zil)
    );
    if (!qzilContract.address) {
      throw new Error("Failed to deploy qzil");
    }
    const qzilImplementation = qzilContract.address;
    // get ico deadline set for 5 min
    const block = await getBlockNumber(60 * 5);
    // deploy the ico contract
    const [, icoContract] = await deployICOContract(
      owner,
      qzilImplementation,
      // have a simple 1 to 3 ratio, for each qa you get 3 qa of the token
      new BN(3),
      block,
      units.toQa(new BN(100), units.Units.Zil) // I want to ico to 100 zils
    );
    if (!icoContract.address) {
      throw new Error("Failed to deploy ico");
    }
    const icoImplementation = icoContract.address;
    const tokens = units.toQa(new BN(300), units.Units.Zil);
    // transfer 300 tokens to the owner
    await Mint(qzilImplementation, owner, tokens);
    // transfer 300 tokens from the owner to the ico contract
    await Transfer(qzilImplementation, icoImplementation, tokens);
    // declare loaded buyer addresses
    const zil = await getZil();
    const buyer1 = "0x2F714FAe25321eBd0A6B128Ae47F1054464feaba";

    // buy 30 tokens as buyer1
    zil.wallet.setDefault(buyer1);
    await confirmTx(
      await BuyToken(
        icoImplementation,
        units.toQa(new BN(10), units.Units.Zil),
        true
      ),
      "Buy token with 10 zil => 30 qzil"
    );

    //wait until ico ends!
    await waitUntilBlock(block);

    debug("Try to drain should fail since the goal is not reached");
    zil.wallet.setDefault(owner);
    await DrainContractBalance(
      icoImplementation,
      units.toQa(new BN(10), units.Units.Zil)
    );

    // Do a refund as the buyer1
    zil.wallet.setDefault(buyer1);
    debug("transfer 30 tokens from the buyer1 to the ico contract");
    debug("triggering the refund");
    await Transfer(
      qzilImplementation,
      icoImplementation,
      units.toQa(new BN(30), units.Units.Zil)
    );

    flushDebug("./icoTest3.ans");
  } catch (e) {
    console.error(e);
  }
})();
