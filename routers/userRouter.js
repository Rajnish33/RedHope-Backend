import express from "express";
import auth from "../middleware/auth.js";
import { User, Donations, Requests, BloodBank } from "../models/models.js";

const router = express.Router();

// GET - Get logged-in user info
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.find({ _id: req.user });
    console.log(user);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// POST - Make a donation
router.post("/donate", auth, async (req, res) => {
  try {
    req.body.userId = req.user;
    const date = new Date();
    req.body.date =
      date.toLocaleTimeString() + " " + date.toLocaleDateString();

    const newDonation = new Donations(req.body);
    const saved = await newDonation.save();

    await BloodBank.updateOne(
      { _id: req.body.bankId },
      { $push: { donations: { _id: saved._id } } }
    );

    res.send("done");
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// POST - Make a blood request
router.post("/request", auth, async (req, res) => {
  try {
    req.body.userId = req.user;
    const date = new Date();
    req.body.date =
      date.toLocaleTimeString() + " " + date.toLocaleDateString();

    const newRequest = new Requests(req.body);
    const saved = await newRequest.save();

    await BloodBank.updateOne(
      { _id: req.body.bankId },
      { $push: { requests: { _id: saved._id } } }
    );

    res.send("done");
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// GET - Get all donations by user
router.get("/donations", auth, async (req, res) => {
  try {
    const data = await Donations.find({ userId: req.user }).populate(
      "bankId",
      "-_id -__v -password -requests -donations -stock"
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// GET - Get all requests by user
router.get("/requests", auth, async (req, res) => {
  try {
    const data = await Requests.find({ userId: req.user }).populate(
      "bankId",
      "-_id -__v -password -requests -donations -stock"
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// PUT - Update user info
router.put("/", auth, async (req, res) => {
  try {
    console.log(req.user);
    await User.updateOne({ _id: req.user }, req.body);
    res.status(200).send("User updated");
  } catch (err) {
    console.error(err);
    res.status(404).send("User not found");
  }
});

export default router;
