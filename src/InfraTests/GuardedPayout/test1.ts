import { deployQZIL, Transfer, Mint } from "../../Interfaces/qzil";
import { deployGuardedPayout, Withdraw } from "../../Interfaces/guarded";
import { BN } from "@zilliqa-js/zilliqa";
import { units } from "@zilliqa-js/util";
import { DrainContractBalance } from "../../_reuse";
import { getDefaultAcc } from "../../zilSetup";
import { confirmTx, getBlockNumber, waitUntilBlock } from "../../utill";

(async () => {
  try {
    const owner = (await getDefaultAcc()).address;
    // deploy the token contract with 100 allTokens
    const allTokens = units.toQa(new BN(100), units.Units.Zil);
    const [, qzilContract] = await deployQZIL(owner, allTokens);
    if (!qzilContract.address) {
      throw new Error("Failed to deploy qzil");
    }
    const qzilImplementation = qzilContract.address;
    // get payout deadlines
    const blocks = await Promise.all([
      getBlockNumber(5 * 60),
      getBlockNumber(9 * 60),
      getBlockNumber(13 * 60),
    ]);
    // deploy the guardedPayout
    const [, guardedPayout] = await deployGuardedPayout(
      owner,
      qzilImplementation,
      // pay out 20 allTokens at a time
      units.toQa(new BN(20), units.Units.Zil),
      blocks
    );
    if (!guardedPayout.address) {
      throw new Error("Failed to deploy guardedPayout");
    }
    const guardedImplementation = guardedPayout.address;
    // transfer 100 allTokens to the owner
    await Mint(qzilImplementation, owner, allTokens);
    // transfer 100 allTokens from the owner to the guardedPayout contract
    await Transfer(qzilImplementation, guardedImplementation, allTokens);

    await confirmTx(
      await Withdraw(guardedImplementation, true),
      "Withdraw before deadline => fail"
    );

    //wait until first deadline
    await waitUntilBlock(blocks[0]);

    await confirmTx(
      await Withdraw(guardedImplementation, true),
      "Withdraw on first deadline => 20 tokens"
    );

    await waitUntilBlock(blocks[1]);

    await confirmTx(
      await Withdraw(guardedImplementation, true),
      "Withdraw on second deadline => 20 tokens"
    );

    await waitUntilBlock(blocks[2]);

    await confirmTx(
      await Withdraw(guardedImplementation, true),
      "Withdraw on third deadline => 20 tokens"
    );

    debug(
      "Getting the remaining 40 tokens using drain contract balance after all deadlines are met"
    );
    await DrainContractBalance(
      guardedImplementation,
      units.toQa(new BN(40), units.Units.Zil)
    );
    flushDebug("./test1.ans");
  } catch (e) {
    console.error(e);
  }
})();
