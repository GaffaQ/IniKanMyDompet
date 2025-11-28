/**
 * Contoh unit tests untuk stats calculations
 */

import { describe, it, expect } from "vitest";
import { calculateStats, getTotalIncome, getTotalExpense, getBalance } from "../stats/useStats";
import { Transaction } from "../types/transactionTypes";

describe("Stats Calculations", () => {
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      name: "Gaji",
      amount: 5000000,
      type: "income",
      category: "Lainnya",
      date: "2024-01-01",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "2",
      name: "Makan Siang",
      amount: 35000,
      type: "expense",
      category: "Makanan",
      date: "2024-01-01",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "3",
      name: "Transport",
      amount: 25000,
      type: "expense",
      category: "Transport",
      date: "2024-01-02",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "4",
      name: "Bonus",
      amount: 1000000,
      type: "income",
      category: "Lainnya",
      date: "2024-01-02",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  describe("calculateStats", () => {
    it("should calculate correct totals", () => {
      const stats = calculateStats(mockTransactions);

      expect(stats.totalIncome).toBe(6000000);
      expect(stats.totalExpense).toBe(60000);
      expect(stats.balance).toBe(5940000);
      expect(stats.transactionCount).toBe(4);
      expect(stats.incomeCount).toBe(2);
      expect(stats.expenseCount).toBe(2);
    });

    it("should calculate expense by category", () => {
      const stats = calculateStats(mockTransactions);

      expect(stats.expenseByCategory["Makanan"]).toBe(35000);
      expect(stats.expenseByCategory["Transport"]).toBe(25000);
    });

    it("should calculate daily expenses", () => {
      const stats = calculateStats(mockTransactions);

      expect(stats.dailyExpenses["2024-01-01"]).toBe(35000);
      expect(stats.dailyExpenses["2024-01-02"]).toBe(25000);
    });

    it("should calculate monthly aggregation", () => {
      const stats = calculateStats(mockTransactions);

      expect(stats.monthlyIncome["2024-01"]).toBe(6000000);
      expect(stats.monthlyExpense["2024-01"]).toBe(60000);
    });
  });

  describe("getTotalIncome", () => {
    it("should return total income", () => {
      const total = getTotalIncome(mockTransactions);
      expect(total).toBe(6000000);
    });

    it("should filter by date range", () => {
      const total = getTotalIncome(mockTransactions, "2024-01-02", "2024-01-02");
      expect(total).toBe(1000000);
    });
  });

  describe("getTotalExpense", () => {
    it("should return total expense", () => {
      const total = getTotalExpense(mockTransactions);
      expect(total).toBe(60000);
    });

    it("should filter by date range", () => {
      const total = getTotalExpense(mockTransactions, "2024-01-01", "2024-01-01");
      expect(total).toBe(35000);
    });
  });

  describe("getBalance", () => {
    it("should return correct balance", () => {
      const balance = getBalance(mockTransactions);
      expect(balance).toBe(5940000);
    });

    it("should return correct balance for date range", () => {
      const balance = getBalance(mockTransactions, "2024-01-02", "2024-01-02");
      expect(balance).toBe(975000); // 1000000 - 25000
    });
  });
});

