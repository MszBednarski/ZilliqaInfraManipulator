import { Logger } from "./utill/Logger/Logger";

declare global {
  type Debug = typeof Logger.log;
  type FlushDebug = typeof Logger.flush;
  namespace NodeJS {
    interface Global {
      debug: Debug;
      flushDebug: FlushDebug;
    }
  }
  /**
   * Wrapper for console.log that saves the
   * logs that later can be saved to a file
   */
  const debug: Debug;
  /**
   * Flush everything logged into a file
   */
  const flushDebug: FlushDebug;
}
export function setup() {
  global.debug = Logger.log;
  global.flushDebug = Logger.flush;
}
export const debug = Logger.log;
export const flushDebug = Logger.flush;
