import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Transaction } from "@/logic/types/transactionTypes";
import { getDailyExpenses } from "@/logic/stats/useStats";

interface DailyExpenseChartProps {
  transactions: Transaction[];
}

export function DailyExpenseChart({ transactions }: DailyExpenseChartProps) {
  const dailyExpenses = getDailyExpenses(transactions);
  
  // Get last 7 days
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  
  const data = last7Days.map((date) => {
    const dateStr = date.toISOString().split("T")[0];
    const dayName = dayNames[date.getDay()];
    return {
      day: dayName,
      expense: dailyExpenses[dateStr] || 0,
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
    <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Pengeluaran Harian (7 Hari Terakhir)
      </h3>
      <div className="h-80">
        {data.every((d) => d.expense === 0) ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Belum ada data pengeluaran
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
            <defs>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000}K`}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Pengeluaran"]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill="url(#colorExpense)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
