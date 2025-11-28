import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Transaction } from "@/logic/types/transactionTypes";
import { Category } from "@/logic/types/transactionTypes";
import { getExpenseByCategory } from "@/logic/stats/useStats";

interface ExpenseCategoryChartProps {
  transactions: Transaction[];
  categories: Category[];
}

export function ExpenseCategoryChart({ transactions, categories }: ExpenseCategoryChartProps) {
  const expenseByCategory = getExpenseByCategory(transactions);
  
  // Map categories dengan color dan value
  const data = categories
    .map((cat) => ({
      name: cat.name,
      value: expenseByCategory[cat.name] || 0,
      color: cat.color || "#8B5CF6",
    }))
    .filter((item) => item.value > 0) // Hanya tampilkan kategori yang ada expense-nya
    .sort((a, b) => b.value - a.value); // Sort by value descending
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Pengeluaran per Kategori
      </h3>
      <div className="h-80">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Belum ada data pengeluaran
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ 
                paddingTop: "20px",
                color: "hsl(var(--foreground))"
              }}
              iconType="circle"
              formatter={(value) => (
                <span style={{ color: "hsl(var(--foreground))" }} className="text-sm">{value}</span>
              )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
