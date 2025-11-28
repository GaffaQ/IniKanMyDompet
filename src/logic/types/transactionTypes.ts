/**
 * Data models dan types untuk aplikasi Budget & Expense Tracker
 */

/**
 * Tipe transaksi: pemasukan atau pengeluaran
 */
export type TransactionType = "income" | "expense";

/**
 * Model Transaction
 * 
 * @property id - Unique identifier (timestamp-based atau UUID)
 * @property name - Nama transaksi (min 2 karakter)
 * @property amount - Jumlah uang (harus > 0)
 * @property type - Tipe transaksi (income atau expense)
 * @property category - Nama kategori (harus valid/exists)
 * @property date - Tanggal transaksi dalam format ISO string (YYYY-MM-DD)
 * @property note - Catatan opsional
 * @property createdAt - Timestamp saat transaksi dibuat
 * @property updatedAt - Timestamp saat transaksi terakhir diupdate
 */
export interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO date string (YYYY-MM-DD)
  note?: string;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

/**
 * Input untuk membuat transaksi baru (tanpa id, createdAt, updatedAt)
 */
export interface CreateTransactionInput {
  name: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note?: string;
}

/**
 * Input untuk update transaksi (semua field optional kecuali id)
 */
export interface UpdateTransactionInput {
  id: string;
  name?: string;
  amount?: number;
  type?: TransactionType;
  category?: string;
  date?: string;
  note?: string;
}

/**
 * Model Category
 * 
 * @property id - Unique identifier
 * @property name - Nama kategori (min 2 karakter, unique)
 * @property color - Warna untuk UI (hex color)
 * @property icon - Nama icon (opsional, untuk UI)
 * @property createdAt - Timestamp saat kategori dibuat
 */
export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt: number;
}

/**
 * Input untuk membuat kategori baru
 */
export interface CreateCategoryInput {
  name: string;
  color?: string;
  icon?: string;
}

/**
 * Input untuk update kategori
 */
export interface UpdateCategoryInput {
  id: string;
  name?: string;
  color?: string;
  icon?: string;
}

/**
 * Summary Statistics
 * 
 * @property totalIncome - Total pemasukan
 * @property totalExpense - Total pengeluaran
 * @property balance - Sisa anggaran (income - expense)
 * @property expenseByCategory - Mapping kategori ke total expense
 * @property dailyExpenses - Mapping tanggal ke total expense per hari
 * @property monthlyIncome - Mapping bulan ke total income
 * @property monthlyExpense - Mapping bulan ke total expense
 */
export interface SummaryStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expenseByCategory: Record<string, number>;
  dailyExpenses: Record<string, number>; // date (YYYY-MM-DD) -> total
  monthlyIncome: Record<string, number>; // month (YYYY-MM) -> total
  monthlyExpense: Record<string, number>; // month (YYYY-MM) -> total
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}

/**
 * Filter options untuk transaksi
 */
export interface TransactionFilter {
  searchQuery?: string;
  type?: TransactionType | "all";
  category?: string | "all";
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
}

/**
 * Sort options untuk transaksi
 */
export type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

/**
 * Export/Import data structure
 */
export interface ExportData {
  version: string;
  exportedAt: number;
  transactions: Transaction[];
  categories: Category[];
}

/**
 * Error types
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class DuplicateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateError";
  }
}

