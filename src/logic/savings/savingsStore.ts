/**
 * Savings Target Store - untuk mengelola target menabung bulanan
 */

import { save, load } from "../storage/localStorageClient";

const STORAGE_KEY = "savingsTarget";

export interface SavingsTarget {
  percentage: number; // Persentase menabung (0-100)
  updatedAt: number; // Timestamp saat terakhir diupdate
}

/**
 * Get target menabung dari storage
 * @returns SavingsTarget atau null jika belum di-set
 */
export function getSavingsTarget(): SavingsTarget | null {
  return load<SavingsTarget>(STORAGE_KEY);
}

/**
 * Set target menabung (persentase)
 * @param percentage - Persentase menabung (0-100)
 * @throws ValidationError jika persentase tidak valid
 */
export function setSavingsTarget(percentage: number): void {
  if (typeof percentage !== "number" || isNaN(percentage)) {
    throw new Error("Persentase harus berupa angka");
  }
  if (percentage < 0 || percentage > 100) {
    throw new Error("Persentase harus antara 0 dan 100");
  }

  const target: SavingsTarget = {
    percentage,
    updatedAt: Date.now(),
  };

  save(STORAGE_KEY, target);
}

/**
 * Calculate target menabung dari total income
 * @param totalIncome - Total pemasukan bulan ini
 * @returns Target menabung dalam rupiah
 */
export function calculateSavingsTarget(totalIncome: number): number {
  const target = getSavingsTarget();
  if (!target) {
    return 0;
  }
  return Math.round((totalIncome * target.percentage) / 100);
}

/**
 * Check apakah saldo sudah mencapai target menabung
 * @param balance - Sisa anggaran saat ini
 * @param totalIncome - Total pemasukan bulan ini
 * @returns true jika sudah mencapai target, false jika belum
 */
export function hasReachedSavingsTarget(balance: number, totalIncome: number): boolean {
  const target = calculateSavingsTarget(totalIncome);
  return balance >= target;
}

/**
 * Get selisih antara saldo dan target menabung
 * @param balance - Sisa anggaran saat ini
 * @param totalIncome - Total pemasukan bulan ini
 * @returns Selisih (negatif jika belum mencapai target, positif jika sudah melebihi)
 */
export function getSavingsTargetDifference(balance: number, totalIncome: number): number {
  const target = calculateSavingsTarget(totalIncome);
  return balance - target;
}

