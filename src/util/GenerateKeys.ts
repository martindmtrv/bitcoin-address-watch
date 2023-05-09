import crypto from "crypto";
import fs from "fs";

export function getKeys() {
  // check if exists first
  if (!fs.existsSync("./id_rsa_public.pem") || !fs.existsSync("./id_rsa_private.pem")) {
    genKeyPair();
  } 

  // load into the env
  process.env["SIGNING_KEY"] = fs.readFileSync("./id_rsa_private.pem").toString();
  process.env["VERIFY_KEY"] = fs.readFileSync("./id_rsa_public.pem").toString();
}

function genKeyPair() {
  // Generates an object where the keys are stored in properties `privateKey` and `publicKey`
  const keyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'pkcs1', // "Public Key Cryptography Standards 1" 
      format: 'pem' // Most common formatting choice
    },
    privateKeyEncoding: {
      type: 'pkcs1', // "Public Key Cryptography Standards 1"
      format: 'pem' // Most common formatting choice
    }
  });

  // Create the public key file
  fs.writeFileSync('./id_rsa_public.pem', keyPair.publicKey);

  // Create the private key file
  fs.writeFileSync('./id_rsa_private.pem', keyPair.privateKey);
}