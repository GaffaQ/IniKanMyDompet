/**
 * LocalStorage Wrapper dengan error handling yang aman
 * 
 * LocalStorage dipilih karena:
 * 1. Lebih sederhana dan mudah digunakan
 * 2. Cukup untuk aplikasi client-side dengan data tidak terlalu besar
 * 3. Support di semua browser modern
 * 4. Synchronous API yang lebih mudah untuk logic
 * 5. IndexedDB bisa ditambahkan sebagai fallback jika diperlukan
 * 
 * Catatan: LocalStorage memiliki limit ~5-10MB per domain
 */

const STORAGE_PREFIX = "dompetku_";

/**
 * Generate key dengan prefix
 */
function getKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

/**
 * Cek apakah LocalStorage tersedia dan bisa digunakan
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Simpan data ke LocalStorage
 * @param key - Key untuk menyimpan data
 * @param value - Data yang akan disimpan (akan di-serialize ke JSON)
 * @throws Error jika LocalStorage tidak tersedia atau penuh
 */
export function save(key: string, value: unknown): void {
  if (!isLocalStorageAvailable()) {
    throw new Error("LocalStorage tidak tersedia atau diblokir. Pastikan browser mendukung LocalStorage.");
  }
  
  try {
    const serialized = JSON.stringify(value);
    const storageKey = getKey(key);
    localStorage.setItem(storageKey, serialized);
  } catch (error) {
    if (error instanceof DOMException && error.code === 22) {
      // QuotaExceededError
      throw new Error("LocalStorage penuh. Silakan hapus data lama atau gunakan fitur export untuk backup.");
    }
    throw new Error(`Gagal menyimpan data ke LocalStorage: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Load data dari LocalStorage
 * @param key - Key untuk mengambil data
 * @returns Data yang di-deserialize dari JSON, atau null jika tidak ada
 * @throws Error jika LocalStorage tidak tersedia atau data corrupt
 */
export function load<T>(key: string): T | null {
  if (!isLocalStorageAvailable()) {
    console.warn("LocalStorage tidak tersedia, mengembalikan null");
    return null;
  }
  
  try {
    const storageKey = getKey(key);
    const item = localStorage.getItem(storageKey);
    
    if (item === null) {
      return null;
    }
    
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error loading data from LocalStorage (key: ${key}):`, error);
    // Jika data corrupt, hapus dan return null
    try {
      const storageKey = getKey(key);
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
    throw new Error(`Data corrupt atau tidak valid. Data untuk key '${key}' telah dihapus.`);
  }
}

/**
 * Cek apakah key ada di LocalStorage
 * @param key - Key yang akan dicek
 * @returns true jika key ada, false jika tidak
 */
export function exists(key: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  
  try {
    const storageKey = getKey(key);
    return localStorage.getItem(storageKey) !== null;
  } catch {
    return false;
  }
}

/**
 * Hapus data dari LocalStorage
 * @param key - Key yang akan dihapus
 * @throws Error jika LocalStorage tidak tersedia
 */
export function remove(key: string): void {
  if (!isLocalStorageAvailable()) {
    throw new Error("LocalStorage tidak tersedia");
  }
  
  try {
    const storageKey = getKey(key);
    localStorage.removeItem(storageKey);
  } catch (error) {
    throw new Error(`Gagal menghapus data dari LocalStorage: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Hapus semua data aplikasi dari LocalStorage
 * @throws Error jika LocalStorage tidak tersedia
 */
export function clearAll(): void {
  if (!isLocalStorageAvailable()) {
    throw new Error("LocalStorage tidak tersedia");
  }
  
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    throw new Error(`Gagal menghapus semua data: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Get semua keys yang dimiliki aplikasi
 * @returns Array of keys (tanpa prefix)
 */
export function getAllKeys(): string[] {
  if (!isLocalStorageAvailable()) {
    return [];
  }
  
  try {
    const keys = Object.keys(localStorage);
    return keys
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .map((key) => key.replace(STORAGE_PREFIX, ""));
  } catch {
    return [];
  }
}

/**
 * Get ukuran data yang digunakan (estimasi dalam bytes)
 */
export function getStorageSize(): number {
  if (!isLocalStorageAvailable()) {
    return 0;
  }
  
  try {
    let total = 0;
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          total += key.length + value.length;
        }
      }
    });
    return total;
  } catch {
    return 0;
  }
}

