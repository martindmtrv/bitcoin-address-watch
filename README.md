# Bitcoin Address Watch
The goal of this project is to provide a means to have webhooks for address changes on the bitcoin network. That is a webhook can be sent whenever a particular address sends or receives bitcoin on the blockchain.

This can be used to track arbitrary addresses for changes. A reachable bitcoin full node with txindex and zmqpubrawtx enabled is required for this project to work

# Running the project (Docker)
First build the image with `yarn build`, then use the `docker-compose-example.yml` to create a docker-compose file with the necessary environment variables.

# Environment variables
Required:

- `BITCOIN_RPC_HOST` -> the hostname and port of the bitcoin full node RPC
- `BITCOIN_ZMQ_HOST` -> the hostname and port of the bitcoin zmq host
- `MONGO_DB_CONNECTION` -> mongodb connection string for database. You can use any mongodb here (maybe later I can bundle one by default to make this env optional)
- `RPC_USER` -> username for bitcoin node rpc
- `RPC_PASSWORD` -> password for bitcoin node rpc
- `WEBHOOK_URL` -> URL to send webhooks to

# Notifications
The notification sent to the webhook url is very simple. It sends a POST request with the following data

```
{
  address: "bc1...",
  nonce: "some random UUID"
}
```

The POST request will also have the `Authorization` header value set as the signature of the message. This is necessary to check authenticity of the messsage to ensure it is really sent by this application.

# Verify signature
On the receiving end of this webhook notification, you should verify that the message is authentic. Here is a sample of how this can be done in nodejs `example/sigcheck.ts`

```typescript
import crypto from "crypto";
import express from "express";
import fetch from "node-fetch";

const app = express();

app.use(express.json());

app.post("/webhook", async (req, res) => {
  // 1. make sure authorization header exists
  if (!req.headers.authorization) {
    res.status(400).send("Missing authorization header");
    return;
  }

  // 2. get signature as a buffer from base64 encoding
  const signature = Buffer.from(req.headers.authorization, "base64");


  // 3. get the request body as a Buffer
  const data: { address: string; nonce: string; } = req.body;
  const msg = Buffer.from(JSON.stringify(data));


  // 4. get pubkey (you can set this in env var, and is available from the btcaddresswatch server at /api/pubkey)
  const pubkey = (await (await fetch("btcaddresswatch:3000/api/pubkey")).text());

  const verify = crypto.verify("SHA256", msg, pubkey, signature);

  if (!verify) {
    res.status(400).send("Invalid signature");
    return;
  }

  // verification was successful so continue...
});
```