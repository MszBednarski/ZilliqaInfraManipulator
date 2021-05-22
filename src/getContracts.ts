import { getParentDir } from "./utill";
import { saveCode, getCode } from "./ContractsGetter";

type Contract = { repo: string; name: string; path: string };

const contracts: Contract[] = [
  {
    repo: "ZilliqaCollector",
    name: "ZilliqaCollector",
    path: "out/index.scilla",
  },
  {
    repo: "ZilliqaQVoteContracts",
    name: "QVoteContract",
    path: "contract/QVoting.scilla",
  },
  {
    repo: "ZilliqaTokenPayment",
    name: "TokenPayment",
    path: "out/index.scilla",
  },
  {
    repo: "ZilliqaICOContract",
    name: "ZilliqaICOContract",
    path: "out/index.scilla",
  },
];

async function getAndSave({ name, path, repo }: Contract) {
  const code = await getCode(repo, path);
  saveCode([{ name, code }], getParentDir());
}

contracts.forEach((c) => {
  getAndSave(c);
});
