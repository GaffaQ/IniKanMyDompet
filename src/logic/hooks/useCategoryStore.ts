/**
 * Custom hook untuk state management kategori
 * Menggunakan React state dengan LocalStorage persistence
 */

import { useState, useEffect, useCallback } from "react";
import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../types/transactionTypes";
import * as categoryStore from "../categories/categoryStore";

/**
 * Hook untuk mengelola kategori
 * @returns Object dengan state dan functions untuk CRUD operations
 */
export function useCategoryStore() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories dari storage saat mount
  useEffect(() => {
    try {
      // Initialize default categories jika belum ada
      categoryStore.initializeDefaultCategories();
      const loaded = categoryStore.getCategories();
      setCategories(loaded);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat kategori"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add category baru
   */
  const addCategory = useCallback((input: CreateCategoryInput): Category => {
    try {
      setError(null);
      const newCategory = categoryStore.addCategory(input);
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menambah kategori";
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Update category
   */
  const updateCategory = useCallback(
    (input: UpdateCategoryInput): Category => {
      try {
        setError(null);
        const updated = categoryStore.updateCategory(input);
        setCategories((prev) =>
          prev.map((cat) => (cat.id === input.id ? updated : cat))
        );
        return updated;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Gagal mengupdate kategori";
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  /**
   * Delete category
   */
  const deleteCategory = useCallback((id: string): void => {
    try {
      setError(null);
      categoryStore.deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menghapus kategori";
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Get category by ID
   */
  const getCategoryById = useCallback(
    (id: string): Category | null => {
      return categoryStore.getCategoryById(id);
    },
    []
  );

  /**
   * Get category by name
   */
  const getCategoryByName = useCallback(
    (name: string): Category | null => {
      return categoryStore.getCategoryByName(name);
    },
    []
  );

  /**
   * Refresh categories dari storage
   */
  const refresh = useCallback(() => {
    try {
      const loaded = categoryStore.getCategories();
      setCategories(loaded);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat kategori"
      );
    }
  }, []);

  return {
    // State
    categories,
    isLoading,
    error,

    // Actions
    addCategory,
    updateCategory,
    deleteCategory,

    // Utilities
    getCategoryById,
    getCategoryByName,
    refresh,
  };
}

