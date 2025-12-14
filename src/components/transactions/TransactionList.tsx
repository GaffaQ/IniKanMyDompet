import { cn } from "@/lib/utils";
import {
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Heart,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Transaction } from "@/logic/types/transactionTypes";
import { filterAndSortTransactions } from "@/logic/utils/transactionUtils";

const categoryIcons: Record<string, React.ElementType> = {
  Makanan: Utensils,
  Transport: Car,
  Belanja: ShoppingBag,
  Hiburan: Gamepad2,
  Kesehatan: Heart,
  Lainnya: MoreHorizontal,
};

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  // Get last 5 transactions
  const recentTransactions = filterAndSortTransactions(transactions, {}, "date-desc").slice(0, 5);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Transaksi Terbaru
        </h3>
        <a
          href="https://inikanmydompet.vercel.app/transactions"
          className="text-sm text-primary hover:underline font-medium"
        >
          Lihat Semua
        </a>
      </div>

      <div className="space-y-3">
        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Belum ada transaksi
          </div>
        ) : (
          recentTransactions.map((tx, index) => {
          const Icon = categoryIcons[tx.category] || MoreHorizontal;
          const isIncome = tx.type === "income";

          return (
            <div
              key={tx.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl transition-all duration-200",
                "bg-secondary/50 hover:bg-secondary"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  isIncome ? "bg-accent/20" : "bg-primary/20"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isIncome ? "text-accent" : "text-primary"
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {tx.name}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{tx.category}</span>
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
                <span
                  className={cn(
                    "font-semibold",
                    isIncome ? "text-accent" : "text-destructive"
                  )}
                >
                  {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                </span>
              </div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}
