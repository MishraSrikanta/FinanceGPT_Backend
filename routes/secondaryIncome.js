const express = require("express");
const SecondaryIncome = require("../models/SecondaryIncome");

const router = express.Router();

/* Annualise an income entry based on its frequency */
function annualise(entry) {
  const amount = entry.amount || 0;
  return entry.frequency === "yearly" ? amount : amount * 12;
}

/* ================= GET all secondary income ================= */
router.get("/", async (req, res) => {
  try {
    const parentId = req.parentId;
    if (!parentId) {
      return res.status(400).json({ message: "user id is required" });
    }

    const items = await SecondaryIncome.find({ parentId });
    const totalAnnual = items.reduce((sum, i) => sum + annualise(i), 0);

    res.json({
      secondaryIncome: items,
      totalAnnual: Math.round(totalAnnual),
      totalMonthly: Math.round(totalAnnual / 12),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= POST new secondary income ================= */
router.post("/", async (req, res) => {
  try {
    const { title, source, amount, frequency, date, description } = req.body;
    const parentId = req.parentId;

    if (!parentId || !amount) {
      return res
        .status(400)
        .json({ message: "user id and amount are required" });
    }

    const income = new SecondaryIncome({
      parentId,
      userId: parentId,
      title,
      source,
      amount,
      frequency,
      date,
      description,
    });
    await income.save();

    res
      .status(201)
      .json({ message: "Secondary income added successfully", income });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= PUT update by id ================= */
router.put("/:id", async (req, res) => {
  try {
    const { parentId, userId, ...updateData } = req.body;
    const updated = await SecondaryIncome.findOneAndUpdate(
      { _id: req.params.id, parentId: req.parentId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Secondary income not found" });
    }
    res.json({ message: "Secondary income updated successfully", income: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= DELETE by id ================= */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await SecondaryIncome.findOneAndDelete({
      _id: req.params.id,
      parentId: req.parentId,
    });
    if (!deleted) {
      return res.status(404).json({ message: "Secondary income not found" });
    }
    res.json({ message: "Secondary income deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = { router, annualise };
