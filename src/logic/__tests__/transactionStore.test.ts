/**
 * Contoh unit tests untuk transactionStore
 * Menggunakan Vitest (atau Jest)
 * 
 * Untuk menjalankan tests:
 * npm install -D vitest @vitest/ui
 * npm run test
 * 
 * Atau dengan Jest:
 * npm install -D jest @types/jest ts-jest
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  clearAllTransactions,
} from "../transactions/transactionStore";
import { CreateTransactionInput } from "../types/transactionTypes";
import { Category } from "../types/transactionTypes";
import * as localStorageClient from "../storage/localStorageClient";

// Mock LocalStorage
const mockLocalStorage: Record<string, string> = {};

beforeEach(() => {
  // Clear mock storage
  Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
  
  // Mock localStorage functions
  vi.spyOn(localStorageClient, "save").mockImplementation((key, value) => {
    mockLocalStorage[key] = JSON.stringify(value);
  });
  
  vi.spyOn(localStorageClient, "load").mockImplementation((key) => {
    const value = mockLocalStorage[key];
    return value ? JSON.parse(value) : null;
  });
  
  vi.spyOn(localStorageClient, "remove").mockImplementation((key) => {
    delete mockLocalStorage[key];
  });
});

describe("Transaction Store", () => {
  const mockCategories: Category[] = [
    { id: "1", name: "Makanan", createdAt: Date.now() },
    { id: "2", name: "Lainnya", createdAt: Date.now() },
  ];

  describe("addTransaction", () => {
    it("should add a new transaction successfully", () => {
      const input: CreateTransactionInput = {
        name: "Makan Siang",
        amount: 35000,
        type: "expense",
        category: "Makanan",
        date: "2024-01-28",
      };

      const transaction = addTransaction(input, mockCategories);

      expect(transaction).toBeDefined();
      expect(transaction.id).toBeDefined();
      expect(transaction.name).toBe("Makan Siang");
      expect(transaction.amount).toBe(35000);
      expect(transaction.type).toBe("expense");
      expect(transaction.category).toBe("Makanan");
      expect(transaction.date).toBe("2024-01-28");
      expect(transaction.createdAt).toBeGreaterThan(0);
      expect(transaction.updatedAt).toBeGreaterThan(0);
    });

    it("should throw error if amount is invalid", () => {
      const input: CreateTransactionInput = {
        name: "Test",
        amount: -100,
        type: "expense",
        category: "Makanan",
        date: "2024-01-28",
      };

      expect(() => addTransaction(input, mockCategories)).toThrow();
    });

    it("should throw error if category does not exist", () => {
      const input: CreateTransactionInput = {
        name: "Test",
        amount: 1000,
        type: "expense",
        category: "Invalid Category",
        date: "2024-01-28",
      };

      expect(() => addTransaction(input, mockCategories)).toThrow();
    });
  });

  describe("getTransactions", () => {
    it("should return empty array if no transactions", () => {
      const transactions = getTransactions();
      expect(transactions).toEqual([]);
    });

    it("should return all transactions", () => {
      const input: CreateTransactionInput = {
        name: "Test Transaction",
        amount: 1000,
        type: "income",
        category: "Lainnya",
        date: "2024-01-28",
      };

      addTransaction(input, mockCategories);
      const transactions = getTransactions();

      expect(transactions.length).toBe(1);
      expect(transactions[0].name).toBe("Test Transaction");
    });
  });

  describe("updateTransaction", () => {
    it("should update transaction successfully", () => {
      const input: CreateTransactionInput = {
        name: "Original Name",
        amount: 1000,
        type: "expense",
        category: "Makanan",
        date: "2024-01-28",
      };

      const transaction = addTransaction(input, mockCategories);
      const updated = updateTransaction(
        {
          id: transaction.id,
          name: "Updated Name",
          amount: 2000,
        },
        mockCategories
      );

      expect(updated.name).toBe("Updated Name");
      expect(updated.amount).toBe(2000);
      expect(updated.updatedAt).toBeGreaterThan(transaction.updatedAt);
    });

    it("should throw error if transaction not found", () => {
      expect(() =>
        updateTransaction(
          { id: "non-existent-id", name: "Test" },
          mockCategories
        )
      ).toThrow();
    });
  });

  describe("deleteTransaction", () => {
    it("should delete transaction successfully", () => {
      const input: CreateTransactionInput = {
        name: "To Delete",
        amount: 1000,
        type: "expense",
        category: "Makanan",
        date: "2024-01-28",
      };

      const transaction = addTransaction(input, mockCategories);
      deleteTransaction(transaction.id);

      const transactions = getTransactions();
      expect(transactions.find((tx) => tx.id === transaction.id)).toBeUndefined();
    });

    it("should throw error if transaction not found", () => {
      expect(() => deleteTransaction("non-existent-id")).toThrow();
    });
  });

  describe("clearAllTransactions", () => {
    it("should clear all transactions", () => {
      addTransaction(
        {
          name: "Test 1",
          amount: 1000,
          type: "expense",
          category: "Makanan",
          date: "2024-01-28",
        },
        mockCategories
      );
      addTransaction(
        {
          name: "Test 2",
          amount: 2000,
          type: "income",
          category: "Lainnya",
          date: "2024-01-28",
        },
        mockCategories
      );

      const count = clearAllTransactions();
      expect(count).toBe(2);

      const transactions = getTransactions();
      expect(transactions.length).toBe(0);
    });
  });
});

