import * as dotenv from "dotenv";
import { dbInit } from "./db/DBConnect";
import { spawn, Worker } from "threads";
import { IBlockListener } from "./workers/BlockListener";
import { filterAddr } from "./util/AddressFilter";
import express from "express";
import settingsRoute from "./workers/SettingsRouter";

dotenv.config();

async function main() {
  await dbInit();

  // start block listener
  // @ts-ignore
  const listener: IBlockListener = await spawn(new Worker("./workers/BlockListener.ts"));
  listener.run();

  listener.queue().subscribe(filterAddr);

  // start settings server
  const app = express();

  app.use(express.json());
  app.use(express.static("public"));
  app.use("/api/settings", settingsRoute);

  app.listen(3000, () => {
    console.log("listening on port 3000");
  });  
}

main();