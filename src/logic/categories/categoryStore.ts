/**
 * Category Store - CRUD operations untuk kategori
 * Menggunakan LocalStorage untuk persistence
 */

import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  NotFoundError,
  DuplicateError,
} from "../types/transactionTypes";
import { validateCreateCategoryInput, validateCategoryName } from "../utils/validation";
import { save, load } from "../storage/localStorageClient";
import { getTransactions, updateTransaction } from "../transactions/transactionStore";

const STORAGE_KEY = "categories";
const DEFAULT_CATEGORY_NAME = "Lainnya";

/**
 * Get semua kategori dari storage
 * @returns Array of categories
 */
export function getCategories(): Category[] {
  const categories = load<Category[]>(STORAGE_KEY);
  
  // Jika belum ada, return default categories
  if (!categories || categories.length === 0) {
    return getDefaultCategories();
  }
  
  return categories;
}

/**
 * Get default categories (untuk first-time setup)
 */
function getDefaultCategories(): Category[] {
  const now = Date.now();
  return [
    { id: `${now}_1`, name: "Makanan", color: "#4F46E5", createdAt: now },
    { id: `${now}_2`, name: "Transport", color: "#22C55E", createdAt: now },
    { id: `${now}_3`, name: "Belanja", color: "#F59E0B", createdAt: now },
    { id: `${now}_4`, name: "Hiburan", color: "#EC4899", createdAt: now },
    { id: `${now}_5`, name: "Kesehatan", color: "#06B6D4", createdAt: now },
    { id: `${now}_6`, name: DEFAULT_CATEGORY_NAME, color: "#8B5CF6", createdAt: now },
  ];
}

/**
 * Initialize default categories jika belum ada
 */
export function initializeDefaultCategories(): void {
  const categories = load<Category[]>(STORAGE_KEY);
  if (!categories || categories.length === 0) {
    save(STORAGE_KEY, getDefaultCategories());
  }
}

/**
 * Get kategori by ID
 * @param id - Category ID
 * @returns Category atau null jika tidak ditemukan
 */
export function getCategoryById(id: string): Category | null {
  const categories = getCategories();
  return categories.find((cat) => cat.id === id) || null;
}

/**
 * Get kategori by name
 * @param name - Category name
 * @returns Category atau null jika tidak ditemukan
 */
export function getCategoryByName(name: string): Category | null {
  const categories = getCategories();
  return categories.find((cat) => cat.name === name) || null;
}

/**
 * Add kategori baru
 * @param input - Data kategori baru
 * @returns Category yang baru dibuat
 * @throws ValidationError jika data tidak valid
 * @throws DuplicateError jika nama kategori sudah ada
 */
export function addCategory(input: CreateCategoryInput): Category {
  // Validasi input
  validateCreateCategoryInput(input);

  const name = input.name.trim();

  // Load existing categories
  const categories = getCategories();

  // Cek duplikasi nama (case-insensitive)
  const nameLower = name.toLowerCase();
  const duplicate = categories.find(
    (cat) => cat.name.toLowerCase() === nameLower
  );
  if (duplicate) {
    throw new DuplicateError(`Kategori dengan nama '${name}' sudah ada`);
  }

  // Generate ID dan timestamp
  const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = Date.now();

  // Create category object
  const category: Category = {
    id,
    name,
    color: input.color,
    icon: input.icon,
    createdAt: now,
  };

  // Add to array dan save
  const updatedCategories = [...categories, category];
  save(STORAGE_KEY, updatedCategories);

  return category;
}

/**
 * Update kategori
 * @param input - Data update (harus include id)
 * @returns Category yang sudah diupdate
 * @throws NotFoundError jika kategori tidak ditemukan
 * @throws ValidationError jika data tidak valid
 * @throws DuplicateError jika nama baru sudah digunakan kategori lain
 */
