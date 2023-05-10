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