import { useState, useEffect } from "react";
import { X, Calendar, DollarSign, FileText, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactionStore } from "@/logic/hooks/useTransactionStore";
import { useCategoryStore } from "@/logic/hooks/useCategoryStore";
import { useSavingsTarget } from "@/logic/hooks/useSavingsTarget";
import { CreateTransactionInput } from "@/logic/types/transactionTypes";
import { toast } from "sonner";
import { getMonthlyAggregation } from "@/logic/stats/useStats";
import { AlertTriangle } from "lucide-react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransactionId?: string;
}

export function TransactionModal({ isOpen, onClose, editingTransactionId }: TransactionModalProps) {
  const { categories } = useCategoryStore();
  const { transactions, addTransaction, updateTransaction, getStats } = useTransactionStore(categories);
  const { target, calculateTarget, hasReachedTarget, getTargetDifference } = useSavingsTarget();
  
  const [type, setType] = useState<"income" | "expense">("expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [showTargetWarning, setShowTargetWarning] = useState(false);

  // Load editing transaction data
  useEffect(() => {
    if (editingTransactionId && isOpen) {
      const transaction = transactions.find((tx) => tx.id === editingTransactionId);
      if (transaction) {
        setType(transaction.type);
        setName(transaction.name);
        setAmount(transaction.amount.toString());
        setCategory(transaction.category);
        setDate(transaction.date);
        setNote(transaction.note || "");
      }
    } else if (isOpen) {
      // Reset form for new transaction
      setType("expense");
      setName("");
      setAmount("");
      setCategory(categories.length > 0 ? categories[0].name : "");
      setDate(new Date().toISOString().split("T")[0]);
      setNote("");
    }
  }, [editingTransactionId, isOpen, transactions, categories]);

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  // Check target warning when amount or type changes
  useEffect(() => {
    if (isOpen && type === "expense" && amount && target) {
      const amountNum = parseFloat(amount);
      if (!isNaN(amountNum) && amountNum > 0) {
        const currentMonth = date.substring(0, 7);
        const { monthlyIncome } = getMonthlyAggregation(transactions);
        const currentMonthIncome = monthlyIncome[currentMonth] || 0;
        const stats = getStats();
        const currentBalance = stats.balance;
        const savingsTarget = calculateTarget(currentMonthIncome);
        
        // Check if adding this expense would make balance below target
        const newBalance = currentBalance - amountNum;
        if (newBalance < savingsTarget && currentMonthIncome > 0) {
          setShowTargetWarning(true);
        } else {
          setShowTargetWarning(false);
        }
      }
    } else {
      setShowTargetWarning(false);
    }
  }, [amount, type, date, target, transactions, isOpen, calculateTarget, getStats]);

  const handleSubmit = () => {
    try {
      if (!name.trim()) {
        toast.error("Nama transaksi harus diisi");
        return;
      }
      if (!amount || parseFloat(amount) <= 0) {
        toast.error("Jumlah harus lebih besar dari 0");
        return;
      }
      if (!category) {
        toast.error("Kategori harus dipilih");
        return;
      }
      if (!date) {
        toast.error("Tanggal harus diisi");
        return;
      }

      const input: CreateTransactionInput = {
        name: name.trim(),
        amount: parseFloat(amount),
        type,
        category,
        date,
        note: note.trim() || undefined,
      };

      // Check target warning before submitting
      if (type === "expense" && target) {
        const currentMonth = date.substring(0, 7);
        const { monthlyIncome } = getMonthlyAggregation(transactions);
        const currentMonthIncome = monthlyIncome[currentMonth] || 0;
        const stats = getStats();
        const currentBalance = stats.balance;
        const savingsTarget = calculateTarget(currentMonthIncome);
        const newBalance = currentBalance - parseFloat(amount);
        
        if (newBalance < savingsTarget && currentMonthIncome > 0) {
          toast.warning(
            `Target menabung bulan ini (${formatCurrency(savingsTarget)}) sudah terlewat!`,
            {
              description: `Saldo setelah transaksi ini akan menjadi ${formatCurrency(newBalance)}`,
              duration: 5000,
            }
          );
        }
      }

      if (editingTransactionId) {
        updateTransaction({
          id: editingTransactionId,
          ...input,
        });
        toast.success("Transaksi berhasil diupdate");
      } else {
        addTransaction(input);
        toast.success("Transaksi berhasil ditambahkan");
      }

      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan transaksi");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-lg">
        <div className="glass-strong rounded-2xl shadow-2xl animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <h2 className="text-xl font-semibold text-foreground">
              {editingTransactionId ? "Edit Transaksi" : "Tambah Transaksi"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Target Warning Alert */}
            {showTargetWarning && target && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-slide-up">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-destructive mb-1">
                      Target Menabung Akan Terlewat
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pengeluaran ini akan membuat saldo Anda di bawah target menabung bulan ini ({formatCurrency(calculateTarget(getMonthlyAggregation(transactions).monthlyIncome[date.substring(0, 7)] || 0))}).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Type Toggle */}
            <div className="flex rounded-xl bg-secondary p-1">
              <button
                onClick={() => setType("expense")}
                className={cn(
                  "flex-1 py-3 rounded-lg font-medium transition-all",
                  type === "expense"
                    ? "bg-destructive text-destructive-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Pengeluaran
              </button>
              <button
                onClick={() => setType("income")}
                className={cn(
                  "flex-1 py-3 rounded-lg font-medium transition-all",
                  type === "income"
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Pemasukan
              </button>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Nama Transaksi
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Contoh: Makan Siang"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-11 h-12 bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                Jumlah
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="1"
                  className="pl-11 h-12 bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </div>

            {/* Category & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Kategori</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 bg-secondary border-0 focus:ring-2 focus:ring-primary">
                    <Tag className="w-5 h-5 text-muted-foreground mr-2" />
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-foreground">
                  Tanggal
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-11 h-12 bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note" className="text-sm font-medium text-foreground">
                Catatan (opsional)
              </Label>
              <Textarea
                id="note"
                placeholder="Tambahkan catatan..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border/50 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              className={cn(
                "flex-1 h-12 text-primary-foreground",
                type === "income" ? "gradient-accent shadow-glow-accent" : "gradient-primary shadow-glow"
              )}
            >
              Simpan
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
