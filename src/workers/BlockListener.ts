import * as zmq from "zeromq";
import * as bitcoinjs from "bitcoinjs-lib";
import * as dotenv from "dotenv";
import { expose } from "threads";
import { Observable, Subject } from "threads/observable";
import { WorkerModule } from "threads/dist/types/worker";
import BitcoinJsonRpc from "bitcoin-json-rpc";


dotenv.config();

export interface IBlockListener {
  run: () => void,
  queue: () => Observable<String[]>
}

const subject: Subject<String[]> = new Subject();

const listener: WorkerModule<any> = {
  async run() {
    const sock = new zmq.Subscriber();
    const rpc = new BitcoinJsonRpc(`http://${process.env["RPC_USER"]}:${process.env["RPC_PASSWORD"]}@${process.env["BITCOIN_RPC_HOST"]}`);

    sock.connect(`tcp://${process.env["BITCOIN_ZMQ_HOST"]}`);
    sock.subscribe("rawtx")
    console.log("connected to zmq tx host");

    for await (const [_, msg, __] of sock) {
      const addresses: string[] = [];

      const tx = bitcoinjs.Transaction.fromBuffer(msg);

      // coinbase tx does not need to check for input addresses 
      if (!tx.isCoinbase()) {
        // derive input addresses ...
        for (let i of tx.ins) {
          try {
            let prevtxid = i.hash.reverse().toString("hex");
            let prevIndex = i.index;

            let prevTx = await rpc.getRawTransactionAsObject(prevtxid);

            let ads: string[] = prevTx.vout[prevIndex].scriptPubKey?.addresses || [];
            let a = prevTx.vout[prevIndex].scriptPubKey?.address;

            if (a) {
              ads.push(a);
            }
            addresses.push(...ads);
          } catch (e) {
            // continue
          }
        }
      }

      for (let i of tx.outs) {
        try {
          let a = bitcoinjs.address.fromOutputScript(i.script, process.env["BITCOIN_NETWORK"] == "regtest" ? bitcoinjs.networks.regtest: bitcoinjs.networks.bitcoin);
          
          // don't dupe addresses that are in both input and output
          if (!addresses.includes(a)) {
            addresses.push(a);
          }
        } catch(e) {
          // continue, not a standard address?
        }
      }

      // pass these addresses to another thread
      subject.next(addresses);
    }
  },
  queue() {
    return Observable.from(subject);
  }

}

expose(listener);