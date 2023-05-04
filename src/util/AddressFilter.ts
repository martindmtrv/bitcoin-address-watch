import { Address } from "../schemas/Address";
import fetch from "node-fetch";

export function filterAddr(addrs: String[]) {
  // TODO: maybe cache results?
  console.log("tx containing: %s", addrs);

  Address.find({
    address: { $in: addrs }
  }).exec().then((docs) => {
    if (docs.length == 0) {
      // do nothing
      console.log("nothing to do");
      return;
    }

    // send webhook notif

    // TODO: add a special signature so these messages cannot be mocked by a bad actor
    for (const doc of docs) {
      console.log(`Found match ${doc.address}, sending webhook`);

      if (!process.env["WEBHOOK_URL"]) {
        console.log("missing WEBHOOK_URL");
        process.exit(1);
      }

      fetch(process.env["WEBHOOK_URL"], {
        method: "POST",
        body: `addr ${doc.address}`
      });
    }
  });

}