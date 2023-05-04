import * as zmq from "zeromq";
import * as bitcoinjs from "bitcoinjs-lib";
import * as dotenv from "dotenv";
import { expose } from "threads";
import { Observable, Subject } from "threads/observable";
import { WorkerModule } from "threads/dist/types/worker";

dotenv.config();

export interface IBlockListener {
  run: () => void,
  queue: () => Observable<String[]>
}

const subject: Subject<String[]> = new Subject();

const listener: WorkerModule<any> = {
  async run() {
    const sock = new zmq.Subscriber();

    sock.connect(`tcp://${process.env["BITCOIN_ZMQ_HOST"]}`);
    sock.subscribe("rawtx")
    console.log("connected to zmq tx host");

    for await (const [_, msg, __] of sock) {
      const addresses: string[] = [];

      const tx = bitcoinjs.Transaction.fromBuffer(msg);

      for (let i of tx.outs) {
        try {
          addresses.push(bitcoinjs.address.fromOutputScript(i.script));
        } catch(e) {
          // continue, not a standard address
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