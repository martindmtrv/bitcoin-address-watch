import express from "express"
import { Address } from "../schemas/Address";


const route = express.Router();

route.get("/address", (req, res) => {
  Address.find().exec().then((docs) => {
    res.json(docs);
  });
});

route.post("/address", (req, res) => {
  const address = req.body.address;

  Address.findOne({ address }).exec().then((doc) => {
    if (doc != null) {
      res.status(400).json({err: "Address already being tracked"});
      return;
    }

    const obj = new Address({ address });
    obj.save().then((doc) => {
      res.status(200).json(doc);
    });
  });
});

route.delete("/address", (req, res) => {
  const address = req.body.address;

  Address.deleteOne({ address }).exec().then((result) => {
    res.status(200).json(result);
  });
});

export default route;