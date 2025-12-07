import express from "express";
import auth from "../middleware/auth.js";
import { Camp } from "../models/models.js";

const router = express.Router();

// POST - Create a new camp
router.post("/", auth, async (req, res) => {
  try {
    req.body.bankId = req.user; // attach logged-in bank
    const newCamp = new Camp(req.body);
    await newCamp.save();
    res.status(200).send();
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// GET - Fetch all camps by state, district, and date (public endpoint)
router.get("/allCamps/:state/:district/:date", async (req, res) => {
  try {
    const { state, district, date } = req.params;
    if (!date) {
      return res.json([]);
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.json([]);
    }

    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const data = await Camp.find(
      {
        state,
        district,
        date: { $gte: startOfDay, $lte: endOfDay },
      },
      { donors: 0, _id: 0 }
    ).populate("bankId", "name");

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// GET - Fetch camps by state/district or by logged-in bank (requires auth)
router.get("/:state?/:district?", auth, async (req, res) => {
  try {
    let query = {};

    if (req.params.state) {
      query.state = req.params.state;
      query.district = req.params.district;
    } else {
      query.bankId = req.user;
    }

    const data = await Camp.find(query)
      .populate("bankId", "-_id -__v -password -requests -donations -stock")
      .populate({
        path: "donors._id",
        select: "-__v -password",
      });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

// PUT - Update camp (add donor or mark donation complete)
router.put("/:id/:userId?", auth, async (req, res) => {
  try {
    if (req.params.userId) {
      // Update donor’s donation status
      await Camp.updateOne(
        {
          _id: req.params.id,
          donors: { $elemMatch: { _id: req.params.userId, status: 0 } },
        },
        { $set: { "donors.$.units": req.body.units, "donors.$.status": 1 } }
      );
    } else {
      // Add a new donor to camp (if not already present)
      const existing = await Camp.find({
        _id: req.params.id,
        donors: { $elemMatch: { _id: req.user } },
      });

      if (existing.length === 0) {
        await Camp.updateOne(
          { _id: req.params.id },
          { $push: { donors: { _id: req.user } } }
        );
      }
    }
    res.status(200).send();
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

export default router;
