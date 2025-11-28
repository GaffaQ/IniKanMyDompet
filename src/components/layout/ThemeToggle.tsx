import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-14 h-8 rounded-full transition-colors duration-300",
        "bg-secondary hover:bg-secondary/80",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      )}
      aria-label="Toggle theme"
    >
      <div
        className={cn(
          "absolute top-1 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center",
          theme === "dark"
            ? "left-7 bg-primary text-primary-foreground"
            : "left-1 bg-warning text-warning-foreground"
        )}
      >
        {theme === "dark" ? (
          <Moon className="w-3.5 h-3.5" />
        ) : (
          <Sun className="w-3.5 h-3.5" />
        )}
      </div>
    </button>
  );
}
