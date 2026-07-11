const express = require("express");
const Settings = require("../models/Settings");

const router = express.Router();

/* ================= GET settings ================= */
router.get("/", async (req, res) => {
  try {
    const parentId = req.parentId;
    if (!parentId) {
      return res.status(400).json({ message: "user id is required" });
    }

    /* Return defaults if the user has no saved settings yet */
    let settings = await Settings.findOne({ parentId });
    if (!settings) {
      settings = new Settings({ parentId });
    }

    res.json({ settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= PUT (upsert) settings ================= */
router.put("/", async (req, res) => {
  try {
    const parentId = req.parentId;
    if (!parentId) {
      return res.status(400).json({ message: "user id is required" });
    }

    const settings = await Settings.findOneAndUpdate(
      { parentId },
      { ...req.body, parentId, userId: parentId },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Settings saved successfully", settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
