import { useState } from "react";
import { User, Target, TrendingUp, Info, Receipt, FolderOpen } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSavingsTarget } from "@/logic/hooks/useSavingsTarget";
import { toast } from "sonner";
import { useTransactionStore } from "@/logic/hooks/useTransactionStore";
import { useCategoryStore } from "@/logic/hooks/useCategoryStore";
import { getMonthlyAggregation } from "@/logic/stats/useStats";

const Profile = () => {
  const { categories } = useCategoryStore();
  const { transactions } = useTransactionStore(categories);
  const { target, setSavingsTarget, calculateTarget, isLoading, error } = useSavingsTarget();
  
  const [percentage, setPercentage] = useState<string>(target?.percentage.toString() || "25");

  // Get current month income
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const { monthlyIncome } = getMonthlyAggregation(transactions);
  const currentMonthIncome = monthlyIncome[currentMonth] || 0;
  const savingsTargetAmount = calculateTarget(currentMonthIncome);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSave = () => {
    const percentageNum = parseFloat(percentage);
    
    if (isNaN(percentageNum)) {
      toast.error("Persentase harus berupa angka");
      return;
    }
    
    if (percentageNum < 0 || percentageNum > 100) {
      toast.error("Persentase harus antara 0 dan 100");
      return;
    }

    try {
      setSavingsTarget(percentageNum);
      toast.success("Target menabung berhasil disimpan");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan target menabung");
    }
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan dan target menabung Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Info */}
          <div className="glass rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Pengguna</h2>
                <p className="text-sm text-muted-foreground">Kelola keuangan Anda dengan mudah</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transaksi</p>
                  <p className="text-lg font-semibold text-foreground">{transactions.length}</p>
                </div>
                <Receipt className="w-8 h-8 text-primary" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                <div>
                  <p className="text-sm text-muted-foreground">Total Kategori</p>
                  <p className="text-lg font-semibold text-foreground">{categories.length}</p>
                </div>
                <FolderOpen className="w-8 h-8 text-accent" />
              </div>
            </div>
          </div>

          {/* Savings Target */}
          <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Target Menabung</h2>
                <p className="text-sm text-muted-foreground">Tetapkan persentase menabung bulanan</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="percentage" className="text-sm font-medium text-foreground">
                  Persentase Menabung (%)
                </Label>
                <div className="relative">
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    className="h-12 bg-secondary border-0 pr-12"
                    placeholder="25"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Masukkan persentase menabung yang ingin Anda capai setiap bulan (0-100%)
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                onClick={handleSave}
                className="w-full h-12 gradient-accent text-accent-foreground shadow-glow-accent"
                disabled={isLoading}
              >
                Simpan Target
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Current Month Info */}
          <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Bulan Ini
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pemasukan Bulan Ini</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(currentMonthIncome)}</p>
              </div>
              {target && (
                <div className="pt-3 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Target Menabung</p>
                  <p className="text-xl font-bold text-accent">{formatCurrency(savingsTargetAmount)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {target.percentage}% dari pemasukan
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Tentang Target Menabung</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Target menabung dihitung berdasarkan persentase dari total pemasukan bulan ini. 
                  Anda akan mendapat notifikasi jika saldo Anda kurang dari target yang ditetapkan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;

