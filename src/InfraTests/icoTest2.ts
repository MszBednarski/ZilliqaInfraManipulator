import { getZil } from "../zilSetup";
import { deployQZIL, Transfer, Mint } from "../Interfaces/qzil";
import { deployICOContract, BuyToken } from "../Interfaces/ico";
import { BN } from "@zilliqa-js/zilliqa";
import { units } from "@zilliqa-js/util";
import { DrainContractBalance } from "../_reuse";
import { confirmTx, getBlockNumber, waitUntilBlock } from "../utill";

(async () => {
  try {
    const owner = "0x03b39223A540467A53BB044Fb7bFA3f44530135A";
    // deploy the token contract with a 30 tokens
    const [, qzilContract] = await deployQZIL(
      owner,
      units.toQa(new BN(30), units.Units.Zil)
    );
    if (!qzilContract.address) {
      throw new Error("Failed to deploy qzil");
    }
    const qzilImplementation = qzilContract.address;
    // get ico deadline set for 8 min
    const block = await getBlockNumber(60 * 8);
    // deploy the ico contract
    const [, icoContract] = await deployICOContract(
      owner,
      qzilImplementation,
      // have a simple 1 to 3 ratio, for each qa you get 3 qa of the token
      new BN(3),
      block,
      units.toQa(new BN(10), units.Units.Zil) // I want to ico to 10 zils
    );
    if (!icoContract.address) {
      throw new Error("Failed to deploy ico");
    }
    const icoImplementation = icoContract.address;
    const tokens = units.toQa(new BN(30), units.Units.Zil);
    // transfer 30 tokens to the owner
    await Mint(qzilImplementation, owner, tokens);
    // transfer 30 tokens from the owner to the ico contract
    await Transfer(qzilImplementation, icoImplementation, tokens);
    // declare loaded buyer addresses
    const zil = await getZil();
    const buyer1 = "0x2F714FAe25321eBd0A6B128Ae47F1054464feaba";

    // Try to drain contract balance
    zil.wallet.setDefault(owner);
    // try to drain before funding goal reached
    await DrainContractBalance(
      icoImplementation,
      units.toQa(new BN(0), units.Units.Zil)
    );

    // buy token as buyer1 and reach funding goal
    zil.wallet.setDefault(buyer1);
    await confirmTx(
      await BuyToken(
        icoImplementation,
        units.toQa(new BN(10), units.Units.Zil),
        true
      ),
      "Buy token with 10 zil => 30 qzil"
    );

    // Try to drain contract balance before deadline
    zil.wallet.setDefault(owner);
    await DrainContractBalance(
      icoImplementation,
      units.toQa(new BN(10), units.Units.Zil)
    );

    //wait until ico ends!
    await waitUntilBlock(block);

    // Try to drain contract balance as non admin
    zil.wallet.setDefault(buyer1);
    await DrainContractBalance(
      icoImplementation,
      units.toQa(new BN(10), units.Units.Zil)
    );

    // Drain contract as admin
    zil.wallet.setDefault(owner);
    await DrainContractBalance(
      icoImplementation,
      units.toQa(new BN(10), units.Units.Zil)
    );
    flushDebug("./icoTest2.ans");
  } catch (e) {
    console.error(e);
  }
})();
