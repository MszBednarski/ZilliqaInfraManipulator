require("dotenv").config();
import fs from "fs";
import { resolve } from "path";
import { exec } from "child_process";
import fetch from "node-fetch";

export async function getCode(repo: string, path: string) {
  const url = `https://api.github.com/repos/QVote/${repo}/contents/${path}`;
  //const url = `https://api.github.com/orgs/QVote/repos?type=private`
  console.log(url);
  //console.log(`https://api.github.com/repos/QVote/${repo}/${path}`)
  return await new Promise<string>((res, reject) =>
    exec(
      `curl -H 'Authorization: token ${process.env.TOKEN}' \
-H 'Accept: application/vnd.github.v3.raw' \
-L ${url}`,
      function (error, stdout, stderr) {
        if (error) {
          reject(error.stack);
        }
        res(stdout);
      }
    )
  );
}

export function saveCode(
  files: { name: string; code: string }[],
  rootDir: string
) {
  files.forEach((f) => {
    const toWrite = `export const ${f.name} = \`\n${f.code}\n\`;\n`;
    fs.writeFileSync(resolve(rootDir, `./ContractCode/${f.name}.ts`), toWrite);
  });
}
