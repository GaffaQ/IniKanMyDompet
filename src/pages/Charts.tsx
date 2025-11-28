import { MainLayout } from "@/components/layout/MainLayout";
import { ExpenseCategoryChart } from "@/components/dashboard/ExpenseCategoryChart";
import { DailyExpenseChart } from "@/components/dashboard/DailyExpenseChart";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useTransactionStore } from "@/logic/hooks/useTransactionStore";
import { useCategoryStore } from "@/logic/hooks/useCategoryStore";

const Charts = () => {
  const { categories } = useCategoryStore();
  const { transactions, isLoading } = useTransactionStore(categories);

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Grafik Visual</h1>
        <p className="text-muted-foreground">
          Visualisasi lengkap keuangan Anda dalam berbagai grafik.
        </p>
      </div>

      {/* Chart Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-2xl p-6 animate-slide-up">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
            <PieChart className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Kategori</h3>
          <p className="text-sm text-muted-foreground">
            Lihat distribusi pengeluaran per kategori
          </p>
        </div>

        <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "50ms" }}>
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Harian</h3>
          <p className="text-sm text-muted-foreground">
            Tren pengeluaran harian Anda
          </p>
        </div>

        <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-warning" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Perbandingan</h3>
          <p className="text-sm text-muted-foreground">
            Income vs Expense bulanan
          </p>
        </div>
      </div>

      {/* Expense by Category */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <PieChart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Pengeluaran per Kategori</h2>
            <p className="text-sm text-muted-foreground">
              Kategori mana yang paling banyak menyedot uang
            </p>
          </div>
        </div>
        {isLoading ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        ) : (
          <ExpenseCategoryChart transactions={transactions} categories={categories} />
        )}
      </div>

      {/* Daily Expenses */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Pengeluaran Harian</h2>
            <p className="text-sm text-muted-foreground">
              Tren pengeluaran per hari dalam seminggu
            </p>
          </div>
        </div>
        {isLoading ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        ) : (
          <DailyExpenseChart transactions={transactions} />
        )}
      </div>

      {/* Income vs Expense */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-warning flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-warning-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Pemasukan vs Pengeluaran</h2>
            <p className="text-sm text-muted-foreground">
              Perbandingan bulanan pemasukan dan pengeluaran
            </p>
          </div>
        </div>
        {isLoading ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        ) : (
          <IncomeExpenseChart transactions={transactions} />
        )}
      </div>
    </MainLayout>
  );
};

export default Charts;
