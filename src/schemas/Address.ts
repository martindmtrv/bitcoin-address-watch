import { Schema, model } from "mongoose";

interface IAddress {
  address: string;
}

const addressSchema = new Schema<IAddress>({
  address: { type: String, required: true }
});

const Address = model<IAddress>("Address", addressSchema);

export { IAddress, Address };