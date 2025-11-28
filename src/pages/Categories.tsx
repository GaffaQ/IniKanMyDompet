import { useState } from "react";
import {
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Heart,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategoryStore } from "@/logic/hooks/useCategoryStore";
import { useTransactionStore } from "@/logic/hooks/useTransactionStore";
import { toast } from "sonner";

const categoryIcons: Record<string, React.ElementType> = {
  Makanan: Utensils,
  Transport: Car,
  Belanja: ShoppingBag,
  Hiburan: Gamepad2,
  Kesehatan: Heart,
  Lainnya: MoreHorizontal,
};

const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory, isLoading } = useCategoryStore();
  const { transactions } = useTransactionStore(categories);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Get transaction count per category
  const getCategoryCount = (categoryName: string) => {
    return transactions.filter((tx) => tx.category === categoryName).length;
  };

  const handleEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditValue(name);
  };

  const handleSaveEdit = (id: string) => {
    try {
      updateCategory({ id, name: editValue });
      setEditingId(null);
      setEditValue("");
      toast.success("Kategori berhasil diupdate");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengupdate kategori");
    }
  };

  const handleDelete = (id: string) => {
    const category = categories.find((cat) => cat.id === id);
    if (!category) return;

    if (category.name === "Lainnya") {
      toast.error("Kategori 'Lainnya' tidak boleh dihapus");
      return;
    }

    if (confirm(`Yakin ingin menghapus kategori "${category.name}"? Transaksi yang menggunakan kategori ini akan dipindah ke "Lainnya".`)) {
      try {
        deleteCategory(id);
        toast.success("Kategori berhasil dihapus");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal menghapus kategori");
      }
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error("Nama kategori harus diisi");
      return;
    }

    try {
      addCategory({ name: newCategory.trim() });
      setNewCategory("");
      setIsAdding(false);
      toast.success("Kategori berhasil ditambahkan");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menambah kategori");
    }
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Kategori</h1>
          <p className="text-muted-foreground">
            Kelola kategori transaksi Anda.
          </p>
        </div>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            className="gradient-primary text-primary-foreground shadow-glow"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tambah Kategori
          </Button>
        )}
      </div>

      {/* Add New Category */}
      {isAdding && (
        <div className="glass rounded-2xl p-6 mb-6 animate-scale-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Tambah Kategori Baru
          </h3>
          <div className="flex gap-3">
            <Input
              placeholder="Nama kategori..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 h-12 bg-secondary border-0"
              autoFocus
            />
            <Button
              onClick={handleAddCategory}
              className="h-12 px-6 gradient-accent text-accent-foreground"
            >
              <Check className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setNewCategory("");
              }}
              className="h-12 px-6"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-12 text-center">
            <p className="text-muted-foreground">Memuat kategori...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full p-12 text-center">
            <p className="text-muted-foreground">Belum ada kategori</p>
          </div>
        ) : (
          categories.map((category, index) => {
            const Icon = categoryIcons[category.name] || MoreHorizontal;
            const isEditing = editingId === category.id;
            const count = getCategoryCount(category.name);

          return (
            <div
              key={category.id}
              className="glass rounded-2xl p-6 animate-slide-up hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: category.color ? `${category.color}20` : "hsl(var(--secondary))" }}
                >
                  <Icon
                    className="w-7 h-7"
                    style={{ color: category.color || "hsl(var(--foreground))" }}
                  />
                </div>
                <div className="flex gap-1">
                  {!isEditing && (
                    <>
                      {category.name !== "Lainnya" && (
                        <>
                          <button
                            onClick={() => handleEdit(category.id, category.name)}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-10 bg-secondary border-0"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(category.id)}
                    className="p-2 rounded-lg bg-accent text-accent-foreground"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditValue("");
                    }}
                    className="p-2 rounded-lg bg-secondary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {count} transaksi
                  </p>
                </>
              )}
            </div>
          );
        })
        )}
      </div>
    </MainLayout>
  );
};

export default Categories;
