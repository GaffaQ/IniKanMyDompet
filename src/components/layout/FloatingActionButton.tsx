import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed z-50 w-14 h-14 rounded-full gradient-primary",
        "flex items-center justify-center",
        "shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40",
        "transition-all duration-300 hover:scale-110 active:scale-95",
        "bottom-24 right-6 lg:bottom-8 lg:right-8",
        "animate-bounce-in"
      )}
      aria-label="Tambah Transaksi"
    >
      <Plus className="w-7 h-7 text-primary-foreground" />
    </button>
  );
}
