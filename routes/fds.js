const express = require("express");
const Fd = require("../models/Fd");

const router = express.Router();

const COMPOUNDS_PER_YEAR = {
  monthly: 12,
  quarterly: 4,
  "half-yearly": 2,
  yearly: 1,
};

/* Compound-interest maturity value: A = P (1 + r/n)^(n*t) */
function computeMaturity(principal, ratePct, tenureMonths, compounding) {
  const P = principal || 0;
  const r = (ratePct || 0) / 100;
  const t = (tenureMonths || 0) / 12;
  const n = COMPOUNDS_PER_YEAR[compounding] || 4;
  if (!P || !r || !t) return P;
  return Math.round(P * Math.pow(1 + r / n, n * t));
}

/* ================= GET all FDs ================= */
router.get("/", async (req, res) => {
  try {
    const parentId = req.parentId;
    if (!parentId) {
      return res.status(400).json({ message: "user id is required" });
    }

    const fds = await Fd.find({ parentId });
    const totalInvested = fds.reduce((sum, f) => sum + (f.principal || 0), 0);
    const totalMaturity = fds.reduce(
      (sum, f) => sum + (f.maturityAmount || 0),
      0
    );

    res.json({ fds, totalInvested, totalMaturity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= POST new FD ================= */
router.post("/", async (req, res) => {
  try {
    const {
      bank,
      principal,
      interestRate,
      tenureMonths,
      compounding,
      startDate,
      maturityDate,
    } = req.body;
    const parentId = req.parentId;

    if (!parentId || !principal) {
      return res
        .status(400)
        .json({ message: "user id and principal are required" });
    }

    const maturityAmount = computeMaturity(
      principal,
      interestRate,
      tenureMonths,
      compounding
    );

    const fd = new Fd({
      parentId,
      userId: parentId,
      bank,
      principal,
      interestRate,
      tenureMonths,
      compounding,
      startDate,
      maturityDate,
      maturityAmount,
    });
    await fd.save();

    res.status(201).json({ message: "FD added successfully", fd });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= PUT update FD ================= */
router.put("/:id", async (req, res) => {
  try {
    const { parentId, userId, ...updateData } = req.body;

    const fd = await Fd.findOne({ _id: req.params.id, parentId: req.parentId });
    if (!fd) {
      return res.status(404).json({ message: "FD not found" });
    }

    Object.assign(fd, updateData);
    /* Recompute maturity from the merged values */
    fd.maturityAmount = computeMaturity(
      fd.principal,
      fd.interestRate,
      fd.tenureMonths,
      fd.compounding
    );
    await fd.save();

    res.json({ message: "FD updated successfully", fd });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= DELETE FD ================= */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Fd.findOneAndDelete({
      _id: req.params.id,
      parentId: req.parentId,
    });
    if (!deleted) {
      return res.status(404).json({ message: "FD not found" });
    }
    res.json({ message: "FD deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