export function updateCategory(input: UpdateCategoryInput): Category {
  const categories = getCategories();
  const index = categories.findIndex((cat) => cat.id === input.id);

  if (index === -1) {
    throw new NotFoundError(`Kategori dengan ID ${input.id} tidak ditemukan`);
  }

  const existing = categories[index];

  // Jika update name, cek duplikasi
  if (input.name !== undefined && input.name.trim() !== existing.name) {
    const newName = input.name.trim();
    validateCategoryName(newName);

    const nameLower = newName.toLowerCase();
    const duplicate = categories.find(
      (cat) => cat.id !== input.id && cat.name.toLowerCase() === nameLower
    );
    if (duplicate) {
      throw new DuplicateError(`Kategori dengan nama '${newName}' sudah ada`);
    }
  }

  // Merge dengan data yang ada
  const updated: Category = {
    ...existing,
    ...(input.name !== undefined && { name: input.name.trim() }),
    ...(input.color !== undefined && { color: input.color }),
    ...(input.icon !== undefined && { icon: input.icon }),
  };

  // Update array dan save
  const updatedCategories = [...categories];
  updatedCategories[index] = updated;

  // Update semua transaksi yang menggunakan kategori ini jika nama berubah
  if (input.name !== undefined && input.name.trim() !== existing.name) {
    updateTransactionsCategoryName(existing.name, updated.name);
  }

  save(STORAGE_KEY, updatedCategories);

  return updated;
}

/**
 * Delete kategori
 * @param id - Category ID
 * @throws NotFoundError jika kategori tidak ditemukan
 * @throws Error jika kategori adalah "Lainnya" (tidak boleh dihapus)
 */
export function deleteCategory(id: string): void {
  const categories = getCategories();
  const index = categories.findIndex((cat) => cat.id === id);

  if (index === -1) {
    throw new NotFoundError(`Kategori dengan ID ${id} tidak ditemukan`);
  }

  const category = categories[index];

  // Jangan hapus kategori "Lainnya"
  if (category.name === DEFAULT_CATEGORY_NAME) {
    throw new Error(`Kategori '${DEFAULT_CATEGORY_NAME}' tidak boleh dihapus`);
  }

  // Pastikan kategori "Lainnya" ada
  let defaultCategory = getCategoryByName(DEFAULT_CATEGORY_NAME);
  if (!defaultCategory) {
    // Jika tidak ada, buat baru
    defaultCategory = addCategory({ name: DEFAULT_CATEGORY_NAME });
  }

  // Update semua transaksi yang menggunakan kategori ini ke "Lainnya"
  updateTransactionsCategoryName(category.name, defaultCategory.name);

  // Remove dari array dan save
  const updatedCategories = categories.filter((cat) => cat.id !== id);
  save(STORAGE_KEY, updatedCategories);
}

/**
 * Helper: Update semua transaksi yang menggunakan kategori lama ke kategori baru
 * @param oldCategoryName - Nama kategori lama
 * @param newCategoryName - Nama kategori baru
 */
function updateTransactionsCategoryName(
  oldCategoryName: string,
  newCategoryName: string
): void {
  const transactions = getTransactions();
  const transactionsToUpdate = transactions.filter(
    (tx) => tx.category === oldCategoryName
  );

  // Update setiap transaksi
  transactionsToUpdate.forEach((tx) => {
    try {
      updateTransaction(
        {
          id: tx.id,
          category: newCategoryName,
        },
        getCategories()
      );
    } catch (error) {
      console.error(`Error updating transaction ${tx.id}:`, error);
      // Continue dengan transaksi lain
    }
  });
}

/**
 * Bulk import categories (untuk restore dari backup)
 * @param categories - Array of categories
 * @param replace - Jika true, replace semua data. Jika false, append
 * @returns Number of imported categories
 * @throws ValidationError jika ada kategori yang tidak valid
 */
export function importCategories(
  categories: Category[],
  replace: boolean = true
): number {
  // Validasi semua kategori
  categories.forEach((cat) => {
    validateCategoryName(cat.name);
  });

  // Pastikan ada kategori "Lainnya"
  const hasDefault = categories.some(
    (cat) => cat.name === DEFAULT_CATEGORY_NAME
  );
  if (!hasDefault) {
    throw new Error(`Harus ada kategori '${DEFAULT_CATEGORY_NAME}'`);
  }

  if (replace) {
    // Replace semua
    save(STORAGE_KEY, categories);
    return categories.length;
  } else {
    // Append (merge dengan existing, skip duplicates by name)
    const existing = getCategories();
    const existingNames = new Set(
      existing.map((cat) => cat.name.toLowerCase())
    );
    const newCategories = categories.filter(
      (cat) => !existingNames.has(cat.name.toLowerCase())
    );
    const merged = [...existing, ...newCategories];
    save(STORAGE_KEY, merged);
    return newCategories.length;
  }
}

