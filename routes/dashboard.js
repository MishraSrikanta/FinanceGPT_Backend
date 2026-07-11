const express = require("express");
const Salary = require("../models/Salary");
const Emi = require("../models/Emi");
const Fd = require("../models/Fd");
const Sip = require("../models/Sip");
const SecondaryIncome = require("../models/SecondaryIncome");
const { deriveBreakdown } = require("./salary");
const { annualise } = require("./secondaryIncome");

const router = express.Router();

/* ================= GET dashboard aggregate ================= */
/* GET /api/dashboard?parentId=... */
router.get("/", async (req, res) => {
  try {
    const parentId = req.parentId;
    if (!parentId) {
      return res.status(400).json({ message: "user id is required" });
    }

    const [salary, emis, fds, sips, secondary] = await Promise.all([
      Salary.findOne({ parentId }),
      Emi.find({ parentId }),
      Fd.find({ parentId }),
      Sip.find({ parentId }),
      SecondaryIncome.find({ parentId }),
    ]);

    /* Salary / tax figures */
    const breakdown = salary ? deriveBreakdown(salary) : null;
    const ctc = salary ? salary.ctc || 0 : 0;

    /* Secondary income */
    const secondaryAnnual = secondary.reduce((sum, i) => sum + annualise(i), 0);

    /* EMIs */
    const totalMonthlyEmi = emis.reduce((sum, e) => sum + (e.emiAmount || 0), 0);
    const totalOutstanding = emis.reduce(
      (sum, e) => sum + (e.emiAmount || 0) * (e.remainingMonths || 0),
      0
    );

    /* FDs */
    const totalFdInvested = fds.reduce((sum, f) => sum + (f.principal || 0), 0);
    const totalFdMaturity = fds.reduce(
      (sum, f) => sum + (f.maturityAmount || 0),
      0
    );

    /* SIPs */
    const totalSipMonthly = sips.reduce(
      (sum, s) => sum + (s.monthlyAmount || 0),
      0
    );

    /* Net worth = FD assets − outstanding loan liabilities */
    const netWorth = totalFdInvested - totalOutstanding;

    res.json({
      salary: {
        ctc,
        annualInHand: breakdown ? breakdown.annualInHand : 0,
        monthlyInHand: breakdown ? breakdown.monthlyInHand : 0,
        annualTax: breakdown ? breakdown.annualTax : 0,
        regime: breakdown ? breakdown.regime : null,
      },
      secondaryIncome: {
        count: secondary.length,
        totalAnnual: Math.round(secondaryAnnual),
        totalMonthly: Math.round(secondaryAnnual / 12),
      },
      emis: {
        count: emis.length,
        totalMonthlyEmi,
        totalOutstanding,
      },
      fds: {
        count: fds.length,
        totalInvested: totalFdInvested,
        totalMaturity: totalFdMaturity,
      },
      sips: {
        count: sips.length,
        totalMonthly: totalSipMonthly,
      },
      netWorth,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
