import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant: "income" | "expense" | "balance";
  delay?: number;
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  trend,
  variant,
  delay = 0,
}: SummaryCardProps) {
  const variants = {
    income: {
      gradient: "gradient-accent",
      glow: "shadow-glow-accent",
      iconBg: "bg-accent/20",
      iconColor: "text-accent",
    },
    expense: {
      gradient: "gradient-expense",
      glow: "shadow-[0_0_20px_hsl(0_84%_60%/0.3)]",
      iconBg: "bg-destructive/20",
      iconColor: "text-destructive",
    },
    balance: {
      gradient: "gradient-primary",
      glow: "shadow-glow",
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
    },
  };

  const v = variants[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl glass p-6 transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-lg animate-slide-up"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background decoration */}
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20",
          v.gradient
        )}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-xl", v.iconBg)}>
            <Icon className={cn("w-6 h-6", v.iconColor)} />
          </div>
          {trend && (
            <span
              className={cn(
                "text-sm font-medium px-2 py-1 rounded-lg",
                trend.isPositive
                  ? "bg-accent/10 text-accent"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl lg:text-3xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
