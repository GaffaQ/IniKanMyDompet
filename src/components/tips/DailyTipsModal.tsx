/**
 * Daily Tips Modal - Menampilkan tips menabung setiap hari
 */

import { useState, useEffect } from "react";
import { X, Lightbulb, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getTodayTip } from "@/data/dailyTips";

interface DailyTipsModalProps {
  autoClose?: boolean; // Auto close setelah beberapa detik
  autoCloseDelay?: number; // Delay dalam milliseconds (default: 10 detik)
}

export function DailyTipsModal({ autoClose = true, autoCloseDelay = 10000 }: DailyTipsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tip, setTip] = useState(getTodayTip());

  useEffect(() => {
    // Always show modal when component mounts (every time user visits/refreshes)
    setIsOpen(true);
    setTip(getTodayTip()); // Get fresh tip
  }, []);

  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "budgeting":
        return "bg-primary/20 text-primary";
      case "saving":
        return "bg-accent/20 text-accent";
      case "spending":
        return "bg-destructive/20 text-destructive";
      case "planning":
        return "bg-warning/20 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "budgeting":
        return "Penganggaran";
      case "saving":
        return "Menabung";
      case "spending":
        return "Pengeluaran";
      case "planning":
        return "Perencanaan";
      default:
        return "Tips";
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-lg animate-scale-in">
        <div className="glass-strong rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Tips Hari Ini</h2>
                  <p className="text-sm text-muted-foreground">Kata-kata motivasi untuk menabung</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Category Badge */}
              <div className="flex items-center gap-2">
                <span className={cn("px-3 py-1 rounded-full text-xs font-medium", getCategoryColor(tip.category))}>
                  {getCategoryLabel(tip.category)}
                </span>
                <Sparkles className="w-4 h-4 text-muted-foreground" />
              </div>

              {/* Tip Title */}
              <h3 className="text-lg font-semibold text-foreground">
                {tip.title}
              </h3>

              {/* Tip Message */}
              <p className="text-muted-foreground leading-relaxed">
                {tip.message}
              </p>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border/50 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {autoClose && `Modal akan tertutup otomatis dalam beberapa detik`}
              </p>
              <Button
                onClick={handleClose}
                className="gradient-primary text-primary-foreground shadow-glow"
              >
                Mengerti
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

