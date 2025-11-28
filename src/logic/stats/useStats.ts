/**
 * Stats calculations untuk aplikasi Budget & Expense Tracker
 */

import { Transaction, SummaryStats } from "../types/transactionTypes";

/**
 * Calculate summary statistics dari array transaksi
 * @param transactions - Array of transactions
 * @returns SummaryStats object
 */
export function calculateStats(transactions: Transaction[]): SummaryStats {
  const stats: SummaryStats = {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    expenseByCategory: {},
    dailyExpenses: {},
    monthlyIncome: {},
    monthlyExpense: {},
    transactionCount: transactions.length,
    incomeCount: 0,
    expenseCount: 0,
  };

  transactions.forEach((tx) => {
    if (tx.type === "income") {
      stats.totalIncome += tx.amount;
      stats.incomeCount++;

      // Monthly income aggregation
      const month = tx.date.substring(0, 7); // YYYY-MM
      stats.monthlyIncome[month] = (stats.monthlyIncome[month] || 0) + tx.amount;
    } else {
      stats.totalExpense += tx.amount;
      stats.expenseCount++;

      // Expense by category
      stats.expenseByCategory[tx.category] =
        (stats.expenseByCategory[tx.category] || 0) + tx.amount;

      // Daily expenses aggregation
      stats.dailyExpenses[tx.date] =
        (stats.dailyExpenses[tx.date] || 0) + tx.amount;

      // Monthly expense aggregation
      const month = tx.date.substring(0, 7); // YYYY-MM
      stats.monthlyExpense[month] =
        (stats.monthlyExpense[month] || 0) + tx.amount;
    }
  });

  // Calculate balance
  stats.balance = stats.totalIncome - stats.totalExpense;

  return stats;
}

/**
 * Get total income untuk periode tertentu
 * @param transactions - Array of transactions
 * @param dateFrom - Start date (ISO string, optional)
 * @param dateTo - End date (ISO string, optional)
 * @returns Total income
 */
export function getTotalIncome(
  transactions: Transaction[],
  dateFrom?: string,
  dateTo?: string
): number {
  let filtered = transactions.filter((tx) => tx.type === "income");

  if (dateFrom) {
    filtered = filtered.filter((tx) => tx.date >= dateFrom);
  }
  if (dateTo) {
    filtered = filtered.filter((tx) => tx.date <= dateTo);
  }

  return filtered.reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Get total expense untuk periode tertentu
 * @param transactions - Array of transactions
 * @param dateFrom - Start date (ISO string, optional)
 * @param dateTo - End date (ISO string, optional)
 * @returns Total expense
 */
export function getTotalExpense(
  transactions: Transaction[],
  dateFrom?: string,
  dateTo?: string
): number {
  let filtered = transactions.filter((tx) => tx.type === "expense");

  if (dateFrom) {
    filtered = filtered.filter((tx) => tx.date >= dateFrom);
  }
  if (dateTo) {
    filtered = filtered.filter((tx) => tx.date <= dateTo);
  }

  return filtered.reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Get balance untuk periode tertentu
 * @param transactions - Array of transactions
 * @param dateFrom - Start date (ISO string, optional)
 * @param dateTo - End date (ISO string, optional)
 * @returns Balance (income - expense)
 */
export function getBalance(
  transactions: Transaction[],
  dateFrom?: string,
  dateTo?: string
): number {
  const income = getTotalIncome(transactions, dateFrom, dateTo);
  const expense = getTotalExpense(transactions, dateFrom, dateTo);
  return income - expense;
}

/**
 * Get expense by category untuk periode tertentu
 * @param transactions - Array of transactions
 * @param dateFrom - Start date (ISO string, optional)
 * @param dateTo - End date (ISO string, optional)
 * @returns Record of category -> total expense
 */
export function getExpenseByCategory(
  transactions: Transaction[],
  dateFrom?: string,
  dateTo?: string
): Record<string, number> {
  let filtered = transactions.filter((tx) => tx.type === "expense");

  if (dateFrom) {
    filtered = filtered.filter((tx) => tx.date >= dateFrom);
  }
  if (dateTo) {
    filtered = filtered.filter((tx) => tx.date <= dateTo);
  }

  const result: Record<string, number> = {};
  filtered.forEach((tx) => {
    result[tx.category] = (result[tx.category] || 0) + tx.amount;
  });

  return result;
}

/**
 * Get daily expenses untuk periode tertentu
 * @param transactions - Array of transactions
 * @param dateFrom - Start date (ISO string, optional)
 * @param dateTo - End date (ISO string, optional)
 * @returns Record of date (YYYY-MM-DD) -> total expense
 */
export function getDailyExpenses(
  transactions: Transaction[],
  dateFrom?: string,
  dateTo?: string
): Record<string, number> {
  let filtered = transactions.filter((tx) => tx.type === "expense");

  if (dateFrom) {
    filtered = filtered.filter((tx) => tx.date >= dateFrom);
  }
  if (dateTo) {
    filtered = filtered.filter((tx) => tx.date <= dateTo);
  }

  const result: Record<string, number> = {};
  filtered.forEach((tx) => {
    result[tx.date] = (result[tx.date] || 0) + tx.amount;
  });

  return result;
}

/**
 * Get monthly aggregation (income dan expense per bulan)
 * @param transactions - Array of transactions
 * @returns Object dengan monthlyIncome dan monthlyExpense
 */
export function getMonthlyAggregation(transactions: Transaction[]): {
  monthlyIncome: Record<string, number>;
  monthlyExpense: Record<string, number>;
} {
  const monthlyIncome: Record<string, number> = {};
  const monthlyExpense: Record<string, number> = {};

  transactions.forEach((tx) => {
    const month = tx.date.substring(0, 7); // YYYY-MM
    if (tx.type === "income") {
      monthlyIncome[month] = (monthlyIncome[month] || 0) + tx.amount;
    } else {
      monthlyExpense[month] = (monthlyExpense[month] || 0) + tx.amount;
    }
  });

  return { monthlyIncome, monthlyExpense };
}

/**
 * Get top categories by expense (sorted)
 * @param transactions - Array of transactions
 * @param limit - Number of top categories to return (default: 5)
 * @returns Array of { category, total } sorted by total descending
 */
export function getTopExpenseCategories(
  transactions: Transaction[],
  limit: number = 5
): Array<{ category: string; total: number }> {
  const expenseByCategory = getExpenseByCategory(transactions);
  const entries = Object.entries(expenseByCategory)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);

  return entries;
}

