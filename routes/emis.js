const express = require("express");
const Emi = require("../models/Emi");

const router = express.Router();

/* ================= GET all EMIs ================= */
router.get("/", async (req, res) => {
  try {
    const parentId = req.parentId;
    if (!parentId) {
      return res.status(400).json({ message: "user id is required" });
    }

    const emis = await Emi.find({ parentId });
    const totalMonthlyEmi = emis.reduce(
      (sum, e) => sum + (e.emiAmount || 0),
      0
    );

    res.json({ emis, totalMonthlyEmi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= POST new EMI ================= */
router.post("/", async (req, res) => {
  try {
    const {
      name,
      lender,
      loanType,
      principal,
      emiAmount,
      interestRate,
      tenureMonths,
      remainingMonths,
      startDate,
    } = req.body;
    const parentId = req.parentId;

    if (!parentId || !name || !emiAmount) {
      return res
        .status(400)
        .json({ message: "user id, name and emiAmount are required" });
    }

    const emi = new Emi({
      parentId,
      userId: parentId,
      name,
      lender,
      loanType,
      principal,
      emiAmount,
      interestRate,
      tenureMonths,
      remainingMonths: remainingMonths ?? tenureMonths,
      startDate,
    });
    await emi.save();

    res.status(201).json({ message: "EMI added successfully", emi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= PUT update EMI ================= */
router.put("/:id", async (req, res) => {
  try {
    const { parentId, userId, ...updateData } = req.body;
    const updated = await Emi.findOneAndUpdate(
      { _id: req.params.id, parentId: req.parentId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "EMI not found" });
    }
    res.json({ message: "EMI updated successfully", emi: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= DELETE EMI ================= */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Emi.findOneAndDelete({
      _id: req.params.id,
      parentId: req.parentId,
    });
    if (!deleted) {
      return res.status(404).json({ message: "EMI not found" });
    }
    res.json({ message: "EMI deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
