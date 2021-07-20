import { format } from "util";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { getParentDir } from "../utill/index";

export class Logger {
  private static buffer = "";

  static log(message?: any, ...optionalParams: any[]) {
    console.log(message, ...optionalParams);
    if (Logger.buffer != "") {
      Logger.buffer += "\n";
    }
    Logger.buffer += format(message, ...optionalParams);
  }

  static flush(path: string) {
    writeFileSync(resolve(getParentDir(), path), Logger.buffer);
    Logger.buffer = "";
  }
}
