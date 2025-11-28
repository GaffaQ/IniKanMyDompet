/**
 * Custom hook untuk state management transaksi
 * Menggunakan React state dengan LocalStorage persistence
 */

import { useState, useEffect, useCallback } from "react";
import {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilter,
  SortOption,
} from "../types/transactionTypes";
import { Category } from "../types/transactionTypes";
import * as transactionStore from "../transactions/transactionStore";
import { filterAndSortTransactions } from "../utils/transactionUtils";
import { calculateStats } from "../stats/useStats";

/**
 * Hook untuk mengelola transaksi
 * @param categories - Array of categories (untuk validasi)
 * @returns Object dengan state dan functions untuk CRUD operations
 */
export function useTransactionStore(categories: Category[] = []) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load transactions dari storage saat mount
  useEffect(() => {
    try {
      const loaded = transactionStore.getTransactions();
      setTransactions(loaded);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat transaksi"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add transaction baru
   */
  const addTransaction = useCallback(
    (input: CreateTransactionInput): Transaction => {
      try {
        setError(null);
        const newTransaction = transactionStore.addTransaction(input, categories);
        setTransactions((prev) => [...prev, newTransaction]);
        return newTransaction;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Gagal menambah transaksi";
        setError(errorMessage);
        throw err;
      }
    },
    [categories]
  );

  /**
   * Update transaction
   */
  const updateTransaction = useCallback(
    (input: UpdateTransactionInput): Transaction => {
      try {
        setError(null);
        const updated = transactionStore.updateTransaction(input, categories);
        setTransactions((prev) =>
          prev.map((tx) => (tx.id === input.id ? updated : tx))
        );
        return updated;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Gagal mengupdate transaksi";
        setError(errorMessage);
        throw err;
      }
    },
    [categories]
  );

  /**
   * Delete transaction
   */
  const deleteTransaction = useCallback((id: string): void => {
    try {
      setError(null);
      transactionStore.deleteTransaction(id);
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menghapus transaksi";
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Delete multiple transactions
   */
  const deleteTransactions = useCallback((ids: string[]): number => {
    try {
      setError(null);
      const count = transactionStore.deleteTransactions(ids);
      setTransactions((prev) => prev.filter((tx) => !ids.includes(tx.id)));
      return count;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menghapus transaksi";
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Clear all transactions
   */
  const clearAllTransactions = useCallback((): number => {
    try {
      setError(null);
      const count = transactionStore.clearAllTransactions();
      setTransactions([]);
      return count;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menghapus semua transaksi";
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Get filtered and sorted transactions
   */
  const getFilteredTransactions = useCallback(
    (filter: TransactionFilter = {}, sortOption: SortOption = "date-desc") => {
      return filterAndSortTransactions(transactions, filter, sortOption);
    },
    [transactions]
  );

  /**
   * Get statistics
   */
  const getStats = useCallback(() => {
    return calculateStats(transactions);
  }, [transactions]);

  /**
   * Refresh transactions dari storage
   */
  const refresh = useCallback(() => {
    try {
      const loaded = transactionStore.getTransactions();
      setTransactions(loaded);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat transaksi"
      );
    }
  }, []);

  return {
    // State
    transactions,
    isLoading,
    error,

    // Actions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteTransactions,
    clearAllTransactions,

    // Utilities
    getFilteredTransactions,
    getStats,
    refresh,
  };
}

