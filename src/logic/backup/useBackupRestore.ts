/**
 * Export/Import JSON untuk backup dan restore data
 */

import { ExportData, Transaction, Category } from "../types/transactionTypes";
import { ValidationError } from "../types/transactionTypes";
import { validateTransaction, validateCategoryName } from "../utils/validation";
import { load } from "../storage/localStorageClient";
import { importTransactions, getTransactions } from "../transactions/transactionStore";
import { importCategories, getCategories } from "../categories/categoryStore";

const EXPORT_VERSION = "1.0.0";
const STORAGE_KEY_TRANSACTIONS = "transactions";
const STORAGE_KEY_CATEGORIES = "categories";

/**
 * Export semua data ke JSON
 * @returns JSON string yang siap untuk di-download
 */
export function exportToJSON(): string {
  const transactions = getTransactions();
  const categories = getCategories();

  const exportData: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    transactions,
    categories,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export data ke file (trigger download)
 * @param filename - Nama file (default: "dompetku-backup.json")
 */
export function exportToFile(filename: string = "dompetku-backup.json"): void {
  try {
    const json = exportToJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(
      `Gagal mengekspor data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Validate export data structure
 * @param data - Data yang akan divalidasi
 * @throws ValidationError jika struktur tidak valid
 */
function validateExportData(data: unknown): asserts data is ExportData {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Data export tidak valid: harus berupa object");
  }

  const exportData = data as Partial<ExportData>;

  // Check version
  if (!exportData.version || typeof exportData.version !== "string") {
    throw new ValidationError("Data export tidak valid: 'version' tidak ditemukan atau tidak valid");
  }

  // Check exportedAt
  if (
    !exportData.exportedAt ||
    typeof exportData.exportedAt !== "number" ||
    exportData.exportedAt <= 0
  ) {
    throw new ValidationError("Data export tidak valid: 'exportedAt' tidak ditemukan atau tidak valid");
  }

  // Check transactions
  if (!Array.isArray(exportData.transactions)) {
    throw new ValidationError("Data export tidak valid: 'transactions' harus berupa array");
  }

  // Check categories
  if (!Array.isArray(exportData.categories)) {
    throw new ValidationError("Data export tidak valid: 'categories' harus berupa array");
  }
}

/**
 * Import data dari JSON string
 * @param jsonString - JSON string dari file backup
 * @param replace - Jika true, replace semua data. Jika false, merge dengan data existing
 * @returns Object dengan jumlah data yang diimport
 * @throws ValidationError jika data tidak valid
 */
export function importFromJSON(
  jsonString: string,
  replace: boolean = true
): { transactionsCount: number; categoriesCount: number } {
  try {
    // Parse JSON
    const data = JSON.parse(jsonString);

    // Validate structure
    validateExportData(data);

    // Validate all transactions
    const transactions = data.transactions as Transaction[];
    transactions.forEach((tx, index) => {
      try {
        // Basic validation
        if (!tx.id || !tx.name || !tx.amount || !tx.type || !tx.category || !tx.date) {
          throw new ValidationError(
            `Transaction di index ${index} tidak lengkap`
          );
        }
      } catch (error) {
        throw new ValidationError(
          `Error validasi transaction di index ${index}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    });

    // Validate all categories
    const categories = data.categories as Category[];
    categories.forEach((cat, index) => {
      try {
        validateCategoryName(cat.name);
        if (!cat.id) {
          throw new ValidationError(`Category di index ${index} tidak memiliki ID`);
        }
      } catch (error) {
        throw new ValidationError(
          `Error validasi category di index ${index}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    });

    // Pastikan ada kategori "Lainnya"
    const hasDefaultCategory = categories.some((cat) => cat.name === "Lainnya");
    if (!hasDefaultCategory) {
      throw new ValidationError("Data harus memiliki kategori 'Lainnya'");
    }

    // Import categories first (karena transactions butuh valid categories)
    const categoriesCount = importCategories(categories, replace);

    // Validate transactions dengan categories yang sudah diimport
    const importedCategories = getCategories();
    transactions.forEach((tx) => {
      validateTransaction(tx, importedCategories);
    });

    // Import transactions
    const transactionsCount = importTransactions(transactions, importedCategories, replace);

    return { transactionsCount, categoriesCount };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new ValidationError("Format JSON tidak valid");
    }
    throw new Error(
      `Gagal mengimpor data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Import data dari file (File object)
 * @param file - File object dari input file
 * @param replace - Jika true, replace semua data. Jika false, merge dengan data existing
 * @returns Promise dengan jumlah data yang diimport
 * @throws ValidationError jika data tidak valid
 */
export async function importFromFile(
  file: File,
  replace: boolean = true
): Promise<{ transactionsCount: number; categoriesCount: number }> {
  try {
    const text = await file.text();
    return importFromJSON(text, replace);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new Error(
      `Gagal membaca file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}


