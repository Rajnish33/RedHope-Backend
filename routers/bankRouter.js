import express from "express";
import auth from "../middleware/auth.js";
import { User, BloodBank, Donations, Requests, Camp } from "../models/models.js";

const router = express.Router();

// POST - Find banks or users
router.post("/:handle", auth, async (req, res) => {
  try {
    const filter =
      req.params.handle === "bank"
        ? {}
        : { password: 0, requests: 0, donations: 0, stock: 0, __v: 0 };
    const banks = await BloodBank.find(req.body, filter);
    res.json(banks);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// GET - All banks in a state/district
router.get("/allBanks/:state/:district", async (req, res) => {
  try {
    const banks = await BloodBank.find(
      { state: req.params.state, district: req.params.district },
      { password: 0, _id: 0, donations: 0, requests: 0, stock: 0 }
    );
    res.json(banks);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// PUT - Update stock
router.put("/updateStock", auth, async (req, res) => {
  try {
    const prevStock = await BloodBank.findOne({ _id: req.user }, { stock: 1 });
    await BloodBank.updateOne(
      { _id: req.user },
      {
        $set: {
          [`stock.${req.body.bloodGroup}`]:
            prevStock.stock[req.body.bloodGroup] + req.body.units,
        },
      }
    );
    res.status(200).send();
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// PUT - Delete stock
router.put("/deleteStock", auth, async (req, res) => {
  try {
    const prevStock = await BloodBank.findOne({ _id: req.user }, { stock: 1 });
    if (prevStock.stock[req.body.bloodGroup] < req.body.units) {
      res.status(404).send("Not enough blood");
    } else {
      await BloodBank.updateOne(
        { _id: req.user },
        {
          $set: {
            [`stock.${req.body.bloodGroup}`]:
              prevStock.stock[req.body.bloodGroup] - req.body.units,
          },
        }
      );
      res.status(200).send();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// GET - Get stock info
router.get("/getStock", auth, async (req, res) => {
  try {
    const data = await BloodBank.findOne(
      { _id: req.user },
      { _id: 0, stock: 1 }
    );
    res.status(200).send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// PUT - Update donation status
router.put("/donations", auth, async (req, res) => {
  try {
    const result = await Donations.findByIdAndUpdate(req.body.id, { status: req.body.status });
    if (!result) {
      return res.status(404).send("Donation not found");
    }
    res.status(200).send("Status updated");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// PUT - Update request status
router.put("/requests", auth, async (req, res) => {
  try {
    const result = await Requests.findByIdAndUpdate(req.body.id, { status: req.body.status });
    if (!result) {
      return res.status(404).send("Request not found");
    }
    res.status(200).send("Status updated");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// GET - Donations list for a bank
router.get("/donations", auth, async (req, res) => {
  try {
    const data = await Donations.find({ bankId: req.user }).populate(
      "userId",
      "-__v -password -requests -donations -stock"
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// GET - Requests list for a bank
router.get("/requests", auth, async (req, res) => {
  try {
    const data = await Requests.find({ bankId: req.user }).populate(
      "userId",
      "-__v -password -requests -donations -stock"
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// PUT - Update bank info
router.put("/", auth, async (req, res) => {
  try {
    await BloodBank.updateOne({ _id: req.user }, req.body);
    res.status(200).send("BloodBank updated");
  } catch (err) {
    console.error(err);
    res.status(404).send("BloodBank not found");
  }
});

export default router;
