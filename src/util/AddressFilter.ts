import crypto from "crypto";
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
    for (const doc of docs) {
      console.log(`Found match ${doc.address}, sending webhook`);

      if (!process.env["WEBHOOK_URL"] || !process.env["SIGNING_KEY"] || !process.env["VERIFY_KEY"]) {
        console.log("missing WEBHOOK_URL");
        process.exit(1);
      }

      // config the message
      const msg = {
        address: doc.address,
        nonce: crypto.randomUUID(),
      };

      // sign the data
      const data = Buffer.from(JSON.stringify(msg));
      const sign = crypto.sign("SHA256", data, process.env["SIGNING_KEY"]).toString("base64");


      // const verify = crypto.verify("SHA256", data, process.env["VERIFY_KEY"], Buffer.from(sign, "base64"));
      // console.log("sig verification", verify);

      // send the webhook with Authorization header to verify authenticity
      fetch(process.env["WEBHOOK_URL"], {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": sign },
        body: JSON.stringify(msg)
      });
    }
  });

}