import * as zmq from "zeromq";
import * as bitcoinjs from "bitcoinjs-lib";
import * as dotenv from "dotenv";

dotenv.config();

async function run() {
  const sock = new zmq.Subscriber();

  sock.connect(`tcp://${process.env["BITCOIN_ZMQ_HOST"]}`);
  sock.subscribe("rawtx")
  console.log("connected to zmq tx host");

  for await (const [_, msg, __] of sock) {
    const addresses = [];

    const tx = bitcoinjs.Transaction.fromBuffer(msg);

    for (let i of tx.outs) {
      try {
        addresses.push(bitcoinjs.address.fromOutputScript(i.script));
      } catch(e) {
        // continue, not a standard address
      }
    }

    // do something with these addresses now

    console.log(addresses);
  }
}

run();