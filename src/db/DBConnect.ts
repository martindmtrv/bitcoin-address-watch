import { connect } from "mongoose";

export async function dbInit() {
  if (!process.env["MONGO_DB_CONNECTION"])
    throw new Error("Missing MONGO_DB_CONNECTION string in environment");
  
  await connect(process.env["MONGO_DB_CONNECTION"]);
  console.log("connected to db");
}