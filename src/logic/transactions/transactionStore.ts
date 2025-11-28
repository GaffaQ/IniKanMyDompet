/**
 * Transaction Store - CRUD operations untuk transaksi
 * Menggunakan LocalStorage untuk persistence
 */

import {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  NotFoundError,
  DuplicateError,
} from "../types/transactionTypes";
import { Category } from "../types/transactionTypes";
import { validateCreateTransactionInput, validateTransaction } from "../utils/validation";
import { generateTransactionId } from "../utils/transactionUtils";
import { save, load, remove } from "../storage/localStorageClient";

const STORAGE_KEY = "transactions";

/**
 * Get semua transaksi dari storage
 * @returns Array of transactions
 */
export function getTransactions(): Transaction[] {
  const transactions = load<Transaction[]>(STORAGE_KEY);
  return transactions || [];
}

/**
 * Get transaksi by ID
 * @param id - Transaction ID
 * @returns Transaction atau null jika tidak ditemukan
 */
export function getTransactionById(id: string): Transaction | null {
  const transactions = getTransactions();
  return transactions.find((tx) => tx.id === id) || null;
}

/**
 * Add transaksi baru
 * @param input - Data transaksi baru
 * @param categories - Daftar kategori yang tersedia (untuk validasi)
 * @returns Transaction yang baru dibuat
 * @throws ValidationError jika data tidak valid
 * @throws DuplicateError jika ID sudah ada (sangat jarang terjadi)
 */
export function addTransaction(
  input: CreateTransactionInput,
  categories: Category[]
): Transaction {
  // Validasi input
  validateCreateTransactionInput(input, categories);

  // Load existing transactions
  const transactions = getTransactions();

  // Generate ID dan timestamps
  const id = generateTransactionId();
  const now = Date.now();

  // Cek duplikasi ID (sangat jarang, tapi tetap dicek)
  if (transactions.some((tx) => tx.id === id)) {
    throw new DuplicateError(`Transaction dengan ID ${id} sudah ada`);
  }

  // Create transaction object
  const transaction: Transaction = {
    id,
    name: input.name.trim(),
    amount: input.amount,
    type: input.type,
    category: input.category,
    date: input.date,
    note: input.note?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  // Validasi transaction object lengkap
  validateTransaction(transaction, categories);

  // Add to array dan save
  const updatedTransactions = [...transactions, transaction];
  save(STORAGE_KEY, updatedTransactions);

  return transaction;
}

/**
 * Update transaksi yang sudah ada
 * @param input - Data update (harus include id)
 * @param categories - Daftar kategori yang tersedia (untuk validasi)
 * @returns Transaction yang sudah diupdate
 * @throws NotFoundError jika transaksi tidak ditemukan
 * @throws ValidationError jika data tidak valid
 */
export function updateTransaction(
  input: UpdateTransactionInput,
  categories: Category[]
): Transaction {
  const transactions = getTransactions();
  const index = transactions.findIndex((tx) => tx.id === input.id);

  if (index === -1) {
    throw new NotFoundError(`Transaction dengan ID ${input.id} tidak ditemukan`);
  }

  const existing = transactions[index];

  // Merge dengan data yang ada
  const updated: Transaction = {
    ...existing,
    ...(input.name !== undefined && { name: input.name.trim() }),
    ...(input.amount !== undefined && { amount: input.amount }),
    ...(input.type !== undefined && { type: input.type }),
    ...(input.category !== undefined && { category: input.category }),
    ...(input.date !== undefined && { date: input.date }),
    ...(input.note !== undefined && { note: input.note?.trim() || undefined }),
    updatedAt: Date.now(),
  };

  // Validasi transaction yang sudah diupdate
  validateTransaction(updated, categories);

  // Update array dan save
  const updatedTransactions = [...transactions];
  updatedTransactions[index] = updated;
  save(STORAGE_KEY, updatedTransactions);

  return updated;
}

/**
 * Delete transaksi
 * @param id - Transaction ID
 * @throws NotFoundError jika transaksi tidak ditemukan
 */
export function deleteTransaction(id: string): void {
  const transactions = getTransactions();
  const index = transactions.findIndex((tx) => tx.id === id);

  if (index === -1) {
    throw new NotFoundError(`Transaction dengan ID ${id} tidak ditemukan`);
  }

  // Remove dari array dan save
  const updatedTransactions = transactions.filter((tx) => tx.id !== id);
  save(STORAGE_KEY, updatedTransactions);
}

/**
 * Delete multiple transactions
 * @param ids - Array of transaction IDs
 * @returns Number of deleted transactions
 */
export function deleteTransactions(ids: string[]): number {
  const transactions = getTransactions();
  const idsSet = new Set(ids);
  const updatedTransactions = transactions.filter((tx) => !idsSet.has(tx.id));
  const deletedCount = transactions.length - updatedTransactions.length;
  
  save(STORAGE_KEY, updatedTransactions);
  return deletedCount;
}

/**
 * Clear semua transaksi
 * @returns Number of deleted transactions
 */
export function clearAllTransactions(): number {
  const transactions = getTransactions();
  const count = transactions.length;
  save(STORAGE_KEY, []);
  return count;
}

/**
 * Bulk import transactions (untuk restore dari backup)
 * @param transactions - Array of transactions
 * @param categories - Daftar kategori yang tersedia (untuk validasi)
 * @param replace - Jika true, replace semua data. Jika false, append
 * @returns Number of imported transactions
 * @throws ValidationError jika ada transaksi yang tidak valid
 */
export function importTransactions(
  transactions: Transaction[],
  categories: Category[],
  replace: boolean = true
): number {
  // Validasi semua transaksi
  transactions.forEach((tx) => {
    validateTransaction(tx, categories);
  });

  if (replace) {
    // Replace semua
    save(STORAGE_KEY, transactions);
    return transactions.length;
  } else {
    // Append (merge dengan existing, skip duplicates)
    const existing = getTransactions();
    const existingIds = new Set(existing.map((tx) => tx.id));
    const newTransactions = transactions.filter((tx) => !existingIds.has(tx.id));
    const merged = [...existing, ...newTransactions];
    save(STORAGE_KEY, merged);
    return newTransactions.length;
  }
}

