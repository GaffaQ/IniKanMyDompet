/**
 * IndexedDB Abstraction Layer (Optional)
 * 
 * IndexedDB dipilih sebagai alternatif jika:
 * 1. Perlu menyimpan data lebih besar dari 5-10MB
 * 2. Perlu query yang lebih kompleks
 * 3. Perlu indexing untuk performa lebih baik
 * 
 * Namun untuk aplikasi Budget Tracker sederhana, LocalStorage sudah cukup.
 * IndexedDB bisa digunakan sebagai fallback jika LocalStorage penuh atau diblokir.
 * 
 * Catatan: File ini dibuat sebagai optional enhancement.
 * Default implementation tetap menggunakan LocalStorage.
 */

const DB_NAME = "DompetKuDB";
const DB_VERSION = 1;
const STORE_TRANSACTIONS = "transactions";
const STORE_CATEGORIES = "categories";

let db: IDBDatabase | null = null;

/**
 * Open atau create database
 */
export async function openDatabase(): Promise<IDBDatabase> {
  if (db) {
    return db;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Gagal membuka IndexedDB"));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object stores jika belum ada
      if (!database.objectStoreNames.contains(STORE_TRANSACTIONS)) {
        const txStore = database.createObjectStore(STORE_TRANSACTIONS, {
          keyPath: "id",
        });
        txStore.createIndex("date", "date", { unique: false });
        txStore.createIndex("type", "type", { unique: false });
        txStore.createIndex("category", "category", { unique: false });
      }

      if (!database.objectStoreNames.contains(STORE_CATEGORIES)) {
        const catStore = database.createObjectStore(STORE_CATEGORIES, {
          keyPath: "id",
        });
        catStore.createIndex("name", "name", { unique: true });
      }
    };
  });
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Add item ke object store
 */
export async function addItem<T extends { id: string }>(
  storeName: string,
  item: T
): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Gagal menambah item ke ${storeName}`));
  });
}

/**
 * Update item di object store
 */
export async function updateItem<T extends { id: string }>(
  storeName: string,
  item: T
): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Gagal mengupdate item di ${storeName}`));
  });
}

/**
 * Get item by ID
 */
export async function getItem<T extends { id: string }>(
  storeName: string,
  id: string
): Promise<T | null> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(new Error(`Gagal mengambil item dari ${storeName}`));
  });
}

/**
 * Get all items dari object store
 */
export async function getAllItems<T extends { id: string }>(
  storeName: string
): Promise<T[]> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error(`Gagal mengambil semua item dari ${storeName}`));
  });
}

/**
 * Delete item by ID
 */
export async function deleteItem(
  storeName: string,
  id: string
): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Gagal menghapus item dari ${storeName}`));
  });
}

/**
 * Clear all items dari object store
 */
export async function clearStore(storeName: string): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Gagal menghapus semua item dari ${storeName}`));
  });
}

/**
 * Check if IndexedDB is available
 */
export function isIndexedDBAvailable(): boolean {
  return typeof indexedDB !== "undefined" && indexedDB !== null;
}

/**
 * Get transactions store name
 */
export function getTransactionsStoreName(): string {
  return STORE_TRANSACTIONS;
}

/**
 * Get categories store name
 */
export function getCategoriesStoreName(): string {
  return STORE_CATEGORIES;
}

