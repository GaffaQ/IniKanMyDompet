import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Wallet, Target, AlertTriangle, X } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { ExpenseCategoryChart } from "@/components/dashboard/ExpenseCategoryChart";
import { DailyExpenseChart } from "@/components/dashboard/DailyExpenseChart";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { useTransactionStore } from "@/logic/hooks/useTransactionStore";
import { useCategoryStore } from "@/logic/hooks/useCategoryStore";
import { useSavingsTarget } from "@/logic/hooks/useSavingsTarget";
import { getMonthlyAggregation } from "@/logic/stats/useStats";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dismissedAlert, setDismissedAlert] = useState(false);
  const { categories } = useCategoryStore();
  const { transactions, getStats, isLoading } = useTransactionStore(categories);
  const { target, calculateTarget, hasReachedTarget, getTargetDifference } = useSavingsTarget();
  const stats = getStats();

  // Get current month income
  const currentMonth = useMemo(() => new Date().toISOString().substring(0, 7), []);
  const { monthlyIncome } = getMonthlyAggregation(transactions);
  const currentMonthIncome = monthlyIncome[currentMonth] || 0;
  const savingsTargetAmount = calculateTarget(currentMonthIncome);
  const hasReached = hasReachedTarget(stats.balance, currentMonthIncome);
  const targetDifference = getTargetDifference(stats.balance, currentMonthIncome);
  const showAlert = target && !hasReached && !dismissedAlert && currentMonthIncome > 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali! Berikut ringkasan keuangan Anda.
        </p>
      </div>

      {/* Savings Target Alert */}
      {showAlert && (
        <div className="mb-6 glass rounded-2xl p-4 border-l-4 border-destructive animate-slide-up">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1">Target Menabung Belum Tercapai</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Saldo Anda saat ini <span className="font-semibold text-destructive">{formatCurrency(stats.balance)}</span>, kurang <span className="font-semibold text-destructive">{formatCurrency(Math.abs(targetDifference))}</span> dari target menabung bulan ini sebesar <span className="font-semibold text-foreground">{formatCurrency(savingsTargetAmount)}</span>.
              </p>
              <p className="text-xs text-muted-foreground">
                Target menabung: {target.percentage}% dari pemasukan bulan ini ({formatCurrency(currentMonthIncome)})
              </p>
            </div>
            <button
              onClick={() => setDismissedAlert(true)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Savings Target Info Card */}
      {target && currentMonthIncome > 0 && (
        <div className="mb-6 glass rounded-2xl p-5 border border-accent/20 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Menabung Bulan Ini</p>
                <p className={cn(
                  "text-2xl font-bold",
                  hasReached ? "text-accent" : "text-foreground"
                )}>
                  {formatCurrency(savingsTargetAmount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {target.percentage}% dari pemasukan ({formatCurrency(currentMonthIncome)})
                </p>
              </div>
            </div>
            {hasReached ? (
              <div className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm font-medium text-accent">✓ Target Tercapai</p>
              </div>
            ) : (
              <div className="px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm font-medium text-destructive">
                  Kurang {formatCurrency(Math.abs(targetDifference))}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard
          title="Total Pemasukan"
          value={formatCurrency(stats.totalIncome)}
          icon={TrendingUp}
          variant="income"
          delay={0}
        />
        <SummaryCard
          title="Total Pengeluaran"
          value={formatCurrency(stats.totalExpense)}
          icon={TrendingDown}
          variant="expense"
          delay={100}
        />
        <SummaryCard
          title="Sisa Anggaran"
          value={formatCurrency(stats.balance)}
          icon={Wallet}
          variant="balance"
          delay={200}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ExpenseCategoryChart transactions={transactions} categories={categories} />
        <DailyExpenseChart transactions={transactions} />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionList transactions={transactions} />
        <IncomeExpenseChart transactions={transactions} />
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setIsModalOpen(true)} />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </MainLayout>
  );
};

export default Index;
