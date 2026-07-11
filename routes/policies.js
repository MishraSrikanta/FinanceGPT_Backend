const express = require("express");
const Policy = require("../models/Policy");

const router = express.Router();

/* Annualise a premium based on its frequency */
function annualisePremium(policy) {
  const p = policy.premium || 0;
  switch (policy.premiumFrequency) {
    case "monthly":
      return p * 12;
    case "quarterly":
      return p * 4;
    case "half-yearly":
      return p * 2;
    case "single":
      return 0; // one-time, not a recurring annual outflow
    default: // yearly
      return p;
  }
}

/* ================= GET all policies ================= */
router.get("/", async (req, res) => {
  try {
    const parentId = req.parentId;
    if (!parentId) {
      return res.status(400).json({ message: "user id is required" });
    }

    const policies = await Policy.find({ parentId });
    const totalAnnualPremium = policies.reduce(
      (sum, p) => sum + annualisePremium(p),
      0
    );
    const totalSumAssured = policies.reduce(
      (sum, p) => sum + (p.sumAssured || 0),
      0
    );

    res.json({ policies, totalAnnualPremium, totalSumAssured });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= POST new policy ================= */
router.post("/", async (req, res) => {
  try {
    const {
      policyName,
      provider,
      policyNumber,
      type,
      premium,
      premiumFrequency,
      sumAssured,
      nominee,
      startDate,
      maturityDate,
    } = req.body;
    const parentId = req.parentId;

    if (!parentId || !policyName) {
      return res
        .status(400)
        .json({ message: "user id and policyName are required" });
    }

    const policy = new Policy({
      parentId,
      userId: parentId,
      policyName,
      provider,
      policyNumber,
      type,
      premium,
      premiumFrequency,
      sumAssured,
      nominee,
      startDate,
      maturityDate,
    });
    await policy.save();

    res.status(201).json({ message: "Policy added successfully", policy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= PUT update by id ================= */
router.put("/:id", async (req, res) => {
  try {
    const { parentId, userId, ...updateData } = req.body;
    const updated = await Policy.findOneAndUpdate(
      { _id: req.params.id, parentId: req.parentId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Policy not found" });
    }
    res.json({ message: "Policy updated successfully", policy: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= DELETE by id ================= */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Policy.findOneAndDelete({
      _id: req.params.id,
      parentId: req.parentId,
    });
    if (!deleted) {
      return res.status(404).json({ message: "Policy not found" });
    }
    res.json({ message: "Policy deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = { router, annualisePremium };
