import { useState } from "react";
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Heart,
  MoreHorizontal,
  ChevronDown,
  Trash2,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout/MainLayout";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { Input } from "@/components/ui/input";
import { useTransactionStore } from "@/logic/hooks/useTransactionStore";
import { useCategoryStore } from "@/logic/hooks/useCategoryStore";
import { TransactionFilter } from "@/logic/types/transactionTypes";
import { toast } from "sonner";

const categoryIcons: Record<string, React.ElementType> = {
  Makanan: Utensils,
  Transport: Car,
  Belanja: ShoppingBag,
  Hiburan: Gamepad2,
  Kesehatan: Heart,
  Lainnya: MoreHorizontal,
};

const Transactions = () => {
  const { categories } = useCategoryStore();
  const { transactions, getFilteredTransactions, deleteTransaction, isLoading } = useTransactionStore(categories);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const filter: TransactionFilter = {
    searchQuery: searchQuery || undefined,
    type: selectedType === "all" ? undefined : selectedType,
    category: selectedCategory === "all" ? undefined : selectedCategory,
  };

  const filteredTransactions = getFilteredTransactions(filter, "date-desc");

  const handleEdit = (id: string) => {
    setEditingTransactionId(id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus transaksi ini?")) {
      try {
        deleteTransaction(id);
        toast.success("Transaksi berhasil dihapus");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal menghapus transaksi");
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransactionId(undefined);
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Transaksi</h1>
        <p className="text-muted-foreground">
          Lihat dan kelola semua transaksi Anda.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="glass rounded-2xl p-4 mb-6 animate-slide-up">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-secondary border-0"
            />
          </div>

          {/* Type Filter */}
          <div className="flex rounded-xl bg-secondary p-1">
            {["all", "income", "expense"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as typeof selectedType)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  selectedType === type
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {type === "all" ? "Semua" : type === "income" ? "Pemasukan" : "Pengeluaran"}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-12 px-4 pr-10 rounded-xl bg-secondary border-0 text-foreground appearance-none cursor-pointer focus:ring-2 focus:ring-primary"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="glass rounded-2xl divide-y divide-border/50 animate-slide-up" style={{ animationDelay: "100ms" }}>
        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Memuat transaksi...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Tidak ada transaksi yang ditemukan.</p>
          </div>
        ) : (
          filteredTransactions.map((tx, index) => {
            const Icon = categoryIcons[tx.category] || MoreHorizontal;
            const isIncome = tx.type === "income";

            return (
              <div
                key={tx.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0",
                      isIncome ? "bg-accent/20" : "bg-primary/20"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", isIncome ? "text-accent" : "text-primary")} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{tx.name}</p>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-secondary truncate max-w-[80px] sm:max-w-none">{tx.category}</span>
                      <span>•</span>
                      <span className="whitespace-nowrap">{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-13 sm:pl-0 justify-end sm:justify-start">
                  {isIncome ? (
                    <TrendingUp className="w-4 h-4 text-accent shrink-0" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive shrink-0" />
                  )}
                  <span className={cn("font-semibold text-base sm:text-lg whitespace-nowrap", isIncome ? "text-accent" : "text-destructive")}>
                    {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(tx.id)}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <FloatingActionButton onClick={() => setIsModalOpen(true)} />
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        editingTransactionId={editingTransactionId}
      />
    </MainLayout>
  );
};

export default Transactions;
