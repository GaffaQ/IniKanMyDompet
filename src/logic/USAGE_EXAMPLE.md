# Contoh Penggunaan Logic

File ini berisi contoh cara menggunakan logic yang sudah dibuat dengan UI yang sudah ada.

## 1. Menggunakan Hooks di Komponen

### Contoh: Menggunakan useTransactionStore dan useCategoryStore

```typescript
import { useTransactionStore } from "@/logic/hooks/useTransactionStore";
import { useCategoryStore } from "@/logic/hooks/useCategoryStore";
import { TransactionFilter } from "@/logic/types/transactionTypes";

function TransactionsPage() {
  // Load categories
  const { categories, isLoading: categoriesLoading } = useCategoryStore();
  
  // Load transactions
  const {
    transactions,
    isLoading: transactionsLoading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getFilteredTransactions,
    getStats,
  } = useTransactionStore(categories);

  // Filter state
  const [filter, setFilter] = useState<TransactionFilter>({
    searchQuery: "",
    type: "all",
    category: "all",
  });

  // Get filtered transactions
  const filteredTransactions = getFilteredTransactions(filter, "date-desc");

  // Get stats
  const stats = getStats();

  // Handle add transaction
  const handleAddTransaction = (input: CreateTransactionInput) => {
    try {
      addTransaction(input);
      // Show success toast
    } catch (error) {
      // Show error toast
      console.error(error);
    }
  };

  return (
    <div>
      {/* Your UI here */}
    </div>
  );
}
```

## 2. Menggunakan Transaction Modal

```typescript
import { useState } from "react";
import { useTransactionStore } from "@/logic/hooks/useTransactionStore";
import { useCategoryStore } from "@/logic/hooks/useCategoryStore";
import { CreateTransactionInput } from "@/logic/types/transactionTypes";

function TransactionModal({ isOpen, onClose }) {
  const { categories } = useCategoryStore();
  const { addTransaction } = useTransactionStore(categories);

  const [formData, setFormData] = useState<CreateTransactionInput>({
    name: "",
    amount: 0,
    type: "expense",
    category: categories[0]?.name || "Lainnya",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const handleSubmit = () => {
    try {
      addTransaction(formData);
      onClose();
      // Reset form
    } catch (error) {
      // Show error
      alert(error.message);
    }
  };

  return (
    // Your modal UI
  );
}
```

## 3. Menggunakan Stats di Dashboard

```typescript
import { useTransactionStore } from "@/logic/hooks/useTransactionStore";
import { useCategoryStore } from "@/logic/hooks/useCategoryStore";

function Dashboard() {
  const { categories } = useCategoryStore();
  const { transactions, getStats } = useTransactionStore(categories);

  const stats = getStats();

  return (
    <div>
      <SummaryCard
        title="Total Pemasukan"
        value={formatCurrency(stats.totalIncome)}
      />
      <SummaryCard
        title="Total Pengeluaran"
        value={formatCurrency(stats.totalExpense)}
      />
      <SummaryCard
        title="Sisa Anggaran"
        value={formatCurrency(stats.balance)}
      />
      
      {/* Charts menggunakan stats.expenseByCategory, stats.dailyExpenses, dll */}
    </div>
  );
}
```

## 4. Export/Import Data

```typescript
import { exportToFile, importFromFile } from "@/logic/backup/useBackupRestore";

function SettingsPage() {
  const handleExport = () => {
    try {
      exportToFile("dompetku-backup.json");
      alert("Data berhasil diekspor!");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await importFromFile(file, true);
      alert(
        `Import berhasil! ${result.transactionsCount} transaksi, ${result.categoriesCount} kategori.`
      );
      // Refresh page atau reload data
      window.location.reload();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <button onClick={handleExport}>Export Data</button>
      <input type="file" accept=".json" onChange={handleImport} />
    </div>
  );
}
```

## 5. Filter dan Search

```typescript
import { useTransactionStore } from "@/logic/hooks/useTransactionStore";
import { useCategoryStore } from "@/logic/hooks/useCategoryStore";
import { TransactionFilter } from "@/logic/types/transactionTypes";

function TransactionsPage() {
  const { categories } = useCategoryStore();
  const { getFilteredTransactions } = useTransactionStore(categories);

  const [filter, setFilter] = useState<TransactionFilter>({
    searchQuery: "",
    type: "all",
    category: "all",
  });

  const filteredTransactions = getFilteredTransactions(filter, "date-desc");

  return (
    <div>
      <input
        value={filter.searchQuery}
        onChange={(e) =>
          setFilter({ ...filter, searchQuery: e.target.value })
        }
        placeholder="Cari transaksi..."
      />
      
      <select
        value={filter.type}
        onChange={(e) =>
          setFilter({ ...filter, type: e.target.value as any })
        }
      >
        <option value="all">Semua</option>
        <option value="income">Pemasukan</option>
        <option value="expense">Pengeluaran</option>
      </select>

      {/* Render filteredTransactions */}
    </div>
  );
}
```

## 6. Menggunakan Category Store

```typescript
import { useCategoryStore } from "@/logic/hooks/useCategoryStore";

function CategoriesPage() {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    error,
  } = useCategoryStore();

  const handleAddCategory = (name: string) => {
    try {
      addCategory({ name });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Yakin ingin menghapus kategori ini?")) {
      try {
        deleteCategory(id);
        // Transaksi yang menggunakan kategori ini otomatis dipindah ke "Lainnya"
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <div>
      {categories.map((cat) => (
        <div key={cat.id}>
          {cat.name}
          <button onClick={() => handleDeleteCategory(cat.id)}>Hapus</button>
        </div>
      ))}
    </div>
  );
}
```

## Catatan Penting

1. **Selalu load categories terlebih dahulu** sebelum menggunakan `useTransactionStore`, karena validasi transaksi membutuhkan daftar kategori.

2. **Error handling**: Semua fungsi CRUD dapat throw error. Selalu wrap dengan try-catch atau handle error di UI.

3. **LocalStorage**: Data otomatis tersimpan ke LocalStorage. Tidak perlu manual save.

4. **Default Categories**: Kategori default akan otomatis dibuat saat pertama kali aplikasi dijalankan.

5. **Kategori "Lainnya"**: Kategori ini tidak boleh dihapus dan akan otomatis dibuat jika tidak ada.

