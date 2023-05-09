import * as dotenv from "dotenv";
import { dbInit } from "./db/DBConnect";
import { spawn, Worker } from "threads";
import { IBlockListener } from "./workers/BlockListener";
import { filterAddr } from "./util/AddressFilter";
import express from "express";
import settingsRoute from "./workers/SettingsRouter";
import { getKeys } from "./util/GenerateKeys";

dotenv.config();

async function main() {
  await dbInit();
  getKeys();

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

  // return the pubkey
  app.get("/api/pubkey", (req, res) => {
    res.status(200).send(process.env["VERIFY_KEY"]);
  });

  app.listen(3000, () => {
    console.log("listening on port 3000");
  });  
}

main();