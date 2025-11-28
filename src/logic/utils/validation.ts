/**
 * Utility functions untuk validasi data
 */

import {
  Transaction,
  CreateTransactionInput,
  Category,
  CreateCategoryInput,
  ValidationError,
} from "../types/transactionTypes";

/**
 * Validasi nama transaksi
 * @param name - Nama transaksi
 * @throws ValidationError jika tidak valid
 */
export function validateTransactionName(name: string): void {
  if (!name || typeof name !== "string") {
    throw new ValidationError("Nama transaksi harus berupa string");
  }
  if (name.trim().length < 2) {
    throw new ValidationError("Nama transaksi minimal 2 karakter");
  }
  if (name.trim().length > 100) {
    throw new ValidationError("Nama transaksi maksimal 100 karakter");
  }
}

/**
 * Validasi amount
 * @param amount - Jumlah uang
 * @throws ValidationError jika tidak valid
 */
export function validateAmount(amount: number): void {
  if (typeof amount !== "number" || isNaN(amount)) {
    throw new ValidationError("Amount harus berupa angka");
  }
  if (amount <= 0) {
    throw new ValidationError("Amount harus lebih besar dari 0");
  }
  if (amount > 999999999999) {
    throw new ValidationError("Amount terlalu besar (maksimal 999,999,999,999)");
  }
}

/**
 * Validasi tipe transaksi
 * @param type - Tipe transaksi
 * @throws ValidationError jika tidak valid
 */
export function validateTransactionType(type: string): void {
  if (type !== "income" && type !== "expense") {
    throw new ValidationError("Tipe transaksi harus 'income' atau 'expense'");
  }
}

/**
 * Validasi tanggal ISO string
 * @param date - Tanggal dalam format ISO (YYYY-MM-DD)
 * @throws ValidationError jika tidak valid
 */
export function validateDate(date: string): void {
  if (!date || typeof date !== "string") {
    throw new ValidationError("Tanggal harus berupa string");
  }
  
  // Format: YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new ValidationError("Format tanggal tidak valid. Gunakan format YYYY-MM-DD");
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new ValidationError("Tanggal tidak valid");
  }
  
  // Pastikan tanggal tidak di masa depan yang tidak masuk akal
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 10);
  if (dateObj > maxDate) {
    throw new ValidationError("Tanggal tidak boleh lebih dari 10 tahun ke depan");
  }
}

/**
 * Validasi kategori name
 * @param name - Nama kategori
 * @throws ValidationError jika tidak valid
 */
export function validateCategoryName(name: string): void {
  if (!name || typeof name !== "string") {
    throw new ValidationError("Nama kategori harus berupa string");
  }
  if (name.trim().length < 2) {
    throw new ValidationError("Nama kategori minimal 2 karakter");
  }
  if (name.trim().length > 50) {
    throw new ValidationError("Nama kategori maksimal 50 karakter");
  }
}

/**
 * Validasi seluruh CreateTransactionInput
 * @param input - Input untuk membuat transaksi
 * @param availableCategories - Daftar kategori yang tersedia
 * @throws ValidationError jika tidak valid
 */
export function validateCreateTransactionInput(
  input: CreateTransactionInput,
  availableCategories: Category[]
): void {
  validateTransactionName(input.name);
  validateAmount(input.amount);
  validateTransactionType(input.type);
  validateDate(input.date);
  
  // Validasi kategori harus ada di daftar kategori
  const categoryExists = availableCategories.some(
    (cat) => cat.name === input.category
  );
  if (!categoryExists) {
    throw new ValidationError(
      `Kategori '${input.category}' tidak ditemukan. Pastikan kategori sudah dibuat terlebih dahulu.`
    );
  }
  
  // Validasi note jika ada
  if (input.note !== undefined && input.note !== null) {
    if (typeof input.note !== "string") {
      throw new ValidationError("Catatan harus berupa string");
    }
    if (input.note.length > 500) {
      throw new ValidationError("Catatan maksimal 500 karakter");
    }
  }
}

/**
 * Validasi Transaction object lengkap
 * @param transaction - Transaction object
 * @param availableCategories - Daftar kategori yang tersedia
 * @throws ValidationError jika tidak valid
 */
export function validateTransaction(
  transaction: Transaction,
  availableCategories: Category[]
): void {
  if (!transaction.id || typeof transaction.id !== "string") {
    throw new ValidationError("Transaction ID tidak valid");
  }
  
  validateCreateTransactionInput(
    {
      name: transaction.name,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      note: transaction.note,
    },
    availableCategories
  );
  
  if (typeof transaction.createdAt !== "number" || transaction.createdAt <= 0) {
    throw new ValidationError("createdAt tidak valid");
  }
  
  if (typeof transaction.updatedAt !== "number" || transaction.updatedAt <= 0) {
    throw new ValidationError("updatedAt tidak valid");
  }
}

/**
 * Validasi CreateCategoryInput
 * @param input - Input untuk membuat kategori
 * @throws ValidationError jika tidak valid
 */
export function validateCreateCategoryInput(input: CreateCategoryInput): void {
  validateCategoryName(input.name);
  
  // Validasi color jika ada
  if (input.color !== undefined && input.color !== null) {
    if (typeof input.color !== "string") {
      throw new ValidationError("Color harus berupa string");
    }
    // Validasi hex color format
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(input.color)) {
      throw new ValidationError("Format color tidak valid. Gunakan format hex (#RRGGBB)");
    }
  }
}

