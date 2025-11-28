import { useState, useMemo } from "react";
import {
  Search,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Heart,
  MoreHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/logic/hooks/useTransactionStore";
import { useCategoryStore } from "@/logic/hooks/useCategoryStore";
import { TransactionFilter } from "@/logic/types/transactionTypes";
import { getDateRangePreset } from "@/logic/utils/transactionUtils";

const categoryIcons: Record<string, React.ElementType> = {
  Makanan: Utensils,
  Transport: Car,
  Belanja: ShoppingBag,
  Hiburan: Gamepad2,
  Kesehatan: Heart,
  Lainnya: MoreHorizontal,
};

const dateFilters = [
  { id: "all", label: "Semua" },
  { id: "today", label: "Hari Ini" },
  { id: "week", label: "Minggu Ini" },
  { id: "month", label: "Bulan Ini" },
  { id: "custom", label: "Custom" },
];

const SearchFilter = () => {
  const { categories } = useCategoryStore();
  const { transactions, getFilteredTransactions, isLoading } = useTransactionStore(categories);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedCategories([]);
    setSelectedDateFilter("all");
    setStartDate("");
    setEndDate("");
  };

  // Calculate date range based on selected filter
  const dateRange = useMemo(() => {
    if (selectedDateFilter === "custom") {
      return {
        from: startDate || undefined,
        to: endDate || undefined,
      };
    } else if (selectedDateFilter === "all") {
      return { from: undefined, to: undefined };
    } else {
      return getDateRangePreset(selectedDateFilter as "today" | "week" | "month");
    }
  }, [selectedDateFilter, startDate, endDate]);

  // Build filter object
  const filter: TransactionFilter = useMemo(() => {
    const baseFilter: TransactionFilter = {
      searchQuery: searchQuery || undefined,
      type: selectedType === "all" ? undefined : selectedType,
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
    };

    // If specific categories selected, filter by first one (since filter only supports single category)
    // For multiple categories, we'll filter manually
    if (selectedCategories.length === 1) {
      baseFilter.category = selectedCategories[0];
    }

    return baseFilter;
  }, [searchQuery, selectedType, selectedCategories, dateRange]);

  // Get filtered transactions
  let filteredTransactions = getFilteredTransactions(filter, "date-desc");

  // Apply multiple category filter if more than one selected
  if (selectedCategories.length > 1) {
    filteredTransactions = filteredTransactions.filter((tx) =>
      selectedCategories.includes(tx.category)
    );
  }

  const hasActiveFilters = searchQuery || selectedType !== "all" || selectedCategories.length > 0 || selectedDateFilter !== "all";

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Filter & Search</h1>
        <p className="text-muted-foreground">
          Cari dan filter transaksi dengan mudah.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <div className="glass rounded-2xl p-5 animate-slide-up">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Pencarian
            </h3>
            <Input
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 bg-secondary border-0"
            />
          </div>

          {/* Date Filter */}
          <div className="glass rounded-2xl p-5 animate-slide-up" style={{ animationDelay: "50ms" }}>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Periode
            </h3>
            <div className="space-y-2">
              {dateFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    setSelectedDateFilter(filter.id);
                    if (filter.id !== "custom") {
                      setStartDate("");
                      setEndDate("");
                    }
                  }}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    selectedDateFilter === filter.id
                      ? "gradient-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            {selectedDateFilter === "custom" && (
              <div className="mt-3 space-y-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 bg-secondary border-0"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 bg-secondary border-0"
                />
              </div>
            )}
          </div>

          {/* Type Filter */}
          <div className="glass rounded-2xl p-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Jenis
            </h3>
            <div className="space-y-2">
              {[
                { id: "all", label: "Semua", color: "bg-secondary" },
                { id: "income", label: "Pemasukan", color: "bg-accent" },
                { id: "expense", label: "Pengeluaran", color: "bg-destructive" },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id as typeof selectedType)}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl text-left font-medium transition-all flex items-center gap-3",
                    selectedType === type.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className={cn("w-3 h-3 rounded-full", type.color)} />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="glass rounded-2xl p-5 animate-slide-up" style={{ animationDelay: "150ms" }}>
            <h3 className="font-semibold text-foreground mb-3">Kategori</h3>
            <div className="space-y-2">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.name] || MoreHorizontal;
                const isSelected = selectedCategories.includes(cat.name);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.name)}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl text-left font-medium transition-all flex items-center gap-3",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Hapus Filter
            </Button>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="glass rounded-2xl p-4 mb-4 animate-slide-up">
            <p className="text-muted-foreground">
              Menampilkan <span className="font-semibold text-foreground">{filteredTransactions.length}</span> transaksi
            </p>
          </div>

          <div className="glass rounded-2xl divide-y divide-border/50 animate-slide-up" style={{ animationDelay: "100ms" }}>
            {isLoading ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">Memuat transaksi...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Tidak ada transaksi yang sesuai filter.</p>
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const Icon = categoryIcons[tx.category] || MoreHorizontal;
                const isIncome = tx.type === "income";

                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 p-5 hover:bg-secondary/50 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        isIncome ? "bg-accent/20" : "bg-primary/20"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isIncome ? "text-accent" : "text-primary")} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{tx.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-md bg-secondary">{tx.category}</span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isIncome ? (
                        <TrendingUp className="w-4 h-4 text-accent" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      )}
                      <span className={cn("font-semibold text-lg", isIncome ? "text-accent" : "text-destructive")}>
                        {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchFilter;
