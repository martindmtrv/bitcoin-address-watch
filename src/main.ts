import * as dotenv from "dotenv";
import { dbInit } from "./db/DBConnect";
import { spawn, Worker } from "threads";
import { IBlockListener } from "./workers/BlockListener";
import { filterAddr } from "./util/AddressFilter";

dotenv.config();

async function main() {
  await dbInit();

  // start block listener
  // @ts-ignore
  const listener: IBlockListener = await spawn(new Worker("./workers/BlockListener.ts"));
  listener.run();

  listener.queue().subscribe(filterAddr);
  console.log("main thread");
}

main();