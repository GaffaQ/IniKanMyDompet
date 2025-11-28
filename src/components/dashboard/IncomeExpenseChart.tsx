import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Transaction } from "@/logic/types/transactionTypes";
import { getMonthlyAggregation } from "@/logic/stats/useStats";

interface IncomeExpenseChartProps {
  transactions: Transaction[];
}

export function IncomeExpenseChart({ transactions }: IncomeExpenseChartProps) {
  const { monthlyIncome, monthlyExpense } = getMonthlyAggregation(transactions);
  
  // Get last 6 months
  const today = new Date();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(today);
    date.setMonth(date.getMonth() - (5 - i));
    return date;
  });

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  
  const data = last6Months.map((date) => {
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthName = monthNames[date.getMonth()];
    return {
      month: monthName,
      income: monthlyIncome[monthKey] || 0,
      expense: monthlyExpense[monthKey] || 0,
    };
  });
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "400ms" }}>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Pemasukan vs Pengeluaran (6 Bulan Terakhir)
      </h3>
      <div className="h-80">
        {data.every((d) => d.income === 0 && d.expense === 0) ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Belum ada data transaksi
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={8}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000000}Jt`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === "income" ? "Pemasukan" : "Pengeluaran",
              ]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">
                  {value === "income" ? "Pemasukan" : "Pengeluaran"}
                </span>
              )}
            />
            <Bar dataKey="income" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
