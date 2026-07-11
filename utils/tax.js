/*
 * Indian income-tax helper — FY 2024-25 / AY 2025-26.
 * Computes tax under both the OLD and NEW regimes and returns a comparison
 * plus simple saving suggestions. All amounts are annual (INR).
 */

const CESS_RATE = 0.04; // Health & Education cess

/* Slab-based tax on a taxable income figure */
function slabTax(taxable, slabs) {
  let tax = 0;
  for (const { upTo, rate } of slabs) {
    if (taxable > upTo.from) {
      const amountInSlab = Math.min(taxable, upTo.to) - upTo.from;
      tax += amountInSlab * rate;
    }
  }
  return tax;
}

const NEW_SLABS = [
  { upTo: { from: 0, to: 300000 }, rate: 0 },
  { upTo: { from: 300000, to: 700000 }, rate: 0.05 },
  { upTo: { from: 700000, to: 1000000 }, rate: 0.1 },
  { upTo: { from: 1000000, to: 1200000 }, rate: 0.15 },
  { upTo: { from: 1200000, to: 1500000 }, rate: 0.2 },
  { upTo: { from: 1500000, to: Infinity }, rate: 0.3 },
];

const OLD_SLABS = [
  { upTo: { from: 0, to: 250000 }, rate: 0 },
  { upTo: { from: 250000, to: 500000 }, rate: 0.05 },
  { upTo: { from: 500000, to: 1000000 }, rate: 0.2 },
  { upTo: { from: 1000000, to: Infinity }, rate: 0.3 },
];

function round(n) {
  return Math.round(n || 0);
}

/* NEW regime — standard deduction 75k, 87A rebate up to 7L taxable */
function computeNewRegime(grossSalary) {
  const standardDeduction = 75000;
  const taxable = Math.max(0, grossSalary - standardDeduction);
  let tax = slabTax(taxable, NEW_SLABS);
  if (taxable <= 700000) tax = 0; // section 87A rebate
  const cess = tax * CESS_RATE;
  return {
    regime: "new",
    grossSalary: round(grossSalary),
    standardDeduction,
    taxableIncome: round(taxable),
    tax: round(tax),
    cess: round(cess),
    totalTax: round(tax + cess),
  };
}

/* OLD regime — standard deduction 50k + chapter VI-A deductions, 87A up to 5L */
function computeOldRegime(grossSalary, deductions = {}) {
  const standardDeduction = 50000;
  const chapterVIA =
    (deductions.section80C || 0) +
    (deductions.section80D || 0) +
    (deductions.hraExemption || 0) +
    (deductions.homeLoanInterest || 0) +
    (deductions.others || 0);
  const taxable = Math.max(0, grossSalary - standardDeduction - chapterVIA);
  let tax = slabTax(taxable, OLD_SLABS);
  if (taxable <= 500000) tax = 0; // section 87A rebate
  const cess = tax * CESS_RATE;
  return {
    regime: "old",
    grossSalary: round(grossSalary),
    standardDeduction,
    totalDeductions: round(chapterVIA),
    taxableIncome: round(taxable),
    tax: round(tax),
    cess: round(cess),
    totalTax: round(tax + cess),
  };
}

/* Build saving suggestions for the old regime */
function buildSuggestions(deductions = {}) {
  const suggestions = [];
  const c = deductions.section80C || 0;
  if (c < 150000) {
    suggestions.push(
      `Invest ₹${150000 - c} more under Section 80C (ELSS, PPF, EPF, life insurance) to reach the ₹1,50,000 cap.`
    );
  }
  const d = deductions.section80D || 0;
  if (d < 25000) {
    suggestions.push(
      `Claim up to ₹25,000 for health insurance premiums under Section 80D (₹${
        25000 - d
      } unused).`
    );
  }
  if (!deductions.homeLoanInterest) {
    suggestions.push(
      "If you have a home loan, claim up to ₹2,00,000 interest under Section 24(b)."
    );
  }
  suggestions.push(
    "Consider NPS (Section 80CCD(1B)) for an additional ₹50,000 deduction."
  );
  return suggestions;
}

/*
 * Main entry: compare regimes for a given gross salary and deductions.
 * `grossSalary` is the taxable annual salary (gross, before deductions).
 */
function computeTax(grossSalary = 0, deductions = {}) {
  const oldRegime = computeOldRegime(grossSalary, deductions);
  const newRegime = computeNewRegime(grossSalary);
  const recommended =
    oldRegime.totalTax <= newRegime.totalTax ? "old" : "new";
  return {
    oldRegime,
    newRegime,
    recommended,
    savingByChoosing: {
      regime: recommended,
      amount: Math.abs(oldRegime.totalTax - newRegime.totalTax),
    },
    suggestions: buildSuggestions(deductions),
  };
}

module.exports = { computeTax, computeOldRegime, computeNewRegime };
