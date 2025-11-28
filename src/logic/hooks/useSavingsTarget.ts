/**
 * Custom hook untuk state management target menabung
 */

import { useState, useEffect, useCallback } from "react";
import * as savingsStore from "../savings/savingsStore";

/**
 * Hook untuk mengelola target menabung
 * @returns Object dengan state dan functions untuk CRUD operations
 */
export function useSavingsTarget() {
  const [target, setTarget] = useState<savingsStore.SavingsTarget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load target dari storage saat mount
  useEffect(() => {
    try {
      const loaded = savingsStore.getSavingsTarget();
      setTarget(loaded);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat target menabung"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Set target menabung
   */
  const setSavingsTarget = useCallback((percentage: number): void => {
    try {
      setError(null);
      savingsStore.setSavingsTarget(percentage);
      const updated = savingsStore.getSavingsTarget();
      setTarget(updated);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menyimpan target menabung";
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Calculate target menabung dari total income
   */
  const calculateTarget = useCallback((totalIncome: number): number => {
    return savingsStore.calculateSavingsTarget(totalIncome);
  }, []);

  /**
   * Check apakah sudah mencapai target
   */
  const hasReachedTarget = useCallback((balance: number, totalIncome: number): boolean => {
    return savingsStore.hasReachedSavingsTarget(balance, totalIncome);
  }, []);

  /**
   * Get selisih dengan target
   */
  const getTargetDifference = useCallback((balance: number, totalIncome: number): number => {
    return savingsStore.getSavingsTargetDifference(balance, totalIncome);
  }, []);

  /**
   * Refresh target dari storage
   */
  const refresh = useCallback(() => {
    try {
      const loaded = savingsStore.getSavingsTarget();
      setTarget(loaded);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat target menabung"
      );
    }
  }, []);

  return {
    // State
    target,
    isLoading,
    error,

    // Actions
    setSavingsTarget,

    // Utilities
    calculateTarget,
    hasReachedTarget,
    getTargetDifference,
    refresh,
  };
}

