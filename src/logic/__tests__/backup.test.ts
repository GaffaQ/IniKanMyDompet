/**
 * Contoh unit tests untuk backup/restore
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { exportToJSON, importFromJSON } from "../backup/useBackupRestore";
import { Transaction, Category } from "../types/transactionTypes";
import * as transactionStore from "../transactions/transactionStore";
import * as categoryStore from "../categories/categoryStore";

// Mock stores
vi.mock("../transactions/transactionStore");
vi.mock("../categories/categoryStore");

describe("Backup/Restore", () => {
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      name: "Test Transaction",
      amount: 1000,
      type: "expense",
      category: "Makanan",
      date: "2024-01-28",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  const mockCategories: Category[] = [
    { id: "1", name: "Makanan", createdAt: Date.now() },
    { id: "2", name: "Lainnya", createdAt: Date.now() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock getTransactions
    vi.spyOn(transactionStore, "getTransactions").mockReturnValue(mockTransactions);
    vi.spyOn(categoryStore, "getCategories").mockReturnValue(mockCategories);
  });

  describe("exportToJSON", () => {
    it("should export data to JSON string", () => {
      const json = exportToJSON();
      const data = JSON.parse(json);

      expect(data.version).toBeDefined();
      expect(data.exportedAt).toBeGreaterThan(0);
      expect(Array.isArray(data.transactions)).toBe(true);
      expect(Array.isArray(data.categories)).toBe(true);
      expect(data.transactions.length).toBe(1);
      expect(data.categories.length).toBe(2);
    });
  });

  describe("importFromJSON", () => {
    it("should import valid JSON data", () => {
      const exportData = {
        version: "1.0.0",
        exportedAt: Date.now(),
        transactions: mockTransactions,
        categories: mockCategories,
      };

      const json = JSON.stringify(exportData);
      
      vi.spyOn(transactionStore, "importTransactions").mockReturnValue(1);
      vi.spyOn(categoryStore, "importCategories").mockReturnValue(2);
      vi.spyOn(categoryStore, "getCategories").mockReturnValue(mockCategories);

      const result = importFromJSON(json, true);

      expect(result.transactionsCount).toBe(1);
      expect(result.categoriesCount).toBe(2);
    });

    it("should throw error for invalid JSON", () => {
      expect(() => importFromJSON("invalid json")).toThrow();
    });

    it("should throw error for missing required fields", () => {
      const invalidData = {
        version: "1.0.0",
        exportedAt: Date.now(),
        // Missing transactions and categories
      };

      expect(() => importFromJSON(JSON.stringify(invalidData))).toThrow();
    });
  });
});

