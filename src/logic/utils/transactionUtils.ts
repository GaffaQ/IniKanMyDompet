/**
 * Utility functions untuk transaksi
 */

import { Transaction, TransactionFilter, SortOption } from "../types/transactionTypes";

/**
 * Generate unique ID untuk transaksi
 * Format: timestamp-random
 */
export function generateTransactionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}_${random}`;
}

/**
 * Filter transaksi berdasarkan criteria
 * @param transactions - Array transaksi
 * @param filter - Filter options
 * @returns Array transaksi yang sudah difilter
 */
export function filterTransactions(
  transactions: Transaction[],
  filter: TransactionFilter
): Transaction[] {
  let filtered = [...transactions];

  // Filter by search query
  if (filter.searchQuery && filter.searchQuery.trim().length > 0) {
    const query = filter.searchQuery.toLowerCase().trim();
    filtered = filtered.filter((tx) => {
      const nameMatch = tx.name.toLowerCase().includes(query);
      const noteMatch = tx.note?.toLowerCase().includes(query) || false;
      const categoryMatch = tx.category.toLowerCase().includes(query);
      return nameMatch || noteMatch || categoryMatch;
    });
  }

  // Filter by type
  if (filter.type && filter.type !== "all") {
    filtered = filtered.filter((tx) => tx.type === filter.type);
  }

  // Filter by category
  if (filter.category && filter.category !== "all") {
    filtered = filtered.filter((tx) => tx.category === filter.category);
  }

  // Filter by date range
  if (filter.dateFrom) {
    filtered = filtered.filter((tx) => tx.date >= filter.dateFrom!);
  }
  if (filter.dateTo) {
    filtered = filtered.filter((tx) => tx.date <= filter.dateTo!);
  }

  return filtered;
}

/**
 * Sort transaksi berdasarkan option
 * @param transactions - Array transaksi
 * @param sortOption - Sort option
 * @returns Array transaksi yang sudah di-sort
 */
export function sortTransactions(
  transactions: Transaction[],
  sortOption: SortOption = "date-desc"
): Transaction[] {
  const sorted = [...transactions];

  switch (sortOption) {
    case "date-desc":
      return sorted.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) {
          return dateB - dateA; // Newest first
        }
        return b.createdAt - a.createdAt; // If same date, newest created first
      });

    case "date-asc":
      return sorted.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) {
          return dateA - dateB; // Oldest first
        }
        return a.createdAt - b.createdAt;
      });

    case "amount-desc":
      return sorted.sort((a, b) => {
        if (a.amount !== b.amount) {
          return b.amount - a.amount; // Highest first
        }
        return b.createdAt - a.createdAt;
      });

    case "amount-asc":
      return sorted.sort((a, b) => {
        if (a.amount !== b.amount) {
          return a.amount - b.amount; // Lowest first
        }
        return a.createdAt - b.createdAt;
      });

    default:
      return sorted;
  }
}

/**
 * Filter dan sort transaksi sekaligus
 */
export function filterAndSortTransactions(
  transactions: Transaction[],
  filter: TransactionFilter,
  sortOption: SortOption = "date-desc"
): Transaction[] {
  const filtered = filterTransactions(transactions, filter);
  return sortTransactions(filtered, sortOption);
}

/**
 * Get transactions by date range
 */
export function getTransactionsByDateRange(
  transactions: Transaction[],
  dateFrom: string,
  dateTo: string
): Transaction[] {
  return transactions.filter((tx) => {
    return tx.date >= dateFrom && tx.date <= dateTo;
  });
}

/**
 * Get transactions by category
 */
export function getTransactionsByCategory(
  transactions: Transaction[],
  category: string
): Transaction[] {
  return transactions.filter((tx) => tx.category === category);
}

/**
 * Get transactions by type
 */
export function getTransactionsByType(
  transactions: Transaction[],
  type: "income" | "expense"
): Transaction[] {
  return transactions.filter((tx) => tx.type === type);
}

/**
 * Format date untuk display (YYYY-MM-DD -> DD/MM/YYYY)
 */
export function formatDateForDisplay(date: string): string {
  try {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  } catch {
    return date;
  }
}

/**
 * Get current date dalam format ISO (YYYY-MM-DD)
 */
export function getCurrentDateISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get date range untuk filter (today, this week, this month)
 */
export function getDateRangePreset(preset: "today" | "week" | "month"): {
  from: string;
  to: string;
} {
  const today = new Date();
  const to = getCurrentDateISO();

  switch (preset) {
    case "today":
      return { from: to, to };

    case "week": {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      const from = weekAgo.toISOString().split("T")[0];
      return { from, to };
    }

    case "month": {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      const from = monthAgo.toISOString().split("T")[0];
      return { from, to };
    }

    default:
      return { from: to, to };
  }
}

