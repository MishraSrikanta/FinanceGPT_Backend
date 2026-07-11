const express = require("express");
const Sip = require("../models/Sip");

const router = express.Router();

/*
 * Future value of a SIP (annuity-due style, contributions at start of month):
 * FV = P * [((1+i)^n - 1) / i] * (1+i)
 */
function computeFutureValue(monthlyAmount, expectedReturn, durationMonths) {
  const P = monthlyAmount || 0;
  const i = (expectedReturn || 0) / 100 / 12;
  const n = durationMonths || 0;
  if (!P || !n) return 0;
  if (!i) return Math.round(P * n);
  return Math.round(P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i));
}

/* ================= GET all SIPs ================= */
router.get("/", async (req, res) => {
  try {
    const parentId = req.parentId;
    if (!parentId) {
      return res.status(400).json({ message: "user id is required" });
    }

    const sips = await Sip.find({ parentId });
    const totalMonthly = sips.reduce((s, x) => s + (x.monthlyAmount || 0), 0);
    const projectedValue = sips.reduce(
      (s, x) =>
        s + computeFutureValue(x.monthlyAmount, x.expectedReturn, x.durationMonths),
      0
    );

    res.json({ sips, totalMonthly, projectedValue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= POST new SIP ================= */
router.post("/", async (req, res) => {
  try {
    const {
      fundName,
      category,
      monthlyAmount,
      expectedReturn,
      durationMonths,
      startDate,
    } = req.body;
    const parentId = req.parentId;

    if (!parentId || !monthlyAmount) {
      return res
        .status(400)
        .json({ message: "user id and monthlyAmount are required" });
    }

    const sip = new Sip({
      parentId,
      userId: parentId,
      fundName,
      category,
      monthlyAmount,
      expectedReturn,
      durationMonths,
      startDate,
    });
    await sip.save();

    res.status(201).json({ message: "SIP added successfully", sip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= PUT update by id ================= */
router.put("/:id", async (req, res) => {
  try {
    const { parentId, userId, ...updateData } = req.body;
    const updated = await Sip.findOneAndUpdate(
      { _id: req.params.id, parentId: req.parentId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "SIP not found" });
    }
    res.json({ message: "SIP updated successfully", sip: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= DELETE by id ================= */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Sip.findOneAndDelete({
      _id: req.params.id,
      parentId: req.parentId,
    });
    if (!deleted) {
      return res.status(404).json({ message: "SIP not found" });
    }
    res.json({ message: "SIP deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
