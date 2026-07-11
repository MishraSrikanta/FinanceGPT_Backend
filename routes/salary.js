const express = require("express");
const Salary = require("../models/Salary");
const { computeTax } = require("../utils/tax");

const router = express.Router();

/*
 * Derive gross (taxable) salary and monthly in-hand from a salary profile.
 * Employer PF and gratuity are part of CTC but not of the taxable gross.
 */
function deriveBreakdown(salary) {
  const s = salary.toObject ? salary.toObject() : salary;
  const employerPf = s.employerPf || 0;
  const gratuity = s.gratuity || 0;
  const employeePf = s.employeePf || 0;
  const professionalTax = s.professionalTax || 0;

  const grossAnnual = (s.ctc || 0) - employerPf - gratuity;
  const tax = computeTax(grossAnnual, s.deductions || {});
  const chosen = s.regime === "old" ? tax.oldRegime : tax.newRegime;

  const annualInHand =
    grossAnnual - chosen.totalTax - employeePf - professionalTax;

  return {
    grossAnnual: Math.round(grossAnnual),
    annualTax: chosen.totalTax,
    annualInHand: Math.round(annualInHand),
    monthlyInHand: Math.round(annualInHand / 12),
    regime: s.regime || "new",
  };
}

/* ================= GET salary profile ================= */
router.get("/", async (req, res) => {
  try {
    const parentId = req.parentId;
    if (!parentId) {
      return res.status(400).json({ message: "user id is required" });
    }

    const salary = await Salary.findOne({ parentId });
    if (!salary) {
      return res.status(404).json({ message: "Salary profile not found" });
    }

    res.json({ salary, breakdown: deriveBreakdown(salary) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= PUT (upsert) salary profile ================= */
router.put("/", async (req, res) => {
  try {
    const parentId = req.parentId;
    if (!parentId) {
      return res.status(400).json({ message: "user id is required" });
    }

    const salary = await Salary.findOneAndUpdate(
      { parentId },
      { ...req.body, parentId, userId: parentId },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({
      message: "Salary profile saved successfully",
      salary,
      breakdown: deriveBreakdown(salary),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = { router, deriveBreakdown };
