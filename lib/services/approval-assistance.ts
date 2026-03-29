type ApprovalExpense = {
  amount: number;
  date: string;
  vendor: string;
  submittedAt?: string;
};

function toDayKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function isWeekend(value: string) {
  const day = new Date(value).getDay();
  return day === 0 || day === 6;
}

function normalizeVendor(vendor: string) {
  return vendor.trim().toLowerCase();
}

export function detectDuplicate(expense: ApprovalExpense, allExpenses: ApprovalExpense[]) {
  const vendor = normalizeVendor(expense.vendor);
  const dateKey = toDayKey(expense.date);

  return allExpenses.some((item) => {
    const sameAmount = Math.abs(item.amount - expense.amount) < 0.01;
    const sameDate = toDayKey(item.date) === dateKey;
    const sameVendor = normalizeVendor(item.vendor) === vendor;

    return sameAmount && sameDate && sameVendor;
  });
}

export function calculateRisk(expense: ApprovalExpense, history: ApprovalExpense[]) {
  const comparableHistory = history.filter((item) => normalizeVendor(item.vendor) !== "");
  const averageAmount =
    comparableHistory.length > 0
      ? comparableHistory.reduce((sum, item) => sum + item.amount, 0) / comparableHistory.length
      : expense.amount;

  const duplicate = detectDuplicate(expense, history);
  const comparisonBase = Math.max(averageAmount, 1);
  const amountRatio = expense.amount / comparisonBase;
  const submissionDate = expense.submittedAt ?? expense.date;

  let risk = 0;

  if (amountRatio >= 2) {
    risk += 0.45;
  } else if (amountRatio >= 1.5) {
    risk += 0.3;
  } else if (amountRatio >= 1.2) {
    risk += 0.15;
  }

  if (duplicate) {
    risk += 0.4;
  }

  if (isWeekend(submissionDate)) {
    risk += 0.15;
  }

  return Number(Math.min(1, risk).toFixed(2));
}

export function getRecommendation(risk: number, duplicate: boolean) {
  if (duplicate || risk >= 0.75) {
    return "Reject";
  }

  if (risk >= 0.4) {
    return "Flag for review";
  }

  return "Approve";
}

export type { ApprovalExpense };
