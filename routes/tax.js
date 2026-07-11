const express = require("express");
const Salary = require("../models/Salary");
const Settings = require("../models/Settings");
const SecondaryIncome = require("../models/SecondaryIncome");
const { computeTax } = require("../utils/tax");
const { annualise } = require("./secondaryIncome");

const router = express.Router();

/* ================= GET tax for current salary ================= */
/*
 * GET /api/tax?parentId=...
 * Uses the user's stored salary profile. Adds secondary income to the
 * taxable base unless the `taxOnSalaryOnly` setting is enabled.
 * Optionally override the gross salary via ?gross=... for what-if checks.
 */
router.get("/", async (req, res) => {
  try {
    const parentId = req.parentId;
    if (!parentId) {
      return res.status(400).json({ message: "user id is required" });
    }

    const [salary, settings, secondary] = await Promise.all([
      Salary.findOne({ parentId }),
      Settings.findOne({ parentId }),
      SecondaryIncome.find({ parentId }),
    ]);

    let salaryGross = Number(req.query.gross);
    let deductions = {};

    if (salary) {
      const employerPf = salary.employerPf || 0;
      const gratuity = salary.gratuity || 0;
      if (Number.isNaN(salaryGross)) {
        salaryGross = (salary.ctc || 0) - employerPf - gratuity;
      }
      deductions = salary.deductions || {};
    }

    if (Number.isNaN(salaryGross)) {
      return res
        .status(400)
        .json({ message: "No salary profile found; provide ?gross=" });
    }

    /* Fold in secondary income unless the salary-only toggle is on */
    const taxOnSalaryOnly = settings ? settings.taxOnSalaryOnly : false;
    const secondaryAnnual = taxOnSalaryOnly
      ? 0
      : secondary.reduce((sum, i) => sum + annualise(i), 0);

    const grossAnnual = salaryGross + secondaryAnnual;

    const result = computeTax(grossAnnual, deductions);
    res.json({
      ...result,
      taxOnSalaryOnly,
      salaryGross: Math.round(salaryGross),
      secondaryIncome: Math.round(secondaryAnnual),
      grossAnnual: Math.round(grossAnnual),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
